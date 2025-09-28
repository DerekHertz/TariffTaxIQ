# Version History

## v1.1.0 - Major UI & API Enhancements (2025-09-28)

### New Features
- **Calculator-Style UI**: Redesigned interface to look like an actual calculator with LCD-style display
- **Live Tariff Updates**: Integration with USITC API for real-time official tariff rates
- **Dynamic Product Pricing**: Automatic price defaults based on selected product type (e.g., $800 for smartphones, $35,000 for cars)
- **Side-by-Side Layout**: Product selection and calculator in parallel columns
- **Real-World Product Database**: Top 10 US consumer imports with actual HS codes and data

### API Enhancements
- **New Endpoints**:
  - `POST /api/update-tariffs` - Update tariff rates from USITC HTS API
  - `GET /api/tariff-info/{hs_code}` - Get current official tariff information
- **USITC Integration**: Automatic fetching of official US tariff schedule data
- **Enhanced Error Handling**: Improved API error responses and logging

### UI/UX Improvements
- **Calculator Interface**: Green LCD display with large preset tariff buttons (10%, 25%, 50%, 100%)
- **Product List Redesign**: Single-column scrollable list with inline tariff information
- **Simplified Product Info**: Streamlined display showing only essential tariff data
- **Real-Time Calculations**: Debounced API calls for smooth user experience

### Technical Updates
- **Backend Dependencies**: Updated FastAPI (0.116.1), pytest (8.4.1), and other packages
- **Code Quality**: Comprehensive code cleanup, documentation, and comment improvements
- **Error Handling**: Enhanced async error handling and user feedback
- **Performance**: Optimized API calls with proper debouncing

### Data Improvements
- **Updated Product Database**: Real consumer goods (smartphones, cars, laptops, pharmaceuticals, etc.)
- **Official HS Codes**: Accurate Harmonized System classification codes
- **Current Tariff Rates**: Live data from US International Trade Commission
- **Economic Modeling**: Improved demand/supply elasticity calculations

### Development Experience
- **GitHub Ready**: Professional README, code documentation, and project structure
- **Testing**: Updated test integration for USITC API functionality
- **Configuration**: Improved environment handling and CORS setup

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