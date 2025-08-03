import React from 'react';
import { BarChart3, TrendingDown, Users, DollarSign } from 'lucide-react';

/**
 * Analysis component displaying comprehensive tariff impact data
 * Shows sector-specific impacts, regional variations, and economic indicators
 * NOTE: All data values are currently hardcoded samples for development
 */
export default function Analysis({ darkMode }) {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Analysis overview and introduction */}
      <div className={`${darkMode ? 'bg-gray-800/90' : 'bg-white'} rounded-xl p-6 shadow-xl border ${darkMode ? 'border-gray-700/50' : 'border-gray-100'} backdrop-blur-sm`}>
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-8 h-8 text-violet-500" />
          Tariff Impact Analysis
        </h2>
        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Comprehensive analysis of tariff impacts on different sectors and income groups.
        </p>
      </div>

      {/* High-level impact metrics cards - SAMPLE DATA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Import volume impact metric */}
        <div className={`${darkMode ? 'bg-gray-800/90' : 'bg-white'} rounded-xl p-6 shadow-xl border ${darkMode ? 'border-gray-700/50' : 'border-gray-100'} transform hover:scale-105 transition-all duration-300`}>
          <div className="flex items-center justify-between mb-4">
            <TrendingDown className="w-8 h-8 text-red-500" />
            {/* HARDCODED SAMPLE: -12.3% import volume change */}
            <span className="text-3xl font-bold text-red-500">-12.3%</span>
          </div>
          <h3 className="font-semibold mb-2">Import Volume Change</h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Average reduction in import volumes across affected products
          </p>
        </div>

        {/* Consumer burden metric */}
        <div className={`${darkMode ? 'bg-gray-800/90' : 'bg-white'} rounded-xl p-6 shadow-xl border ${darkMode ? 'border-gray-700/50' : 'border-gray-100'} transform hover:scale-105 transition-all duration-300`}>
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 text-blue-500" />
            {/* HARDCODED SAMPLE: 2.1% consumer burden */}
            <span className="text-3xl font-bold text-blue-500">2.1%</span>
          </div>
          <h3 className="font-semibold mb-2">Consumer Burden</h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Average increase in household spending on affected goods
          </p>
        </div>

        {/* Revenue generation metric */}
        <div className={`${darkMode ? 'bg-gray-800/90' : 'bg-white'} rounded-xl p-6 shadow-xl border ${darkMode ? 'border-gray-700/50' : 'border-gray-100'} transform hover:scale-105 transition-all duration-300`}>
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-green-500" />
            {/* HARDCODED SAMPLE: $8.2B revenue generated */}
            <span className="text-3xl font-bold text-green-500">$8.2B</span>
          </div>
          <h3 className="font-semibold mb-2">Revenue Generated</h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Total tariff revenue collected annually
          </p>
        </div>
      </div>

      {/* Detailed breakdown by sector and region - SAMPLE DATA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sector-specific impact analysis */}
        <div className={`${darkMode ? 'bg-gray-800/90' : 'bg-white'} rounded-xl p-6 shadow-xl border ${darkMode ? 'border-gray-700/50' : 'border-gray-100'} transform hover:scale-105 transition-all duration-300`}>
          <h3 className="text-lg font-semibold mb-4">Impact by Sector</h3>
          <div className="space-y-4">
            {/* HARDCODED SAMPLE: Impact severity by economic sector */}
            {[
              { sector: 'Electronics', impact: 85, colorClass: 'bg-red-500' },
              { sector: 'Textiles', impact: 72, colorClass: 'bg-orange-500' },
              { sector: 'Machinery', impact: 68, colorClass: 'bg-yellow-500' },
              { sector: 'Automotive', impact: 45, colorClass: 'bg-blue-500' },
              { sector: 'Agriculture', impact: 32, colorClass: 'bg-green-500' }
            ].map(item => (
              <div key={item.sector} className="flex items-center justify-between">
                <span className="font-medium">{item.sector}</span>
                <div className="flex items-center gap-3">
                  {/* Progress bar container with proper width calculation */}
                  <div className={`w-32 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full h-2 relative overflow-hidden`}>
                    <div 
                      className={`h-2 rounded-full ${item.colorClass} transition-all duration-500 ease-out`}
                      style={{ width: `${Math.max(0, Math.min(100, item.impact))}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold w-8 text-right">{item.impact}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Geographic impact distribution */}
        <div className={`${darkMode ? 'bg-gray-800/90' : 'bg-white'} rounded-xl p-6 shadow-xl border ${darkMode ? 'border-gray-700/50' : 'border-gray-100'} transform hover:scale-105 transition-all duration-300`}>
          <h3 className="text-lg font-semibold mb-4">Regional Impact</h3>
          <div className="space-y-4">
            {/* HARDCODED SAMPLE: Regional variation in tariff burden */}
            {[
              { region: 'Northeast', burden: '$425', percentage: '1.8%' },
              { region: 'Southeast', burden: '$398', percentage: '2.2%' },
              { region: 'Midwest', burden: '$445', percentage: '2.0%' },
              { region: 'Southwest', burden: '$412', percentage: '1.9%' },
              { region: 'West Coast', burden: '$467', percentage: '1.6%' }
            ].map(item => (
              <div key={item.region} className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="flex justify-between items-center">
                  <span className="font-medium">{item.region}</span>
                  <div className="text-right">
                    <div className="font-bold text-violet-500">{item.burden}</div>
                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {item.percentage} of income
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key economic performance indicators - SAMPLE DATA */}
      <div className={`${darkMode ? 'bg-gray-800/90' : 'bg-white'} rounded-xl p-6 shadow-xl border ${darkMode ? 'border-gray-700/50' : 'border-gray-100'} backdrop-blur-sm`}>
        <h3 className="text-lg font-semibold mb-4">Economic Indicators</h3>
        {/* HARDCODED SAMPLE: Summary statistics grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            {/* SAMPLE: 73.6% pass-through rate */}
            <div className="text-2xl font-bold text-violet-500 mb-1">73.6%</div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Average Pass-Through Rate
            </div>
          </div>
          <div className="text-center">
            {/* SAMPLE: -0.8% GDP impact */}
            <div className="text-2xl font-bold text-pink-500 mb-1">-0.8%</div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              GDP Impact
            </div>
          </div>
          <div className="text-center">
            {/* SAMPLE: 2.3M jobs affected */}
            <div className="text-2xl font-bold text-blue-500 mb-1">2.3M</div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Jobs Affected
            </div>
          </div>
          <div className="text-center">
            {/* SAMPLE: $412 household impact */}
            <div className="text-2xl font-bold text-green-500 mb-1">$412</div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Avg Household Impact
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}