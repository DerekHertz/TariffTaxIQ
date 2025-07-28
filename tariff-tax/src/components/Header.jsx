import React from 'react';
import { Globe, Sun, Moon } from 'lucide-react';

export default function Header({ darkMode, toggleDarkMode }) {
    return (
        <header className={`${darkMode ? 'bg-gray-900/95' : 'bg-white/95'} backdrop-blur-md border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} sticky top-0 z-50 transition-all duration-300`}>
            <div className="container mx-auto px-6 py-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <Globe className="w-8 h-8 text-violet-500 animate-pulse" />
                            <div className="absolute inset-0 w-8 h-8 text-violet-500 opacity-20 animate-ping"></div>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                TariffTax IQ
                            </h1>
                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} font-medium`}>
                                Impact Calculator & Analysis
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={toggleDarkMode}
                        className={`p-3 rounded-xl transition-all duration-300 ${
                            darkMode 
                                ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400 shadow-lg hover:shadow-yellow-400/20' 
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 shadow-lg hover:shadow-gray-400/20'
                        } transform hover:scale-105 active:scale-95`}
                        aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
                    >
                        {darkMode ? (
                            <Sun className="w-5 h-5 transition-transform duration-300 hover:rotate-180" />
                        ) : (
                            <Moon className="w-5 h-5 transition-transform duration-300 hover:-rotate-12" />
                        )}
                    </button>
                </div>
            </div>
        </header>
    )
}