/**
 * Tariff Impact Calculator Component
 *
 * Interactive calculator for analyzing the impact of tariffs on consumer prices.
 * Features real-time calculations, product selection, and economic modeling.
 *
 * Features:
 * - Real-time tariff impact calculations
 * - Product database with actual consumer goods
 * - Economic modeling with demand/supply elasticity
 * - Calculator-style UI with preset buttons
 * - Side-by-side product selection and calculation interface
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, Calculator as CalcIcon, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import {
  calculateImportCost,
  calculateTariffAmount,
  calculateTariffPassed,
  calculateFuturePrice,
  calculateTariffTaxPercentage,
  calculateInventoryImpact
} from '../utils/calculations';
export default function Calculator({
  darkMode = false,
  searchQuery = '',
  setSearchQuery = () => {},
  selectedProduct = '',
  setSelectedProduct = () => {},
  products = [],
}) {
  // Calculator input state with sensible defaults
  const [tariffRate, setTariffRate] = useState(10);
  const [retailPrice, setRetailPrice] = useState(25);
  const [retailMarkup, setRetailMarkup] = useState(50);
  const [customPassThrough, setCustomPassThrough] = useState(75);

  // API state management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiProducts, setApiProducts] = useState([]);
  const [apiCalculations, setApiCalculations] = useState(null);

  // Fetch products from backend on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getProducts();
      setApiProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to fetch products');
      console.error('API Error:', err);
      setApiProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const performApiCalculation = useCallback(async () => {
    setError(null);
    
    try {
      const data = await api.calculateTariffImpact({
        retail_price: retailPrice,
        retail_markup: retailMarkup,
        tariff_rate: tariffRate,
        pass_through_rate: customPassThrough,
        inventory_buffer: inventoryBuffer,
hs_code: selectedProduct || null
      });
      
      setApiCalculations(data);
    } catch (err) {
      setError('Failed to calculate. Please try again.');
      console.error('Calculation error:', err);
    } finally {
      // Calculation complete
    }
  }, [retailPrice, retailMarkup, tariffRate, customPassThrough, inventoryBuffer, selectedProduct]);
  useEffect(() => {
  if (retailPrice > 0 && tariffRate >= 0) {
    const timer = setTimeout(() => {
      performApiCalculation();
    }, 500); // Debounce for 500ms
    return () => clearTimeout(timer);
    }
  }, [retailPrice, tariffRate, performApiCalculation]);
  
  // Filter products based on search query (name or HS code)
  // Handle both API products (hs_code) and local products (hsCode)
  const allProducts = Array.isArray(apiProducts) && apiProducts.length > 0 ? apiProducts : (Array.isArray(products) ? products : []);
  const filteredProducts = allProducts.filter(p => {
    if (!p || !p.name) return false; // Safety check
    const hsCode = p.hs_code || p.hsCode || '';
    const searchTerm = searchQuery || '';
    return p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           hsCode.includes(searchTerm);
  });

  // Get full product data for selected product
  // Handle both API products (hs_code) and local products (hsCode)
  const selectedProductData = allProducts.find(p => {
    if (!p) return false; // Safety check
    const hsCode = p.hs_code || p.hsCode;
    return hsCode === selectedProduct;
  });

  // Calculate default pass-through rate for selected product (handle API vs local data structure)
  const calculatedPassThrough = useMemo(() => {
    if (!selectedProductData) return 75; // Default when no product selected
    
    // Handle API product structure (demand_elasticity, supply_elasticity)
    if (selectedProductData.demand_elasticity && selectedProductData.supply_elasticity) {
      const { demand_elasticity, supply_elasticity } = selectedProductData;
      return (supply_elasticity / (supply_elasticity + Math.abs(demand_elasticity))) * 100;
    }
    
    // Handle local product structure (elasticity.demand, elasticity.supply)
    if (selectedProductData.elasticity) {
      const { demand, supply } = selectedProductData.elasticity;
      return (supply / (supply + Math.abs(demand))) * 100;
    }
    
    return 75; // Default fallback
  }, [selectedProductData]);

  // Update customPassThrough when product selection changes
  useEffect(() => {
    setCustomPassThrough(calculatedPassThrough);
  }, [calculatedPassThrough]);

  // Set realistic default prices based on selected product
  useEffect(() => {
    if (selectedProductData) {
      const productName = selectedProductData.name.toLowerCase();
      let defaultPrice = 25; // fallback

      // Set realistic prices based on product type
      if (productName.includes('smartphone') || productName.includes('phone')) {
        defaultPrice = 800;
      } else if (productName.includes('laptop') || productName.includes('computer')) {
        defaultPrice = 1200;
      } else if (productName.includes('car') || productName.includes('vehicle')) {
        defaultPrice = 35000;
      } else if (productName.includes('pharmaceutical') || productName.includes('medication')) {
        defaultPrice = 150;
      } else if (productName.includes('footwear') || productName.includes('shoes')) {
        defaultPrice = 80;
      } else if (productName.includes('clothing') || productName.includes('apparel') || productName.includes('trousers')) {
        defaultPrice = 45;
      } else if (productName.includes('toy') || productName.includes('game')) {
        defaultPrice = 30;
      } else if (productName.includes('furniture')) {
        defaultPrice = 400;
      } else if (productName.includes('seafood') || productName.includes('shrimp') || productName.includes('coffee')) {
        defaultPrice = 12; // per pound/kg
      }

      setRetailPrice(defaultPrice);
    }
  }, [selectedProductData]);

  // Memoized calculations based on current input parameters
  const calculations = useMemo(() => {
    const importCost = calculateImportCost(retailPrice, retailMarkup);
    const tariffAmount = calculateTariffAmount(importCost, tariffRate);
    const effectivePassThrough = customPassThrough;
    const tariffPassed = calculateTariffPassed(tariffAmount, effectivePassThrough);
    const futurePrice = calculateFuturePrice(retailPrice, tariffPassed);
    const tariffTaxPct = calculateTariffTaxPercentage(tariffPassed, futurePrice);
    const inventoryAdjustedIncrease = calculateInventoryImpact(inventoryBuffer, tariffPassed);

    return {
      importCost,
      tariffAmount,
      tariffPassed,
      futurePrice,
      tariffTaxPct,
      inventoryAdjustedIncrease,
      priceIncreasePercent: (tariffPassed / retailPrice) * 100
    };
  }, [retailPrice, retailMarkup, tariffRate, customPassThrough, inventoryBuffer]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Add error display */}
      {error && (
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-red-900/50' : 'bg-red-100'} border ${darkMode ? 'border-red-700' : 'border-red-300'}`}>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-500">{error}</span>
          </div>
        </div>
      )}

      {/* Add loading state */}
      {loading && (
        <div className="flex justify-center items-center h-32">
          <div className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>Loading products...</div>
        </div>
      )}
      
      {/* Show message when no products available */}
      {!loading && allProducts.length === 0 && (
        <div className={`${darkMode ? 'bg-gray-800/90' : 'bg-white'} rounded-xl p-6 shadow-xl border ${darkMode ? 'border-gray-700/50' : 'border-gray-100'} backdrop-blur-sm`}>
          <div className="flex justify-center items-center h-32">
            <div className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <p className="text-lg mb-2">No products available</p>
              <p className="text-sm">Unable to load product data. Please check your connection or try again later.</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Only show calculator interface when products are available */}
      {!loading && allProducts.length > 0 && (
        <>
        {/* Side by side layout: Products on left, Calculator on right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Left: Product selection */}
          <div className={`${darkMode ? 'bg-gray-800/90' : 'bg-white'} rounded-xl p-6 shadow-xl border ${darkMode ? 'border-gray-700/50' : 'border-gray-100'} backdrop-blur-sm`}>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <CalcIcon className="w-6 h-6 text-violet-500" />
              Select Product
            </h2>

            {/* Product search input */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-lg ${
                  darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all`}
              />
            </div>

            {/* Product list - single column, scrollable */}
            <div
              className="space-y-3"
              style={{
                maxHeight: '500px',
                overflowY: 'auto',
                paddingRight: '8px'
              }}
            >
              {filteredProducts.map(product => {
                const hsCode = product.hs_code || product.hsCode;
                return (
                  <button
                    key={hsCode}
                    onClick={() => setSelectedProduct(hsCode)}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      selectedProduct === hsCode
                        ? 'border-violet-500 bg-violet-500/10'
                        : darkMode ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-semibold">{product.name}</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {product.category} • {product.country_of_origin}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      Current: {product.current_tariff_rate || 0}% → Proposed: {product.proposed_tariff_rate || 0}%
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Calculator Interface */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-8 shadow-2xl border-4 ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
            {/* Calculator Display Screen */}
            <div className={`${darkMode ? 'bg-black' : 'bg-gray-900'} text-green-400 p-6 rounded-lg mb-6 font-mono`}>
              <div className="text-right">
                <div className="text-sm opacity-75 mb-1">Future Price</div>
                <div className="text-3xl font-bold">
                  ${(apiCalculations?.future_price || calculations.futurePrice.toFixed(2))}
                </div>
                <div className="text-sm mt-2">
                  Increase: {(apiCalculations?.price_increase_pct || calculations.priceIncreasePercent.toFixed(1))}%
                </div>
              </div>
            </div>

            {/* Calculator Input Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4 text-center">Tariff Calculator</h3>

              {/* Calculator-style input rows */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium mb-1">Price ($)</label>
                  <input
                    type="number"
                    value={retailPrice}
                    onChange={(e) => setRetailPrice(parseFloat(e.target.value) || 0)}
                    className={`w-full p-3 rounded-lg text-lg font-bold text-center ${
                      darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-violet-500`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Markup %</label>
                  <input
                    type="number"
                    value={retailMarkup}
                    onChange={(e) => setRetailMarkup(parseFloat(e.target.value) || 0)}
                    className={`w-full p-3 rounded-lg text-lg font-bold text-center ${
                      darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-violet-500`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Tariff %</label>
                  <input
                    type="number"
                    value={tariffRate}
                    onChange={(e) => setTariffRate(parseFloat(e.target.value) || 0)}
                    className={`w-full p-3 rounded-lg text-lg font-bold text-center ${
                      darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-pink-500`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Pass-through %</label>
                  <input
                    type="number"
                    value={Math.round(customPassThrough)}
                    onChange={(e) => setCustomPassThrough(parseFloat(e.target.value) || 0)}
                    className={`w-full p-3 rounded-lg text-lg font-bold text-center ${
                      darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
              </div>

              {/* Quick preset buttons */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                <button
                  onClick={() => setTariffRate(10)}
                  className={`p-2 rounded-lg text-sm font-medium ${
                    darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                  } transition-colors`}
                >
                  10%
                </button>
                <button
                  onClick={() => setTariffRate(25)}
                  className={`p-2 rounded-lg text-sm font-medium ${
                    darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                  } transition-colors`}
                >
                  25%
                </button>
                <button
                  onClick={() => setTariffRate(50)}
                  className={`p-2 rounded-lg text-sm font-medium ${
                    darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                  } transition-colors`}
                >
                  50%
                </button>
                <button
                  onClick={() => setTariffRate(100)}
                  className={`p-2 rounded-lg text-sm font-medium ${
                    darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                  } transition-colors`}
                >
                  100%
                </button>
              </div>

              {/* Additional info display */}
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg p-3 text-sm`}>
                <div className="flex justify-between mb-1">
                  <span>Import Cost:</span>
                  <span className="font-mono">${(apiCalculations?.import_cost || calculations.importCost.toFixed(2))}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>Tariff Amount:</span>
                  <span className="font-mono">${(apiCalculations?.tariff_amount || calculations.tariffAmount.toFixed(2))}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tariff Tax:</span>
                  <span className="font-mono">{(apiCalculations?.tariff_tax_pct || calculations.tariffTaxPct.toFixed(1))}%</span>
                </div>
              </div>
            </div>
          </div>

        </div> {/* End grid */}
        </>
      )}
    </div>
  );
}