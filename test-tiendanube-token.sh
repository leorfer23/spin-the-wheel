#!/bin/bash

# This script tests the Tienda Nube token exchange endpoint
# Replace the values below with your actual values

CLIENT_ID="19912"
CLIENT_SECRET="665ed563a34091b12706677e07aa90e7b7a6f8555c6499f8"
CODE="95eafbce4af91b817b125463c1cae8cad0c019dc"  # This code might be expired, replace with fresh one if needed

echo "Testing Tienda Nube token exchange..."
echo "Client ID: $CLIENT_ID"
echo "Client Secret length: ${#CLIENT_SECRET}"
echo ""

# Test with JSON body as per Tienda Nube docs
echo "Testing with JSON body..."
curl -X POST "https://www.tiendanube.com/apps/authorize/token" \
  -H "Content-Type: application/json" \
  -d "{\"client_id\": \"$CLIENT_ID\", \"client_secret\": \"$CLIENT_SECRET\", \"grant_type\": \"authorization_code\", \"code\": \"$CODE\"}" \
  -v

echo ""
echo ""

# Alternative test with form data (in case docs are wrong)
echo "Testing with form data..."
curl -X POST "https://www.tiendanube.com/apps/authorize/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=$CLIENT_ID&client_secret=$CLIENT_SECRET&grant_type=authorization_code&code=$CODE" \
  -v