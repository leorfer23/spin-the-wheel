# Test Files Directory

This directory contains all test files organized by feature area.

## Structure

```
test/
├── integration/        # Integration tests for API proxy
├── tiendanube/        # TiendaNube OAuth and API tests  
├── wheel/             # Wheel component tests
├── widget/            # Widget embedding tests
└── jackpot/           # Jackpot game tests (existing)
```

## Integration Tests (`/test/integration/`)

- **test-coupon-proxy.html** - Browser-based test for coupon proxy endpoint
- **test-coupons-fetch.js** - Node.js script to test coupon fetching via proxy
- **test-proxy-direct.sh** - Shell script for direct proxy testing

## TiendaNube Tests (`/test/tiendanube/`)

- **test-oauth-callback-local.cjs** - OAuth callback testing
- **test-oauth-local.cjs** - OAuth flow testing
- **test-tiendanube-api.js** - Direct API testing
- **test-tiendanube-token.sh** - Token validation testing
- **tiendanube-test.html** - TiendaNube integration UI test

## Wheel Tests (`/test/wheel/`)

- **test-rotation-debug.js** - Wheel rotation physics debugging
- **test-wheel-alignment.html** - Visual wheel alignment test
- **logo-test.html** - Logo positioning test

## Widget Tests (`/test/widget/`)

- **test-widget.html** - Main widget embedding test
- **widget-test.html** - Widget functionality test
- **handle-widget-test.html** - Floating handle widget test

## Running Tests

### Integration Tests
```bash
# Run from project root
node test/integration/test-coupons-fetch.js
./test/integration/test-proxy-direct.sh

# Or open in browser
open http://localhost:3001/test/integration/test-coupon-proxy.html
```

### TiendaNube Tests
```bash
node test/tiendanube/test-tiendanube-api.js
./test/tiendanube/test-tiendanube-token.sh
```

### Visual Tests
Open the HTML files in a browser:
```bash
open test/wheel/test-wheel-alignment.html
open test/widget/test-widget.html
```

## Note

These are development and debugging tools. They should not be deployed to production.