import React from 'react';
import { TrendingUp, Package, AlertCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * Dashboard component displaying overview metrics and key visualizations
 * Shows pass-through rates over time and burden distribution by income level
 * NOTE: Some display values are hardcoded samples for development
 */
export default function Dashboard({ darkMode, passThroughData, burdenByIncome }) {
    return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top-level KPI cards - SAMPLE DATA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pass-through rate metric card */}
        <div className={`${darkMode ? 'bg-gray-800/90' : 'bg-white'} rounded-xl p-6 shadow-xl border ${darkMode ? 'border-gray-700/50' : 'border-gray-100'} transform hover:scale-105 transition-all duration-300 hover:shadow-2xl ${darkMode ? 'hover:shadow-violet-500/10' : 'hover:shadow-violet-500/20'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Average Pass-Through</p>
              {/* HARDCODED SAMPLE: 73.6% pass-through rate */}
              <p className="text-3xl font-bold text-violet-500">73.6%</p>
            </div>
            <TrendingUp className="w-10 h-10 text-violet-500 opacity-20" />
          </div>
        </div>
        
        {/* Product count metric card */}
        <div className={`${darkMode ? 'bg-gray-800/90' : 'bg-white'} rounded-xl p-6 shadow-xl border ${darkMode ? 'border-gray-700/50' : 'border-gray-100'} transform hover:scale-105 transition-all duration-300 hover:shadow-2xl ${darkMode ? 'hover:shadow-pink-500/10' : 'hover:shadow-pink-500/20'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Products Tracked</p>
              {/* HARDCODED SAMPLE: 1,247 products tracked */}
              <p className="text-3xl font-bold text-pink-500">1,247</p>
            </div>
            <Package className="w-10 h-10 text-pink-500 opacity-20" />
          </div>
        </div>
        
        {/* Consumer burden metric card */}
        <div className={`${darkMode ? 'bg-gray-800/90' : 'bg-white'} rounded-xl p-6 shadow-xl border ${darkMode ? 'border-gray-700/50' : 'border-gray-100'} transform hover:scale-105 transition-all duration-300 hover:shadow-2xl ${darkMode ? 'hover:shadow-blue-500/10' : 'hover:shadow-blue-500/20'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Avg Consumer Burden</p>
              {/* HARDCODED SAMPLE: $412 average burden */}
              <p className="text-3xl font-bold text-blue-500">$412</p>
            </div>
            <AlertCircle className="w-10 h-10 text-blue-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Main visualization charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Time series chart for pass-through rate trends */}
        <div className={`${darkMode ? 'bg-gray-800/90' : 'bg-white'} rounded-xl p-6 shadow-xl border ${darkMode ? 'border-gray-700/50' : 'border-gray-100'} backdrop-blur-sm`}>
          <h3 className="text-lg font-semibold mb-4">Pass-Through Rate Over Time</h3>
          {/* Line chart showing rate decline and volume impact over time */}
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={passThroughData}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
              <XAxis dataKey="name" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
              <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
              {/* Pass-through rate line (violet) */}
              <Line 
                type="monotone" 
                dataKey="rate" 
                stroke="#8b5cf6" 
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', r: 6 }}
                activeDot={{ r: 8 }}
              />
              {/* Import volume line (pink) */}
              <Line 
                type="monotone" 
                dataKey="volume" 
                stroke="#ec4899" 
                strokeWidth={3}
                dot={{ fill: '#ec4899', r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar chart showing regressive nature of tariffs */}
        <div className={`${darkMode ? 'bg-gray-800/90' : 'bg-white'} rounded-xl p-6 shadow-xl border ${darkMode ? 'border-gray-700/50' : 'border-gray-100'} backdrop-blur-sm`}>
          <h3 className="text-lg font-semibold mb-4">Burden by Income Level</h3>
          {/* Bar chart demonstrating regressive tariff impact */}
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={burdenByIncome}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
              <XAxis dataKey="decile" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
              <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
              {/* Burden bars (blue) with rounded tops */}
              <Bar dataKey="burden" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}