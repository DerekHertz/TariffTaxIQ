  # TariffTax IQ

  A full-stack web application for analyzing tariff impacts on consumer prices and economic
  outcomes.

  ## Live Application

  - **Website**: [tarifftaxiq.org](https://tarifftaxiq.org)
  - **API**: [api.tarifftaxiq.org](https://api.tarifftaxiq.org)

  ## Features

  - **Interactive Calculator**: Calculate tariff impact on retail prices
  - **Product Database**: HS codes with demand/supply elasticity data
  - **Economic Modeling**: Pass-through rates and price projections
  - **Scenario Analysis**: Compare current vs. proposed tariff rates
  - **Real-time API**: RESTful endpoints for tariff calculations

  ## Tech Stack

  ### Frontend
  - **React 19** - UI framework
  - **Vite** - Build tool and dev server
  - **TailwindCSS** - Styling
  - **Axios** - API client
  - **Recharts** - Data visualization

  ### Backend
  - **FastAPI** - Python web framework
  - **Uvicorn** - ASGI server
  - **Pydantic** - Data validation
  - **Pytest** - Testing framework

  ## Deployment

  ### Production
  - **Frontend**: Deployed on Vercel
  - **Backend**: Deployed on Railway
  - **Proxy**: Cloudflare for API routing and performance

  ### Development
  ```bash
  # Frontend
  cd frontend
  npm install
  npm run dev

  # Backend
  cd backend
  pip install -r requirements.txt
  uvicorn app.main:app --reload

  API Endpoints

  - GET /api/products - List all products with tariff data
  - GET /api/products/{hs_code} - Get specific product details
  - POST /api/calculate - Calculate tariff impact on prices
  - GET /api/tariff-scenarios - Get predefined tariff scenarios

  Testing

  # Backend tests
  cd backend
  pytest tests/ -v

  # Frontend tests
  cd frontend
  npm test

  Documentation

  - https://api.tarifftaxiq.org/docs - Interactive Swagger UI
  - HISTORY.md - Release notes and changes
