"""
Basic tests for the FastAPI application
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root_endpoint():
    """Test the root endpoint returns welcome message"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "version" in data


def test_get_products():
    """Test retrieving products list"""
    response = client.get("/api/products")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    
    # Check first product has required fields
    first_product = data[0]
    required_fields = [
        "hs_code", "name", "category", "demand_elasticity",
        "supply_elasticity", "unit", "country_of_origin"
    ]
    for field in required_fields:
        assert field in first_product


def test_get_product_by_hs_code():
    """Test retrieving a specific product by HS code"""
    # First get the list to find a valid HS code
    products_response = client.get("/api/products")
    products = products_response.json()
    
    if products:
        hs_code = products[0]["hs_code"]
        response = client.get(f"/api/products/{hs_code}")
        assert response.status_code == 200
        data = response.json()
        assert data["hs_code"] == hs_code


def test_get_nonexistent_product():
    """Test retrieving a product that doesn't exist"""
    response = client.get("/api/products/999999")
    assert response.status_code == 404


def test_calculate_tariff():
    """Test tariff calculation endpoint"""
    calculation_data = {
        "retail_price": 100.0,
        "retail_markup": 50.0,
        "tariff_rate": 10.0,
        "pass_through_rate": 75.0,
        "inventory_buffer": 3
    }
    
    response = client.post("/api/calculate", json=calculation_data)
    assert response.status_code == 200
    data = response.json()
    
    required_fields = [
        "import_cost", "tariff_amount", "tariff_passed",
        "future_price", "tariff_tax_pct", "price_increase_pct"
    ]
    for field in required_fields:
        assert field in data
        assert isinstance(data[field], (int, float))


def test_get_tariff_scenarios():
    """Test tariff scenarios endpoint"""
    response = client.get("/api/tariff-scenarios")
    assert response.status_code == 200
    data = response.json()
    assert "current_rates" in data
    assert "proposed_changes" in data