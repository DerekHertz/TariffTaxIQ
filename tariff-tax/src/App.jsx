import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Calculator from './components/Calculator';
import Analysis from './components/Analysis';
import { calculatePassThrough, calculateConsumerBurden } from './utils/calculations';

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      if (saved !== null) {
        return JSON.parse(saved);
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });
  const [selectedProduct, setSelectedProduct] = useState('');
  const [tariffRate, setTariffRate] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Sample data (for now) for products, pass-through rates, and burden by income
  const products = [
    { hsCode: '721410', name: 'Steel Wire', category: 'Metals', elasticity: { demand: -3.0, supply: 2.0 } },
    { hsCode: '854430', name: 'Wiring Sets', category: 'Electronics', elasticity: { demand: -2.2, supply: 1.9 } },
    { hsCode: '010121', name: 'Horses', category: 'Agriculture', elasticity: { demand: -4.0, supply: 2.5 } },
    { hsCode: '842123', name: 'Oil Filters', category: 'Machinery', elasticity: { demand: -2.0, supply: 1.8 } },
  ];

  const passThroughData = [
    { name: 'Month 1', rate: 93, volume: 100 },
    { name: 'Month 3', rate: 87, volume: 85 },
    { name: 'Month 6', rate: 75, volume: 70 },
    { name: 'Month 9', rate: 68, volume: 65 },
    { name: 'Month 12', rate: 50, volume: 60 },
  ];

  const burdenByIncome = [
    { decile: 'Bottom 20%', burden: 325, percentage: 2.1 },
    { decile: '20-40%', burden: 410, percentage: 1.8 },
    { decile: '40-60%', burden: 485, percentage: 1.5 },
    { decile: '60-80%', burden: 520, percentage: 1.2 },
    { decile: 'Top 20%', burden: 580, percentage: 0.8 },
  ];

  const selectedProductData = useMemo(() => {
    return products.find(p => p.hsCode === selectedProduct);
  }, [selectedProduct]);

  const passThrough = useMemo(() => {
    return calculatePassThrough(selectedProductData);
  }, [selectedProductData]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

    return (
    <div className={`min-h-screen transition-all duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      
      <nav className={`${darkMode ? 'bg-gray-800/90' : 'bg-white/90'} backdrop-blur-sm shadow-lg border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} transition-all duration-300`}>
        <div className="container mx-auto px-6">
          <div className="flex space-x-1">
            {['dashboard', 'calculator', 'analysis'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-6 capitalize font-semibold transition-all duration-300 relative overflow-hidden group ${
                  activeTab === tab 
                    ? `text-violet-500 ${darkMode ? 'bg-violet-500/10' : 'bg-violet-50'}` 
                    : darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700/50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                } rounded-lg mx-1`}
              >
                <span className="relative z-10">{tab}</span>
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-pink-500 rounded-full" />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-violet-500/5 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8">
        {activeTab === 'dashboard' && (
          <Dashboard 
            darkMode={darkMode} 
            passThroughData={passThroughData} 
            burdenByIncome={burdenByIncome} 
          />
        )}
        {activeTab === 'calculator' && (
          <Calculator 
            darkMode={darkMode}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedProduct={selectedProduct}
            setSelectedProduct={setSelectedProduct}
            products={products}
            passThrough={passThrough}
          />
        )}
        {activeTab === 'analysis' && <Analysis darkMode={darkMode} />}
      </main>
    </div>
  );
}