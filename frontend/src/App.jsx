import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Calculator from './components/Calculator';
import Analysis from './components/Analysis';
import { calculatePassThrough, calculateConsumerBurden } from './utils/calculations';

/**
 * Main application component for TariffTax IQ
 * 
 * This is the root component that manages the entire application state and routing.
 * It handles theme management, navigation between tabs, and provides shared state
 * to child components for tariff calculations and product selection.
 * 
 * Features:
 * - Dark/light mode theme management with localStorage persistence
 * - Tab-based navigation (Dashboard, Calculator, Analysis)
 * - Global state management for product selection and search
 * - Responsive design with Tailwind CSS
 * 
 * @returns {JSX.Element} The main application component
 */
export default function App() {
  // =============================================
  // STATE MANAGEMENT
  // =============================================
  
  /**
   * Dark mode state with intelligent initialization
   * Priority: localStorage > system preference > default (true)
   */
  const [darkMode, setDarkMode] = useState(() => {
    // Ensure we're in a browser environment
    if (typeof window !== 'undefined') {
      // Check for saved user preference
      const saved = localStorage.getItem('darkMode');
      if (saved !== null) {
        return JSON.parse(saved);
      }
      // Fall back to system preference
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    // Server-side rendering default
    return true;
  });
  
  /**
   * Application navigation and interaction state
   */
  const [selectedProduct, setSelectedProduct] = useState(''); // Currently selected product HS code
  const [tariffRate, setTariffRate] = useState(10); // Default tariff rate percentage
  const [searchQuery, setSearchQuery] = useState(''); // Product search filter string
  const [activeTab, setActiveTab] = useState('dashboard'); // Current active tab view
  

  // =============================================
  // SAMPLE DATA FOR VISUALIZATIONS
  // =============================================
  
  /**
   * Time series data showing how pass-through rates decline over time
   * Demonstrates the economic reality that tariff pass-through rates decrease
   * as markets adjust and consumers find alternatives
   */
  const passThroughData = [
    { name: 'Month 1', rate: 93, volume: 100 },
    { name: 'Month 3', rate: 87, volume: 85 },
    { name: 'Month 6', rate: 75, volume: 70 },
    { name: 'Month 9', rate: 68, volume: 65 },
    { name: 'Month 12', rate: 50, volume: 60 },
  ];

  /**
   * Consumer burden data segmented by income level
   * Illustrates the regressive nature of tariffs - lower income households
   * bear a disproportionate burden as a percentage of their income
   */
  const burdenByIncome = [
    { decile: 'Bottom 20%', burden: 325, percentage: 2.1 },
    { decile: '20-40%', burden: 410, percentage: 1.8 },
    { decile: '40-60%', burden: 485, percentage: 1.5 },
    { decile: '60-80%', burden: 520, percentage: 1.2 },
    { decile: 'Top 20%', burden: 580, percentage: 0.8 },
  ];

  // =============================================
  // EFFECTS AND HANDLERS
  // =============================================

  /**
   * Apply dark mode changes to DOM and persist user preference
   * This effect runs whenever darkMode state changes
   */
  useEffect(() => {
    // Apply dark mode class to html element for Tailwind
    document.documentElement.classList.toggle('dark', darkMode);
    // Persist preference to localStorage for future visits
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  /**
   * Toggle between dark and light mode
   * @function
   */
  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  // =============================================
  // RENDER
  // =============================================
  
  return (
    <div className={`min-h-screen transition-all duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Application header with branding and theme toggle */}
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      
      {/* Main navigation tabs - Dashboard, Calculator, Analysis */}
      <nav className={`${darkMode ? 'bg-gray-800/90' : 'bg-white/90'} backdrop-blur-sm shadow-lg border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} transition-all duration-300`}>
        <div className="container mx-auto px-6">
          <div className="flex space-x-1">
            {/* Dynamically render navigation tabs */}
            {['dashboard', 'calculator', 'analysis'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-6 capitalize font-semibold transition-all duration-300 relative overflow-hidden group ${
                  activeTab === tab 
                    ? `text-violet-500 ${darkMode ? 'bg-violet-500/10' : 'bg-violet-50'}` // Active tab styling
                    : darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700/50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100' // Inactive tab styling
                } rounded-lg mx-1`}
              >
                <span className="relative z-10">{tab}</span>
                
                {/* Active tab indicator bar */}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-pink-500 rounded-full" />
                )}
                
                {/* Subtle hover effect gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-violet-500/5 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main content area - conditionally renders components based on active tab */}
      <main className="container mx-auto px-6 py-8">
        {/* Dashboard - Overview and key metrics */}
        {activeTab === 'dashboard' && (
          <Dashboard 
            darkMode={darkMode} 
            passThroughData={passThroughData} 
            burdenByIncome={burdenByIncome} 
          />
        )}
        
        {/* Calculator - Interactive tariff impact calculator */}
        {activeTab === 'calculator' && (
          <Calculator 
            darkMode={darkMode}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedProduct={selectedProduct}
            setSelectedProduct={setSelectedProduct}
            products={[]} // Empty array - Calculator fetches from API
            passThrough={75} // Default pass-through rate
          />
        )}
        
        {/* Analysis - Detailed sector and regional analysis */}
        {activeTab === 'analysis' && <Analysis darkMode={darkMode} />}
      </main>
    </div>
  );
}