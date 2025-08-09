# Vercel Environment Variables

The following environment variables need to be configured in your Vercel project settings:

## Required Variables

1. **VITE_SUPABASE_URL**
   - Your Supabase project URL
   - Example: `https://xxxxx.supabase.co`

2. **VITE_SUPABASE_ANON_KEY**
   - Your Supabase anonymous (public) key
   - Used for client-side authentication

3. **SUPABASE_SERVICE_ROLE_KEY**
   - Your Supabase service role key (secret)
   - Used for server-side operations in API functions
   - ⚠️ Keep this secret and never expose it to the client

4. **VITE_TIENDANUBE_CLIENT_ID**
   - Your TiendaNube application Client ID
   - Get this from your TiendaNube app configuration

5. **VITE_TIENDANUBE_CLIENT_SECRET**
   - Your TiendaNube application Client Secret
   - Get this from your TiendaNube app configuration
   - ⚠️ Keep this secret

## How to Set in Vercel

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add each variable with its value
4. Make sure to apply them to the Production environment
5. Redeploy your application after adding the variables

## Important Notes

- Variables starting with `VITE_` are exposed to the client
- `SUPABASE_SERVICE_ROLE_KEY` should NEVER be exposed to the client
- After setting variables, you need to redeploy for changes to take effect