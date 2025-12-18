import React from 'react';

const Layout = ({ activeTab, onTabChange, children }) => {
    const tabs = [
        { id: 'campaign', label: 'Campaign' },
        { id: 'adset', label: 'Ad Set' },
        { id: 'ad', label: 'Ad Name' },
        { id: 'link', label: 'Link Gen' },
        { id: 'nameparser', label: 'Name Parser' },
        { id: 'phonenormalizer', label: 'Phone Normalizer' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M7 12h10M7 8h10M7 16h6" />
                                </svg>
                            </div>
                            <span className="font-bold text-slate-800 text-lg">NamingTool <span className="text-indigo-600">Pro</span></span>
                        </div>

                        {/* Navigation Links */}
                        <div className="flex gap-2 overflow-x-auto no-scrollbar">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => onTabChange(tab.id)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap
                                        ${activeTab === tab.id
                                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                            : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 mt-8">
                {children}
            </main>
        </div>
    );
};

export default Layout;
