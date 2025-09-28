/**
 * TariffTax IQ Application
 *
 * Main application component that provides tariff impact analysis tools.
 * Features an interactive calculator for analyzing how trade tariffs
 * affect consumer prices on real-world products.
 *
 * Features:
 * - Dark/light mode theme management
 * - Interactive tariff calculator
 * - Real-world product database
 * - Economic modeling and calculations
 * - Responsive design
 */

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Calculator from './components/Calculator';
export default function App() {
  // Theme management with intelligent initialization
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

  // Application state
  const [selectedProduct, setSelectedProduct] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('calculator');

  // Apply theme changes and persist to localStorage
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

      {/* Navigation */}
      <nav className={`${darkMode ? 'bg-gray-800/90' : 'bg-white/90'} backdrop-blur-sm shadow-lg border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} transition-all duration-300`}>
        <div className="container mx-auto px-6">
          <div className="flex space-x-1">
            {['calculator'].map(tab => (
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

      {/* Main content */}
      <main className="container mx-auto px-6 py-8">
        {activeTab === 'calculator' && (
          <Calculator
            darkMode={darkMode}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedProduct={selectedProduct}
            setSelectedProduct={setSelectedProduct}
            products={[]}
            passThrough={75}
          />
        )}
      </main>
    </div>
  );
}