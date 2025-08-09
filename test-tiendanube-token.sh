#!/bin/bash

# Test TiendaNube Token directly
# Usage: ./test-tiendanube-token.sh <TOKEN> <STORE_ID>

TOKEN=$1
STORE_ID=$2

if [ -z "$TOKEN" ] || [ -z "$STORE_ID" ]; then
    echo "Usage: $0 <TOKEN> <STORE_ID>"
    echo "Example: $0 'your-token-here' '1234567'"
    exit 1
fi

echo "Testing TiendaNube API with:"
echo "Store ID: $STORE_ID"
echo "Token: ${TOKEN:0:20}...${TOKEN: -10}"
echo ""
echo "Making request to: https://api.tiendanube.com/v1/$STORE_ID/coupons"
echo ""

# Make the API call
response=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -H "User-Agent: SpinWheel/1.0" \
    "https://api.tiendanube.com/v1/$STORE_ID/coupons?per_page=1")

# Extract status code and body
body=$(echo "$response" | sed '$d')
status_code=$(echo "$response" | tail -n 1)

echo "Status Code: $status_code"
echo "Response Body:"
echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"

if [ "$status_code" = "401" ]; then
    echo ""
    echo "❌ Authentication failed! The token is invalid or expired."
    echo "You need to reconnect the TiendaNube integration."
elif [ "$status_code" = "200" ]; then
    echo ""
    echo "✅ Token is valid and working!"
else
    echo ""
    echo "⚠️ Unexpected status code: $status_code"
fi