# Tienda Nube Integration Guide

## Overview

This guide explains how to set up and use the Tienda Nube OAuth integration for the Spin Wheel platform.

## Setup

### 1. Environment Variables

Add the following environment variables to your `.env` file:

```bash
# Tienda Nube OAuth credentials
VITE_TIENDANUBE_APP_ID=your_app_id_here
VITE_TIENDANUBE_CLIENT_SECRET=your_client_secret_here
VITE_REDIRECT_URI=http://localhost:5173/api/integrations/callback
```

### 2. Database Migration

Run the database migration to create the necessary tables:

```bash
# Apply the migration using your Supabase CLI or dashboard
supabase migration up
```

This creates:
- `oauth_states` table for managing OAuth flow state
- `store_integrations` table for storing platform-specific integration data
- Updates to the `stores` table to link with integrations

### 3. Register Your App with Tienda Nube

1. Go to [Tienda Nube Partners Portal](https://partners.tiendanube.com)
2. Create a new app
3. Set the redirect URI to match your environment:
   - Development: `http://localhost:5173/api/integrations/callback`
   - Production: `https://your-domain.com/api/integrations/callback`
4. Copy the App ID and Client Secret to your `.env` file

## Usage

### Connecting a Store

1. In the dashboard, click "Agregar tienda" (Add Store)
2. Select "Tiendanube" as the platform
3. Choose "Conectar con Tienda Nube" (Connect with Tienda Nube)
4. Click "Conectar con Tienda Nube" button
5. You'll be redirected to Tienda Nube to authorize the app
6. After authorization, you'll be redirected back to the dashboard
7. The store will be automatically created and linked

### Manual Store Creation

If you prefer manual setup:
1. Select "Configuración manual" (Manual Configuration)
2. Enter the store name and URL
3. Click "Agregar tienda" (Add Store)

## API Endpoints

### POST /api/integrations/oauth
Initiates the OAuth flow for Tienda Nube.

**Request Body:**
```json
{
  "platform": "tiendanube",
  "storeName": "Optional store name",
  "storeId": "Optional existing store ID"
}
```

**Response:**
```json
{
  "authUrl": "https://www.tiendanube.com/apps/{app_id}/authorize?...",
  "state": "unique_state_token"
}
```

### GET /api/integrations/callback
Handles the OAuth callback from Tienda Nube.

**Query Parameters:**
- `code`: Authorization code from Tienda Nube
- `state`: State token for validation
- `error`: Error message if authorization failed

### GET /api/integrations/status/:storeId
Get the integration status for a store.

**Response:**
```json
{
  "connected": true,
  "integration": {
    "id": "integration_id",
    "platform": "tiendanube",
    "status": "active",
    "platform_store_name": "Mi Tienda",
    "platform_store_domain": "mitienda.mitiendanube.com"
  }
}
```

### DELETE /api/integrations/:storeId
Disconnect the integration for a store.

## Data Flow

1. **OAuth Initiation**
   - User clicks connect → Generate state token → Store in `oauth_states` table → Redirect to Tienda Nube

2. **OAuth Callback**
   - Receive auth code → Validate state → Exchange code for token → Fetch store info → Create/update integration

3. **Store Creation**
   - If no store exists → Create store with Tienda Nube info
   - If store exists → Update with integration details

4. **Token Storage**
   - Access tokens are stored encrypted in `store_integrations` table
   - Refresh tokens stored for future token renewal
   - Platform metadata includes store details from Tienda Nube API

## Security

- OAuth state tokens expire after 10 minutes
- All tokens are stored encrypted in the database
- Row-level security (RLS) ensures users can only access their own integrations
- HTTPS required in production for OAuth callbacks

## Troubleshooting

### Common Issues

1. **"Invalid state" error**
   - The OAuth state has expired or is invalid
   - Solution: Try connecting again

2. **"Failed to exchange code for token"**
   - The authorization code is invalid or expired
   - Solution: Ensure credentials are correct and try again

3. **Store not syncing**
   - The API call to fetch store info may have failed
   - Store is still created but without Tienda Nube metadata
   - Solution: Check network and try reconnecting

## Future Enhancements

- [ ] Token refresh implementation
- [ ] Webhook support for real-time updates
- [ ] Product sync from Tienda Nube
- [ ] Order tracking integration
- [ ] Multi-store support per user