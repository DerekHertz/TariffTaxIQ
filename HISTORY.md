# Version History

## v1.0.0 - Initial Release (2025-08-03)

### Features
- FastAPI backend with tariff calculation endpoints
- React frontend with interactive calculator
- Product database with HS codes and elasticity data
- Tariff impact analysis with price projections

### Infrastructure
- Backend deployed to Railway
- Frontend deployed to Vercel
- Cloudflare proxy for API (api.tarifftaxiq.org)
- Custom domain: tarifftaxiq.org

### API Endpoints
- `GET /api/products` - List all products
- `GET /api/products/{hs_code}` - Get specific product
- `POST /api/calculate` - Calculate tariff impact
- `GET /api/tariff-scenarios` - Get predefined scenarios

### Technical Stack
- Backend: FastAPI, Python 3.11, Uvicorn
- Frontend: React 19, Vite, TailwindCSS
- Database: JSON-based sample data
- Testing: Pytest, React Testing Library