#!/bin/bash

echo "🔍 Getting integration data from Supabase..."

# First, get the integration data using the test endpoint
INTEGRATION_DATA=$(curl -s http://localhost:3001/api/tiendanube/test | jq '.tests.tiendanube.integration')

if [ "$INTEGRATION_DATA" = "null" ]; then
    echo "❌ No integration found"
    exit 1
fi

PLATFORM_STORE_ID=$(echo $INTEGRATION_DATA | jq -r '.platform_store_id')
echo "✅ Found platform_store_id: $PLATFORM_STORE_ID"

# Now we need to get the actual access token from Supabase
# Since we can't do that from bash easily, let's use a different approach
echo ""
echo "📝 To test the proxy, you need to:"
echo "1. Go to your Supabase dashboard"
echo "2. Run this SQL query:"
echo ""
echo "SELECT access_token FROM spinawheel.store_integrations"
echo "WHERE platform_store_id = '$PLATFORM_STORE_ID'"
echo "AND status = 'active';"
echo ""
echo "3. Then test the proxy with:"
echo ""
echo "curl -H \"Authorization: Bearer YOUR_ACCESS_TOKEN\" \\"
echo "     http://localhost:3001/api/tiendanube/proxy/$PLATFORM_STORE_ID/coupons"
echo ""