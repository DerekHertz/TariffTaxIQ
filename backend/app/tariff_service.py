"""
Tariff Update Service

Service for fetching and updating tariff rates from external government APIs.
Provides integration with the US International Trade Commission (USITC)
Harmonized Tariff Schedule database.
"""

import json
import httpx
from typing import Dict, List, Optional
from pathlib import Path
import logging

logger = logging.getLogger(__name__)


class TariffUpdateService:
    """
    Service for updating tariff rates from external APIs.

    Integrates with USITC HTS database to fetch current official tariff rates
    and update local product database with the latest information.
    """

    def __init__(self):
        """Initialize service with USITC API configuration."""
        self.usitc_hts_url = "https://www.usitc.gov/sites/default/files/tata/hts/hts_2024_basic_edition_json.json"
        self.timeout = 30.0

    async def fetch_current_tariff_rates(self) -> Optional[Dict]:
        """
        Fetch current tariff rates from USITC HTS API.

        Returns:
            Dict containing HTS tariff data or None if fetch fails
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(self.usitc_hts_url)
                response.raise_for_status()
                return response.json()
        except httpx.RequestError as e:
            logger.error(f"Network error fetching tariff data: {e}")
            return None
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error fetching tariff data: {e}")
            return None
        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error: {e}")
            return None

    def find_tariff_rate_by_hs_code(self, hts_data: Dict, hs_code: str) -> Optional[float]:
        """
        Find current tariff rate for a specific HS code.

        Args:
            hts_data: HTS database from USITC API
            hs_code: 6-digit Harmonized System code

        Returns:
            Current tariff rate as percentage or None if not found
        """
        if not hts_data or 'data' not in hts_data:
            return None

        # Search through HTS data for matching HS code
        for item in hts_data.get('data', []):
            # Check various possible field names for HS codes
            item_hs = item.get('hts_number', item.get('hs_code', item.get('product_code', '')))

            # Match first 6 digits (standard HS code level)
            if str(item_hs).startswith(hs_code[:6]):
                # Extract tariff rate from common field names
                rate_str = item.get('duty_rate', item.get('tariff_rate', item.get('rate', '0')))

                try:
                    # Handle various rate formats
                    if isinstance(rate_str, (int, float)):
                        return float(rate_str)

                    rate_str = str(rate_str).upper().strip()
                    if rate_str in ['FREE', 'DUTY FREE', '0']:
                        return 0.0

                    # Extract numeric value from percentage strings
                    if '%' in rate_str:
                        rate_str = rate_str.replace('%', '').strip()

                    return float(rate_str)
                except (ValueError, TypeError):
                    continue

        return None

    async def update_sample_data_tariffs(self, sample_data_path: Path) -> Dict:
        """
        Update tariff rates in sample data file with latest USITC data.

        Args:
            sample_data_path: Path to sample_data.json file

        Returns:
            Dict with update results including success/failure counts
        """
        result = {
            "updated_products": [],
            "failed_products": [],
            "total_processed": 0,
            "success": False
        }

        try:
            # Load current product data
            with open(sample_data_path, 'r') as file:
                data = json.load(file)

            # Fetch latest tariff data from USITC
            hts_data = await self.fetch_current_tariff_rates()
            if not hts_data:
                result["error"] = "Failed to fetch tariff data from USITC"
                return result

            # Update each product's current tariff rate
            for product in data.get('products', []):
                result["total_processed"] += 1
                hs_code = product.get('hs_code')

                if not hs_code:
                    result["failed_products"].append({
                        "name": product.get('name', 'Unknown'),
                        "reason": "Missing HS code"
                    })
                    continue

                # Find current official tariff rate
                current_rate = self.find_tariff_rate_by_hs_code(hts_data, hs_code)

                if current_rate is not None:
                    old_rate = product.get('current_tariff_rate', 0)
                    product['current_tariff_rate'] = current_rate

                    result["updated_products"].append({
                        "name": product.get('name'),
                        "hs_code": hs_code,
                        "old_rate": old_rate,
                        "new_rate": current_rate
                    })
                else:
                    result["failed_products"].append({
                        "name": product.get('name', 'Unknown'),
                        "hs_code": hs_code,
                        "reason": "Tariff rate not found in HTS data"
                    })

            # Save updated data back to file
            with open(sample_data_path, 'w') as file:
                json.dump(data, file, indent=2)

            result["success"] = True
            return result

        except Exception as e:
            logger.error(f"Error updating sample data: {e}")
            result["error"] = str(e)
            return result

    async def get_product_tariff_info(self, hs_code: str) -> Dict:
        """
        Get detailed tariff information for a specific product.

        Args:
            hs_code: 6-digit Harmonized System code

        Returns:
            Dict with current tariff rate and metadata
        """
        hts_data = await self.fetch_current_tariff_rates()
        if not hts_data:
            return {"error": "Failed to fetch tariff data"}

        current_rate = self.find_tariff_rate_by_hs_code(hts_data, hs_code)

        return {
            "hs_code": hs_code,
            "current_tariff_rate": current_rate,
            "data_source": "USITC HTS 2024",
            "last_updated": "2024"
        }