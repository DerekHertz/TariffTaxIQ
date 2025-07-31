from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json
from datetime import datetime

app = FastAPI(title="Tariff Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Adjust this to frontend's URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import os
from pathlib import Path

# Get the directory where this file is located
current_dir = Path(__file__).parent

# Load sample data from JSON file
try:
    with open(current_dir / "sample_data.json", "r") as file:
        SAMPLE_DATA = json.load(file)
except FileNotFoundError:
    # Fallback data in case file is not found
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
                "proposed_tariff_rate": 25.0
            }
        ]
    }

class Product(BaseModel):
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
    retail_price: float
    retail_markup: float
    tariff_rate: float
    pass_through_rate: Optional[float] = None
    inventory_buffer: int = 0

class CalculationResult(BaseModel):
    import_cost: float
    tariff_amount: float
    tariff_passed: float
    future_price: float
    tariff_tax_pct: float
    price_increase_pct: float

# endpoints
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
    product = next((p for p in SAMPLE_DATA["products"] if p["hs_code"] == hs_code), None)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@app.post("/api/calculate", response_model=CalculationResult)
async def calculate_tariff(calc: TariffCalculation):
    """Calculate the tariff impact on consumer prices."""
    if calc.pass_through_rate is None:
        calc.pass_through_rate = 75.0  # Default pass-through rate if not provided
    
    # calculations
    import_cost = calc.retail_price / (1 + calc.retail_markup / 100)
    tariff_amount = import_cost * (calc.tariff_rate / 100)
    tariff_passed = tariff_amount * (calc.pass_through_rate / 100)
    future_price = calc.retail_price + tariff_passed
    tariff_tax_pct = (tariff_amount / future_price) * 100 if future_price > 0 else 0
    price_increase_pct = (tariff_passed / calc.retail_price) * 100 if calc.retail_price > 0 else 0

    return CalculationResult(
        import_cost=round(import_cost, 2),
        tariff_amount=round(tariff_amount, 2),
        tariff_passed=round(tariff_passed, 2),
        future_price=round(future_price, 2),
        tariff_tax_pct=round(tariff_tax_pct, 2),
        price_increase_pct=round(price_increase_pct, 2)
    )


@app.get("/api/price-history/{hs_code}")
async def get_price_history(hs_code: str):
    """Retrieve historical price data for a product."""
    history = [p for p in SAMPLE_DATA["price_history"] if p["hs_code"] == hs_code]
    if not history:
        raise HTTPException(status_code=404, detail="Price history not found")
    return history[-52:] # return last year of data (~52 weeks)


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
            "Chemicals": 3.5
        },
        "proposed_changes": {
            "Electronics": 25.0,
            "Metals": 10.0,
            "Agriculture": 15.0
        }
    }