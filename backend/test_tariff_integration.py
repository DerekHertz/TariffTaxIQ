#!/usr/bin/env python3
"""
Test script for the tariff integration without running the full server
"""
import asyncio
import sys
import json
from pathlib import Path

# Add the app directory to the path
sys.path.append(str(Path(__file__).parent / "app"))

from tariff_service import TariffUpdateService


async def test_tariff_service():
    """Test the tariff service functionality"""
    service = TariffUpdateService()

    print("Testing USITC API connection...")

    # Test fetching tariff data
    print("1. Fetching current tariff rates from USITC...")
    hts_data = await service.fetch_current_tariff_rates()

    if hts_data:
        print(f"✅ Successfully fetched HTS data")
        print(
            f"   Data structure keys: {list(hts_data.keys()) if isinstance(hts_data, dict) else 'Not a dict'}"
        )

        # Test if we can find sample data
        if isinstance(hts_data, dict) and "data" in hts_data:
            sample_items = hts_data["data"][:3] if len(hts_data["data"]) > 0 else []
            print(f"   Sample items ({len(sample_items)}):")
            for item in sample_items:
                print(f"     - {item}")

    else:
        print("❌ Failed to fetch HTS data")
        return

    print("\n2. Testing HS code lookups...")
    test_codes = ["851712", "870323", "847130"]

    for hs_code in test_codes:
        rate = service.find_tariff_rate_by_hs_code(hts_data, hs_code)
        print(f"   HS Code {hs_code}: {rate}% (or None if not found)")

    print("\n3. Testing individual product lookup...")
    product_info = await service.get_product_tariff_info("851712")
    print(f"   Product info for 851712: {json.dumps(product_info, indent=2)}")


if __name__ == "__main__":
    asyncio.run(test_tariff_service())
