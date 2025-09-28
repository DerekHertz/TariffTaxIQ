# TariffTax IQ

A full-stack web application for analyzing the impact of trade tariffs on consumer prices. Features real-world product data, economic modeling, and an interactive calculator interface.

## 🌐 Live Application

- **Website**: [tarifftaxiq.org](https://tarifftaxiq.org)
- **API**: [api.tarifftaxiq.org](https://api.tarifftaxiq.org)

## ✨ Features

### Interactive Calculator
- **Real-time calculations** with economic modeling
- **Calculator-style UI** with preset tariff rate buttons
- **Dynamic pricing** that adjusts based on selected products
- **Side-by-side interface** for product selection and calculations

### Real-World Product Database
- **Top 10 US consumer imports** (smartphones, cars, laptops, etc.)
- **Official HS codes** with harmonized tariff schedule data
- **Live tariff updates** from USITC (US International Trade Commission)
- **Economic data** including demand/supply elasticity

### Economic Modeling
- **Pass-through rate calculations** based on market elasticity
- **Price impact projections** for consumers
- **Tariff tax percentages** and import cost breakdowns
- **Inventory buffer analysis** for delayed price impacts

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library
- **Custom API client** - HTTP service layer

### Backend
- **FastAPI** - High-performance Python web framework
- **Uvicorn** - ASGI server for production
- **Pydantic** - Data validation and serialization
- **HTTPX** - Async HTTP client for external APIs
- **Pytest** - Testing framework

### Data Integration
- **USITC HTS API** - Official US tariff schedule data
- **Harmonized System codes** - International trade classification
- **Economic elasticity data** - Academic research sources

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** for frontend development
- **Python 3.9+** for backend development

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Opens http://localhost:3000
```

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
# Opens http://localhost:8000
```

## 📡 API Endpoints

### Product Data
- `GET /api/products` - List all products with tariff data
- `GET /api/products/{hs_code}` - Get specific product details
- `GET /api/tariff-info/{hs_code}` - Get current official tariff rates

### Calculations
- `POST /api/calculate` - Calculate tariff impact on consumer prices
- `GET /api/tariff-scenarios` - Get predefined tariff scenarios

### Data Management
- `POST /api/update-tariffs` - Update tariff rates from USITC API
- `GET /api/price-history/{hs_code}` - Historical price data (when available)

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest tests/ -v --cov=app

# Frontend tests
cd frontend
npm test
```

## 🌍 Production Deployment

### Architecture
- **Frontend**: Deployed on Vercel with CDN
- **Backend**: Deployed on Railway with auto-scaling
- **DNS & Proxy**: Cloudflare for performance and security

### Environment Variables
```bash
# Frontend (.env)
VITE_API_URL=https://api.tarifftaxiq.org

# Backend
CORS_ORIGINS=https://tarifftaxiq.org,https://www.tarifftaxiq.org
```

## 📖 Documentation

- **API Docs**: [Interactive Swagger UI](https://api.tarifftaxiq.org/docs)
- **ReDoc**: [Alternative API documentation](https://api.tarifftaxiq.org/redoc)
- **Change Log**: See [HISTORY.md](./HISTORY.md) for release notes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **USITC** for providing official tariff schedule data
- **Economic research** from academic institutions for elasticity data
- **Open source community** for the excellent tools and libraries used
