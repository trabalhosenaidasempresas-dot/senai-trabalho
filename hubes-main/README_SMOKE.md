Smoke tests (smoke-test.js)

This project includes a smoke test script to verify critical endpoints (login + create endpoints + file upload).

How to run locally

1. From the project root (where docker-compose.yml is), ensure the services are up (docker-compose up -d --build).
2. Run the smoke tests:

   node smoke-test.js

Environment variables (optional)
- BASE_URL: base URL for the services (default http://localhost)
- ADMIN_EMAIL: admin email (default admin@secult.com)
- ADMIN_SENHA: admin password (default admin123)
- SMOKE_OUTPUT: path to save results (default smoke-results.json)

Notes
- The script uses curl for multipart file upload (document). Ensure curl is available in the execution environment. CI runners typically have curl installed.
- The script returns exit code 0 on success and non-zero if any test failed.
- Use this in CI to run a quick smoke verification after deployment.
