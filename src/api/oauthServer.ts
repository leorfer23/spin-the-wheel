import type { Plugin } from "vite";
import { createClient } from "@supabase/supabase-js";
import { TiendaNubeAuthService } from "../services/integrations/tiendanube/authService";

// Lazy-load Supabase client to avoid initialization during config loading
let supabase: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (!supabase) {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
    // Use service role key for server-side operations to bypass RLS
    const supabaseKey =
      process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY ||
      "";

    if (!supabaseUrl || !supabaseKey) {
      console.error("Supabase configuration missing:", {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey,
      });
      throw new Error(
        "VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY are required in .env file"
      );
    }

    console.log("Initializing Supabase client with:", {
      url: supabaseUrl,
      keyType: process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
        ? "service_role"
        : "anon",
      schema: "spinawheel",
    });

    supabase = createClient(supabaseUrl, supabaseKey, {
      db: {
        schema: "spinawheel",
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }) as any;
  }
  return supabase;
}

export function oauthAPIPlugin(): Plugin {
  const tiendaNubeAuth = new TiendaNubeAuthService();

  // Validate config on startup
  if (!tiendaNubeAuth.validateConfig()) {
    console.error(
      "WARNING: TiendaNube OAuth configuration is incomplete. Please set VITE_TIENDANUBE_CLIENT_SECRET in .env file"
    );
  }

  return {
    name: "oauth-api",
    configureServer(server) {
      // POST /api/integrations/oauth - Initiate OAuth flow
      server.middlewares.use(async (req, res, next) => {
        if (req.url === "/api/integrations/oauth" && req.method === "POST") {
          let body = "";
          req.on("data", (chunk) => {
            body += chunk.toString();
          });
          req.on("end", async () => {
            try {
              const data = JSON.parse(body);
              const { storeId, storeName, platform, userId } = data;

              if (platform !== "tiendanube") {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: "Unsupported platform" }));
                return;
              }

              // Simple state with just the essential info
              const state = JSON.stringify({
                storeId: storeId || "",
                storeName: storeName || "Mi Tienda",
                userId: userId || "",
                platform,
              });

              // Encode state for URL
              const encodedState = Buffer.from(state).toString("base64");

              // Get OAuth URL with encoded state
              const authUrl = tiendaNubeAuth.getAuthUrl(encodedState);

              res.setHeader("Content-Type", "application/json");
              res.setHeader("Access-Control-Allow-Origin", "*");
              res.setHeader(
                "Access-Control-Allow-Methods",
                "GET, POST, OPTIONS"
              );
              res.setHeader(
                "Access-Control-Allow-Headers",
                "Content-Type, Authorization"
              );

              res.statusCode = 200;
              res.end(JSON.stringify({ authUrl }));
            } catch (error) {
              console.error("OAuth initiation error:", error);
              res.statusCode = 500;
              res.end(
                JSON.stringify({
                  error:
                    error instanceof Error
                      ? error.message
                      : "Failed to initiate OAuth",
                })
              );
            }
          });
          return;
        }

        // GET /api/integrations/callback - OAuth callback
        if (
          req.url?.startsWith("/api/integrations/callback") &&
          req.method === "GET"
        ) {
          try {
            const url = new URL(req.url, `http://localhost:5173`);
            const code = url.searchParams.get("code");
            const state = url.searchParams.get("state");
            const error = url.searchParams.get("error");

            if (error) {
              // Redirect to dashboard with error
              res.statusCode = 302;
              res.setHeader(
                "Location",
                `/dashboard?integration_error=${encodeURIComponent(error)}`
              );
              res.end();
              return;
            }

            if (!code || !state) {
              res.statusCode = 302;
              res.setHeader(
                "Location",
                "/dashboard?integration_error=missing_params"
              );
              res.end();
              return;
            }

            // Decode state from base64
            let stateData;
            try {
              const decodedState = Buffer.from(state, "base64").toString(
                "utf-8"
              );
              stateData = JSON.parse(decodedState);
            } catch (e) {
              console.error("Failed to decode state:", e);
              res.statusCode = 302;
              res.setHeader(
                "Location",
                "/dashboard?integration_error=invalid_state"
              );
              res.end();
              return;
            }

            const { storeName, storeId, userId } = stateData;

            // Exchange code for token
            console.log("Exchanging code for token...");
            const tokenData = await tiendaNubeAuth.exchangeCodeForToken(code);
            console.log("Token data received:", {
              user_id: tokenData.user_id,
              has_access_token: !!tokenData.access_token,
              token_type: tokenData.token_type,
              scope: tokenData.scope,
            });

            // Fetch store information
            let storeInfo;
            try {
              console.log(
                "Attempting to fetch store info with user_id:",
                tokenData.user_id
              );
              storeInfo = await tiendaNubeAuth.fetchStoreInfo(
                tokenData.access_token,
                tokenData.user_id
              );
              console.log("Store info fetched successfully:", storeInfo);
            } catch (error) {
              console.error("Failed to fetch store info:", error);
              // Continue without store info
            }

            // Create or update store integration
            let finalStoreId = storeId;

            // If no store exists, create or find one
            if (!finalStoreId && userId) {
              const finalStoreName = storeInfo?.store_name || storeName || "Mi Tienda";
              
              console.log("Looking for existing store or creating new one:", {
                user_id: userId,
                store_name: finalStoreName,
                platform: 'tienda_nube',
              });

              // First, check if a store already exists for this user and store name
              const { data: existingStore } = await getSupabaseClient()!
                .from("stores")
                .select("*")
                .eq("user_id", userId)
                .eq("store_name", finalStoreName)
                .single();

              if (existingStore) {
                console.log("Found existing store:", existingStore);
                finalStoreId = existingStore.id;
                
                // Update the existing store with new information
                const { error: updateError } = await getSupabaseClient()!
                  .from("stores")
                  .update({
                    platform: 'tienda_nube',
                    store_url: storeInfo?.store_domain || existingStore.store_url || "",
                    is_active: true,
                    updated_at: new Date().toISOString(),
                  })
                  .eq("id", existingStore.id as string);
                  
                if (updateError) {
                  console.error("Store update error:", updateError);
                }
              } else {
                // Create new store
                console.log("Creating new store...");
                const { data: newStore, error: storeError } =
                  await getSupabaseClient()!
                    .from("stores")
                    .insert({
                      user_id: userId,
                      store_name: finalStoreName,
                      platform: 'tienda_nube',
                      store_url: storeInfo?.store_domain || "",
                      plan_tier: "free",
                      is_active: true,
                    })
                    .select()
                    .single();

                if (storeError) {
                  console.error("Store creation error:", storeError);
                  throw new Error(
                    `Failed to create store: ${storeError.message}`
                  );
                }

                console.log("Store created successfully:", newStore);
                finalStoreId = newStore.id;
              }
            }

            // Create or update integration
            const integrationData = {
              store_id: finalStoreId,
              platform: 'tienda_nube', // Use the correct enum value
              access_token: tokenData.access_token,
              refresh_token: tokenData.refresh_token || null,
              platform_store_id: tokenData.user_id?.toString() || null,
              platform_store_name: storeInfo?.store_name || null,
              platform_store_domain: storeInfo?.store_domain || null,
              platform_store_email: storeInfo?.store_email || null,
              platform_metadata: {
                ...storeInfo?.raw_data,
                token_type: tokenData.token_type,
                scope: tokenData.scope,
              },
              status: "active",
              last_sync_at: new Date().toISOString(),
            };

            console.log("Upserting integration for store:", finalStoreId);

            // Use upsert to handle both create and update cases
            const { data: integration, error: integrationError } = await getSupabaseClient()!
              .from("store_integrations")
              .upsert(
                {
                  ...integrationData,
                  updated_at: new Date().toISOString(),
                },
                {
                  onConflict: 'store_id,platform'
                }
              )
              .select()
              .single();

            if (integrationError) {
              console.error("Integration upsert error:", integrationError);
              throw new Error(`Failed to create/update integration: ${integrationError.message}`);
            }

            console.log("Integration upserted successfully:", integration);

            // Update store with integration_id
            await getSupabaseClient()!
              .from("stores")
              .update({
                integration_id: integration.id,
                store_url: storeInfo?.store_domain || "",
                updated_at: new Date().toISOString(),
              })
              .eq("id", finalStoreId);

            // Redirect to dashboard with success
            res.statusCode = 302;
            res.setHeader(
              "Location",
              `/dashboard?integration_success=true&store_id=${finalStoreId}`
            );
            res.end();
          } catch (error) {
            console.error("OAuth callback error:", error);
            res.statusCode = 302;
            res.setHeader(
              "Location",
              `/dashboard?integration_error=${encodeURIComponent(
                error instanceof Error ? error.message : "callback_failed"
              )}`
            );
            res.end();
          }
          return;
        }

        // GET /api/integrations/status/:storeId - Get integration status
        if (
          req.url?.match(/^\/api\/integrations\/status\/[^/]+/) &&
          req.method === "GET"
        ) {
          const matches = req.url.match(/\/api\/integrations\/status\/([^/]+)/);
          const storeId = matches?.[1] || "";

          try {
            const { data } = await getSupabaseClient()!
              .from("store_integrations")
              .select("*")
              .eq("store_id", storeId)
              .eq("platform", "tiendanube")
              .single();

            res.setHeader("Content-Type", "application/json");
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.statusCode = 200;
            res.end(
              JSON.stringify({
                connected: !!data && data.status === "active",
                integration: data,
              })
            );
          } catch {
            res.statusCode = 500;
            res.end(
              JSON.stringify({ error: "Failed to get integration status" })
            );
          }
          return;
        }

        // DELETE /api/integrations/:storeId - Disconnect integration
        if (
          req.url?.match(/^\/api\/integrations\/[^/]+/) &&
          req.method === "DELETE"
        ) {
          const matches = req.url.match(/\/api\/integrations\/([^/]+)/);
          const storeId = matches?.[1] || "";

          try {
            // Disconnect the integration
            await getSupabaseClient()!
              .from("store_integrations")
              .update({
                status: "disconnected",
                updated_at: new Date().toISOString(),
              })
              .eq("store_id", storeId)
              .eq("platform", "tiendanube");

            // Remove integration_id from store
            await getSupabaseClient()!
              .from("stores")
              .update({
                integration_id: null,
                updated_at: new Date().toISOString(),
              })
              .eq("id", storeId);

            res.setHeader("Content-Type", "application/json");
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true }));
          } catch {
            res.statusCode = 500;
            res.end(
              JSON.stringify({ error: "Failed to disconnect integration" })
            );
          }
          return;
        }

        // GET /api/tiendanube/proxy/* - Proxy TiendaNube API calls
        if (req.url?.startsWith("/api/tiendanube/proxy/") && req.method === "GET") {
          try {
            // Extract the TiendaNube API path from URL
            const proxyPath = req.url.replace("/api/tiendanube/proxy/", "");
            
            // Get authorization header from request (client sends Authorization)
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
              res.statusCode = 401;
              res.end(JSON.stringify({ error: "Missing or invalid authorization header" }));
              return;
            }
            
            // Extract token (remove "Bearer " prefix - case insensitive)
            const token = authHeader.replace(/^Bearer /i, "");
            const tiendaNubeUrl = `https://api.tiendanube.com/v1/${proxyPath}`;
            
            console.log(`[OAuth Server] [${new Date().toISOString()}] Proxying TiendaNube API call:`, {
              path: proxyPath,
              url: tiendaNubeUrl,
              hasToken: !!token,
              tokenLength: token.length,
              tokenFirst10: token.substring(0, 10),
              tokenLast5: token.substring(token.length - 5)
            });
            
            // Make the request to TiendaNube API
            // IMPORTANT: TiendaNube uses 'Authentication' header, not 'Authorization'!
            const response = await fetch(tiendaNubeUrl, {
              method: "GET",
              headers: {
                "Authentication": `bearer ${token}`, // TiendaNube uses Authentication, not Authorization!
                "Content-Type": "application/json",
                "User-Agent": "SpinWheel/1.0"
              }
            });
            
            const responseText = await response.text();
            
            console.log(`[OAuth Server] [${new Date().toISOString()}] TiendaNube API response:`, {
              status: response.status,
              statusText: response.statusText,
              ok: response.ok,
              contentLength: responseText.length
            });
            
            // Set CORS headers
            res.setHeader("Content-Type", "application/json");
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
            res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
            
            // Forward the response
            res.statusCode = response.status;
            res.end(responseText);
          } catch (error) {
            console.error("[OAuth Server] Proxy error:", error);
            res.statusCode = 500;
            res.end(JSON.stringify({ 
              error: "Proxy request failed",
              details: error instanceof Error ? error.message : String(error)
            }));
          }
          return;
        }
        
        // POST /api/tiendanube/proxy/* - Proxy TiendaNube API POST calls
        if (req.url?.startsWith("/api/tiendanube/proxy/") && req.method === "POST") {
          let body = "";
          req.on("data", (chunk) => {
            body += chunk.toString();
          });
          req.on("end", async () => {
            try {
              // Extract the TiendaNube API path from URL
              const proxyPath = req.url!.replace("/api/tiendanube/proxy/", "");
              
              // Get authorization header from request (client sends Authorization)
              const authHeader = req.headers.authorization;
              if (!authHeader || !authHeader.startsWith("Bearer ")) {
                res.statusCode = 401;
                res.end(JSON.stringify({ error: "Missing or invalid authorization header" }));
                return;
              }
              
              // Extract token (remove "Bearer " prefix - case insensitive)
              const token = authHeader.replace(/^Bearer /i, "");
              const tiendaNubeUrl = `https://api.tiendanube.com/v1/${proxyPath}`;
              
              console.log(`[OAuth Server] [${new Date().toISOString()}] Proxying TiendaNube API POST:`, {
                path: proxyPath,
                url: tiendaNubeUrl,
                hasToken: !!token,
                bodyLength: body.length
              });
              
              // Make the request to TiendaNube API  
              // IMPORTANT: TiendaNube uses 'Authentication' header, not 'Authorization'!
              const response = await fetch(tiendaNubeUrl, {
                method: "POST",
                headers: {
                  "Authentication": `bearer ${token}`, // TiendaNube uses Authentication, not Authorization!
                  "Content-Type": "application/json",
                  "User-Agent": "SpinWheel/1.0"
                },
                body: body
              });
              
              const responseText = await response.text();
              
              console.log(`[OAuth Server] [${new Date().toISOString()}] TiendaNube API POST response:`, {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok,
                contentLength: responseText.length
              });
              
              // Set CORS headers
              res.setHeader("Content-Type", "application/json");
              res.setHeader("Access-Control-Allow-Origin", "*");
              res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
              res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
              
              // Forward the response
              res.statusCode = response.status;
              res.end(responseText);
            } catch (error) {
              console.error("[OAuth Server] Proxy POST error:", error);
              res.statusCode = 500;
              res.end(JSON.stringify({ 
                error: "Proxy POST request failed",
                details: error instanceof Error ? error.message : String(error)
              }));
            }
          });
          return;
        }

        // OPTIONS handler for CORS preflight
        if (
          (req.url?.startsWith("/api/integrations/") || req.url?.startsWith("/api/tiendanube/")) &&
          req.method === "OPTIONS"
        ) {
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader(
            "Access-Control-Allow-Methods",
            "GET, POST, DELETE, OPTIONS"
          );
          res.setHeader(
            "Access-Control-Allow-Headers",
            "Content-Type, Authorization"
          );
          res.setHeader("Access-Control-Max-Age", "86400");
          res.statusCode = 204;
          res.end();
          return;
        }

        next();
      });
    },
  };
}
