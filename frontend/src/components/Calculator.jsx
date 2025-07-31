import React, { useState, useMemo, useEffect } from 'react';
import { Search, Calculator as CalcIcon, TrendingUp, DollarSign, AlertCircle, Info, Globe } from 'lucide-react';
import { api } from '../services/api';
import {
  calculateImportCost,
  calculateTariffAmount,
  calculateTariffPassed,
  calculateFuturePrice,
  calculateTariffTaxPercentage,
  calculateInventoryImpact
} from '../utils/calculations';

/**
 * Interactive tariff impact calculator component
 * Allows users to select products and adjust parameters to see real-time calculations
 */
export default function Calculator({ 
  darkMode = false, 
  searchQuery = '', 
  setSearchQuery = () => {}, 
  selectedProduct = '', 
  setSelectedProduct = () => {}, 
  products = [], 
  passThrough = 75
}) {
  // Calculator input parameters with sensible defaults
  const [tariffRate, setTariffRate] = useState(10); // Tariff percentage rate
  const [retailPrice, setRetailPrice] = useState(100); // Current retail price in dollars
  const [retailMarkup, setRetailMarkup] = useState(50); // Retailer markup percentage
  const [inventoryBuffer, setInventoryBuffer] = useState(3); // Months of inventory cushion
  const [customPassThrough, setCustomPassThrough] = useState(75); // Manual pass-through rate
  const [showAllProducts, setShowAllProducts] = useState(false); // Show more/less products toggle

  // API-related state
  const [loading, setLoading] = useState(false); // Loading state for async operations
  const [error, setError] = useState(null); // Error state for API calls
  const [apiProducts, setApiProducts] = useState([]); // Products fetched from API
  const [calculating, setCalculating] = useState(false); // State to indicate if calculations are in progress
  const [apiCalculations, setApiCalculations] = useState(null); // Results from API calculations

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

  const performApiCalculation = async () => {
    setCalculating(true);
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
      setCalculating(false);
    }
  };
  useEffect(() => {
  if (retailPrice > 0 && tariffRate >= 0) {
    const timer = setTimeout(() => {
      performApiCalculation();
    }, 500); // Debounce for 500ms
    return () => clearTimeout(timer);
    }
  }, [retailPrice, retailMarkup, tariffRate, customPassThrough, inventoryBuffer, selectedProduct]);
  
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
  }, [retailPrice, retailMarkup, tariffRate, customPassThrough, selectedProductData, inventoryBuffer]);

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
      {/* Product selection and search interface */}
      <div className={`${darkMode ? 'bg-gray-800/90' : 'bg-white'} rounded-xl p-6 shadow-xl border ${darkMode ? 'border-gray-700/50' : 'border-gray-100'} backdrop-blur-sm`}>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <CalcIcon className="w-6 h-6 text-violet-500" />
          Tariff Impact Calculator
        </h2>
        
        {/* Product search input */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by product name or HS code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 rounded-lg ${
              darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all`}
          />
        </div>

        {/* Product selection grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {(showAllProducts ? filteredProducts : filteredProducts.slice(0, 8)).map(product => {
            const hsCode = product.hs_code || product.hsCode;
            return (
              <button
                key={hsCode}
                onClick={() => setSelectedProduct(hsCode)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedProduct === hsCode
                    ? 'border-violet-500 bg-violet-500/10'
                    : darkMode ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-left">
                  <p className="font-semibold">{product.name}</p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    HS: {hsCode} • {product.category}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
        
        {/* Show more/less button */}
        {filteredProducts.length > 8 && (
          <div className="text-center mb-6">
            <button
              onClick={() => setShowAllProducts(!showAllProducts)}
              className={`px-6 py-2 rounded-lg transition-all ${
                darkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              }`}
            >
              {showAllProducts 
                ? `Show Less (${filteredProducts.length - 8} hidden)` 
                : `Show ${filteredProducts.length - 8} More Products`
              }
            </button>
          </div>
        )}
        
        {/* Selected Product Information */}
        {selectedProductData && (
          <div className={`${darkMode ? 'bg-gray-800/90' : 'bg-white'} rounded-xl p-6 shadow-xl border ${darkMode ? 'border-gray-700/50' : 'border-gray-100'} backdrop-blur-sm`}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-500" />
              Current Product Data: {selectedProductData.name}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <p className="text-sm text-gray-500 mb-1">Country of Origin</p>
                <p className="text-lg font-bold text-blue-500">
                  {selectedProductData.country_of_origin || 'Unknown'}
                </p>
              </div>
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <p className="text-sm text-gray-500 mb-1">Current Tariff Rate</p>
                <p className="text-lg font-bold text-green-500">
                  {selectedProductData.current_tariff_rate || 0}%
                </p>
              </div>
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <p className="text-sm text-gray-500 mb-1">Proposed Tariff Rate</p>
                <p className="text-lg font-bold text-orange-500">
                  {selectedProductData.proposed_tariff_rate || 0}%
                </p>
              </div>
            </div>
            <div className={`mt-4 p-4 rounded-lg ${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'} border ${darkMode ? 'border-blue-700/50' : 'border-blue-200'}`}>
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">Pass-Through Rate Calculation</p>
                  <p className={`text-xs ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                    Based on economic data, about <strong>{calculatedPassThrough.toFixed(1)}%</strong> of tariff costs 
                    for {(selectedProductData.name || 'this product').toLowerCase()} are typically passed on to consumers. 
                    This depends on how easily consumers can switch to alternatives (demand elasticity: {selectedProductData.demand_elasticity || selectedProductData.elasticity?.demand || 'N/A'}) 
                    and how quickly suppliers can adjust production (supply elasticity: {selectedProductData.supply_elasticity || selectedProductData.elasticity?.supply || 'N/A'}).
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* How It Works Section */}
      <div className={`${darkMode ? 'bg-gray-800/90' : 'bg-white'} rounded-xl p-6 shadow-xl border ${darkMode ? 'border-gray-700/50' : 'border-gray-100'} backdrop-blur-sm`}>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-violet-500" />
          How the Calculator Works
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-violet-500 mb-2">1. Import Cost Calculation</h4>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              We work backwards from the retail price to find the original import cost before retailer markup. 
              <strong> Import Cost = Retail Price ÷ (1 + Markup%)</strong>
            </p>
            
            <h4 className="font-semibold text-pink-500 mb-2">2. Tariff Amount</h4>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              The total tariff charged on imports. 
              <strong> Tariff = Import Cost × Tariff Rate%</strong>
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-blue-500 mb-2">3. Pass-Through to Consumers</h4>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              Not all tariff costs reach consumers - some are absorbed by importers/retailers. The pass-through rate depends on market competition and product substitutability.
              <strong> Consumer Impact = Tariff × Pass-Through Rate%</strong>
            </p>
            
            <h4 className="font-semibold text-green-500 mb-2">4. Effective Tax Rate</h4>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              The percentage of your final purchase price that represents tariff tax.
              <strong> Tax Rate = Consumer Impact ÷ Future Price</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Main calculator interface split into inputs and results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left panel: Input controls and parameter adjustment */}
        <div className={`${darkMode ? 'bg-gray-800/90' : 'bg-white'} rounded-xl p-6 shadow-xl border ${darkMode ? 'border-gray-700/50' : 'border-gray-100'} backdrop-blur-sm`}>
          <h3 className="text-lg font-semibold mb-4">Input Parameters</h3>
          
          <div className="space-y-6">
            {/* Basic pricing inputs */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Retail Price ($)
              </label>
              <input
                type="number"
                value={retailPrice}
                onChange={(e) => setRetailPrice(parseFloat(e.target.value) || 0)}
                className={`w-full p-3 rounded-lg ${
                  darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-violet-500`}
              />
            </div>

            {/* Markup percentage slider */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Retail Markup (%)
              </label>
              <input
                type="range"
                min="0"
                max="200"
                value={retailMarkup}
                onChange={(e) => setRetailMarkup(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm mt-2">
                <span>0%</span>
                <span className="font-bold text-violet-500">{retailMarkup}%</span>
                <span>200%</span>
              </div>
            </div>

            {/* Tariff rate slider */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Tariff Rate (%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={tariffRate}
                onChange={(e) => setTariffRate(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm mt-2">
                <span>0%</span>
                <span className="font-bold text-pink-500">{tariffRate}%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Pass-through rate (always editable with calculated default) */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Pass-through Rate (%)
                {selectedProductData && (
                  <span className="text-xs ml-2 text-violet-500">
                    (Calculated: {calculatedPassThrough.toFixed(1)}%)
                  </span>
                )}
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={customPassThrough}
                onChange={(e) => setCustomPassThrough(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm mt-2">
                <span>0%</span>
                <span className="font-bold text-blue-500">
                  {customPassThrough.toFixed(1)}%
                </span>
                <span>100%</span>
              </div>
              {selectedProductData && Math.abs(customPassThrough - calculatedPassThrough) > 0.5 && (
                <p className={`text-xs mt-1 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                  Custom value differs from calculated ({calculatedPassThrough.toFixed(1)}%)
                </p>
              )}
            </div>

            {/* Inventory buffer slider */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Inventory Buffer (months)
              </label>
              <input
                type="range"
                min="0"
                max="12"
                step="1"
                value={inventoryBuffer}
                onChange={(e) => setInventoryBuffer(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm mt-2">
                <span>0</span>
                <span className="font-bold text-green-500">{inventoryBuffer} months</span>
                <span>12</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel: Calculation results and impact metrics */}
        <div className={`${darkMode ? 'bg-gray-800/90' : 'bg-white'} rounded-xl p-6 shadow-xl border ${darkMode ? 'border-gray-700/50' : 'border-gray-100'} backdrop-blur-sm`}>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-violet-500" />
            Calculation Results
          </h3>
          
          <div className="space-y-4">
            {/* Core calculation metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <p className="text-sm text-gray-500 mb-1">Import Cost</p>
                <p className="text-2xl font-bold text-violet-500">
                  ${(apiCalculations?.import_cost || calculations.importCost.toFixed(2))}
                </p>
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Original cost before markup
                </p>
              </div>
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <p className="text-sm text-gray-500 mb-1">Tariff Amount</p>
                <p className="text-2xl font-bold text-pink-500">
                  ${(apiCalculations?.tariff_amount || calculations.tariffAmount.toFixed(2))}
                </p>
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total tariff charged on imports
                </p>
              </div>
            </div>

            {/* Main consumer impact summary */}
            <div className={`p-4 rounded-lg border-2 ${
              darkMode ? 'bg-gray-700/50 border-blue-500/50' : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium">Consumer Impact</p>
                <DollarSign className="w-5 h-5 text-blue-500" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Tariff Passed to Consumer:</span>
                  <span className="font-bold text-blue-500">
                    ${(apiCalculations?.tariff_passed || calculations.tariffPassed.toFixed(2))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Future Retail Price:</span>
                  <span className="font-bold text-green-500">
                    ${(apiCalculations?.future_price || calculations.futurePrice.toFixed(2))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Price Increase:</span>
                  <span className="font-bold text-orange-500">
                    {(apiCalculations?.price_increase_pct || calculations.priceIncreasePercent.toFixed(1))}%
                  </span>
                </div>
              </div>
            </div>

            {/* Highlighted effective tariff rate */}
            <div className={`p-6 rounded-lg text-center ${
              darkMode ? 'bg-gradient-to-r from-violet-900/50 to-pink-900/50' : 'bg-gradient-to-r from-violet-100 to-pink-100'
            }`}>
              <p className="text-sm font-medium mb-2">Effective Tariff Tax</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-violet-500 to-pink-500 bg-clip-text text-transparent">
                {(apiCalculations?.tariff_tax_pct || calculations.tariffTaxPct.toFixed(1))}%
              </p>
              <p className={`text-xs mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                of future price is tariff
              </p>
            </div>

            {/* Inventory buffer impact calculation */}
            {inventoryBuffer > 0 && (
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <p className="text-sm text-gray-500 mb-1">With {inventoryBuffer}-Month Buffer</p>
                <p className="text-lg font-bold text-green-500">
                  ${calculations.inventoryAdjustedIncrease.toFixed(2)} initial impact
                </p>
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Companies with existing inventory can delay price increases. Full impact occurs when inventory is depleted.
                </p>
              </div>
            )}
            
            {/* Explanatory note */}
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-yellow-900/30' : 'bg-yellow-50'} border ${darkMode ? 'border-yellow-700/50' : 'border-yellow-200'}`}>
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <p className={`text-xs ${darkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
                  <strong>Note:</strong> These calculations show potential impacts. Actual results depend on market conditions, 
                  competition, and company strategies. The pass-through rate represents economic estimates based on historical data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
}