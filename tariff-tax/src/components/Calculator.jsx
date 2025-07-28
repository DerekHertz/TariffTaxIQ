import React, { useState, useMemo } from 'react';
import { Search, Calculator as CalcIcon, TrendingUp, DollarSign } from 'lucide-react';
import {
  calculateImportCost,
  calculateTariffAmount,
  calculateTariffPassed,
  calculateFuturePrice,
  calculateTariffTaxPercentage,
  calculateInventoryImpact
} from '../utils/calculations';

export default function Calculator({ 
  darkMode, 
  searchQuery, 
  setSearchQuery, 
  selectedProduct, 
  setSelectedProduct, 
  products, 
  passThrough
}) {
  // Component's own state
  const [tariffRate, setTariffRate] = useState(10);
  const [retailPrice, setRetailPrice] = useState(100);
  const [retailMarkup, setRetailMarkup] = useState(50);
  const [inventoryBuffer, setInventoryBuffer] = useState(3);
  const [customPassThrough, setCustomPassThrough] = useState(75);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.hsCode.includes(searchQuery)
  );

  const selectedProductData = products.find(p => p.hsCode === selectedProduct);

  // Calculate all values
  const calculations = useMemo(() => {
    const importCost = calculateImportCost(retailPrice, retailMarkup);
    const tariffAmount = calculateTariffAmount(importCost, tariffRate);
    const effectivePassThrough = selectedProductData ? passThrough : customPassThrough;
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
  }, [retailPrice, retailMarkup, tariffRate, passThrough, customPassThrough, selectedProductData, inventoryBuffer]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Product Selection */}
      <div className={`${darkMode ? 'bg-gray-800/90' : 'bg-white'} rounded-xl p-6 shadow-xl border ${darkMode ? 'border-gray-700/50' : 'border-gray-100'} backdrop-blur-sm`}>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <CalcIcon className="w-6 h-6 text-violet-500" />
          Tariff Impact Calculator
        </h2>
        
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {filteredProducts.map(product => (
            <button
              key={product.hsCode}
              onClick={() => setSelectedProduct(product.hsCode)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedProduct === product.hsCode
                  ? 'border-violet-500 bg-violet-500/10'
                  : darkMode ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-left">
                <p className="font-semibold">{product.name}</p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  HS: {product.hsCode} • {product.category}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Detailed Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Panel */}
        <div className={`${darkMode ? 'bg-gray-800/90' : 'bg-white'} rounded-xl p-6 shadow-xl border ${darkMode ? 'border-gray-700/50' : 'border-gray-100'} backdrop-blur-sm`}>
          <h3 className="text-lg font-semibold mb-4">Input Parameters</h3>
          
          <div className="space-y-6">
            {/* Retail Price */}
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

            {/* Retail Markup */}
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

            {/* Tariff Rate */}
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

            {/* Pass-through Rate */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Pass-through Rate (%)
                {selectedProductData && (
                  <span className="text-xs ml-2 text-violet-500">
                    (Auto: {passThrough.toFixed(1)}%)
                  </span>
                )}
              </label>
              {!selectedProductData && (
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={customPassThrough}
                  onChange={(e) => setCustomPassThrough(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              )}
              <div className="flex justify-between text-sm mt-2">
                <span>0%</span>
                <span className="font-bold text-blue-500">
                  {(selectedProductData ? passThrough : customPassThrough).toFixed(1)}%
                </span>
                <span>100%</span>
              </div>
            </div>

            {/* Inventory Buffer */}
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

        {/* Results Panel */}
        <div className={`${darkMode ? 'bg-gray-800/90' : 'bg-white'} rounded-xl p-6 shadow-xl border ${darkMode ? 'border-gray-700/50' : 'border-gray-100'} backdrop-blur-sm`}>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-violet-500" />
            Calculation Results
          </h3>
          
          <div className="space-y-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <p className="text-sm text-gray-500 mb-1">Import Cost</p>
                <p className="text-2xl font-bold text-violet-500">
                  ${calculations.importCost.toFixed(2)}
                </p>
              </div>
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <p className="text-sm text-gray-500 mb-1">Tariff Amount</p>
                <p className="text-2xl font-bold text-pink-500">
                  ${calculations.tariffAmount.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Consumer Impact */}
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
                    ${calculations.tariffPassed.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Future Retail Price:</span>
                  <span className="font-bold text-green-500">
                    ${calculations.futurePrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Price Increase:</span>
                  <span className="font-bold text-orange-500">
                    {calculations.priceIncreasePercent.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Tariff Tax Percentage */}
            <div className={`p-6 rounded-lg text-center ${
              darkMode ? 'bg-gradient-to-r from-violet-900/50 to-pink-900/50' : 'bg-gradient-to-r from-violet-100 to-pink-100'
            }`}>
              <p className="text-sm font-medium mb-2">Effective Tariff Tax</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-violet-500 to-pink-500 bg-clip-text text-transparent">
                {calculations.tariffTaxPct.toFixed(1)}%
              </p>
              <p className={`text-xs mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                of future price is tariff
              </p>
            </div>

            {/* Inventory Impact */}
            {inventoryBuffer > 0 && (
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <p className="text-sm text-gray-500 mb-1">With {inventoryBuffer}-Month Buffer</p>
                <p className="text-lg font-bold text-green-500">
                  ${calculations.inventoryAdjustedIncrease.toFixed(2)} initial impact
                </p>
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Gradual increase over inventory period
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}