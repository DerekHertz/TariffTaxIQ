"""
Tariff Tracker API

A FastAPI application that provides tariff calculation services and product data
for analyzing the impact of trade tariffs on consumer prices.

Features:
- Product database with real-world consumer goods
- Tariff impact calculations with economic modeling
- Live tariff rate updates from USITC data
- Cross-origin support for web frontend
"""

import json
from pathlib import Path
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from .tariff_service import TariffUpdateService

# Initialize FastAPI application
app = FastAPI(
    title="Tariff Tracker API",
    description="API for calculating tariff impacts on consumer prices",
    version="1.0.0",
)

# Configure CORS middleware for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Local development
        "https://tarifftaxiq.org",  # Production domain
        "https://www.tarifftaxiq.org",  # Production www subdomain
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Application configuration
current_dir = Path(__file__).parent
tariff_service = TariffUpdateService()

# Load product data from JSON file with fallback
try:
    with open(current_dir / "sample_data.json", "r") as file:
        SAMPLE_DATA = json.load(file)
except FileNotFoundError:
    # Fallback data for initial setup
    SAMPLE_DATA = {
        "products": [
            {
                "hs_code": "854430",
                "name": "Wiring Sets",
                "category": "Electronics",
                "demand_elasticity": -2.2,
                "supply_elasticity": 1.9,
                "unit": "kg",
                "country_of_origin": "China",
                "current_tariff_rate": 2.5,
                "proposed_tariff_rate": 25.0,
            }
        ]
    }


# Data Models
class Product(BaseModel):
    """Product model with tariff and economic data."""

    hs_code: str
    name: str
    category: str
    demand_elasticity: float
    supply_elasticity: float
    unit: str
    country_of_origin: str
    current_tariff_rate: float
    proposed_tariff_rate: float


class TariffCalculation(BaseModel):
    """Input parameters for tariff impact calculations."""

    retail_price: float
    retail_markup: float
    tariff_rate: float
    pass_through_rate: Optional[float] = None
    inventory_buffer: int = 0


class CalculationResult(BaseModel):
    """Results of tariff impact analysis."""

    import_cost: float
    tariff_amount: float
    tariff_passed: float
    future_price: float
    tariff_tax_pct: float
    price_increase_pct: float


# API Endpoints
@app.get("/")
async def root():
    return {"message": "Welcome to the Tariff Tracker API", "version": "1.0.0"}


@app.get("/api/products", response_model=List[Product])
async def get_products():
    """Retrieve a list of products with their elasticity data."""
    return SAMPLE_DATA["products"]


@app.get("/api/products/{hs_code}")
async def get_product(hs_code: str):
    """Retrieve a specific product by HS code."""
    product = next(
        (p for p in SAMPLE_DATA["products"] if p["hs_code"] == hs_code), None
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@app.post("/api/calculate", response_model=CalculationResult)
async def calculate_tariff(calc: TariffCalculation):
    """
    Calculate the tariff impact on consumer prices.

    Uses economic modeling to estimate how tariff costs are passed through
    to consumers based on market dynamics and business practices.
    """
    if calc.pass_through_rate is None:
        calc.pass_through_rate = 75.0

    # Core economic calculations
    import_cost = calc.retail_price / (1 + calc.retail_markup / 100)
    tariff_amount = import_cost * (calc.tariff_rate / 100)
    tariff_passed = tariff_amount * (calc.pass_through_rate / 100)
    future_price = calc.retail_price + tariff_passed
    tariff_tax_pct = (tariff_amount / future_price) * 100 if future_price > 0 else 0
    price_increase_pct = (
        (tariff_passed / calc.retail_price) * 100 if calc.retail_price > 0 else 0
    )

    return CalculationResult(
        import_cost=round(import_cost, 2),
        tariff_amount=round(tariff_amount, 2),
        tariff_passed=round(tariff_passed, 2),
        future_price=round(future_price, 2),
        tariff_tax_pct=round(tariff_tax_pct, 2),
        price_increase_pct=round(price_increase_pct, 2),
    )


@app.get("/api/price-history/{hs_code}")
async def get_price_history(hs_code: str):
    """Retrieve historical price data for a product (last 52 weeks)."""
    if "price_history" not in SAMPLE_DATA:
        raise HTTPException(status_code=404, detail="Price history not available")

    history = [p for p in SAMPLE_DATA["price_history"] if p["hs_code"] == hs_code]
    if not history:
        raise HTTPException(status_code=404, detail="Price history not found")

    # Return last year of weekly data
    return history[-52:]


@app.get("/api/tariff-scenarios")
async def get_tariff_scenarios():
    """Retrieve predefined tariff scenarios."""
    return {
        "current_rates": {
            "Electronics": 2.5,
            "Metals": 3.0,
            "Agriculture": 5.0,
            "Machinery": 2.0,
            "Textiles": 8.0,
            "Chemicals": 3.5,
        },
        "proposed_changes": {
            "Electronics": 25.0,
            "Metals": 10.0,
            "Agriculture": 15.0,
        },
    }


@app.post("/api/update-tariffs")
async def update_tariff_rates():
    """
    Update current tariff rates from USITC HTS API.

    Fetches the latest official tariff rates from the US International Trade
    Commission and updates all products in the database.
    """
    global SAMPLE_DATA

    try:
        result = await tariff_service.update_sample_data_tariffs(
            current_dir / "sample_data.json"
        )

        if result["success"]:
            # Reload updated product data
            with open(current_dir / "sample_data.json", "r") as file:
                SAMPLE_DATA = json.load(file)

            return {
                "message": "Tariff rates updated successfully",
                "updated_count": len(result["updated_products"]),
                "failed_count": len(result["failed_products"]),
                "total_processed": result["total_processed"],
                "updated_products": result["updated_products"],
                "failed_products": result["failed_products"],
            }
        else:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to update tariff rates: {result.get('error', 'Unknown error')}",
            )

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error updating tariff rates: {str(e)}"
        )


@app.get("/api/tariff-info/{hs_code}")
async def get_tariff_info(hs_code: str):
    """Get current tariff information for a specific HS code."""
    try:
        tariff_info = await tariff_service.get_product_tariff_info(hs_code)

        if "error" in tariff_info:
            raise HTTPException(status_code=500, detail=tariff_info["error"])

        return tariff_info

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching tariff info: {str(e)}"
        )
