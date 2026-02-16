import React, { useState, useEffect } from 'react';
import { useConfig } from '../context/ConfigContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import HistoryTable from './HistoryTable';

const CampaignForm = () => {
    const { config, isUsingGoogle, loadError } = useConfig();
    const [history, setHistory] = useLocalStorage('campaign_history', []);
    const [formData, setFormData] = useState({
        name: '',
        objective: '',
        branding: '',
        product: '',
        audience: '',
        page: '',
        date: new Date().toISOString().split('T')[0],
        addon: '',
    });

    const [manualMode, setManualMode] = useState({
        objective: false,
        branding: false,
        product: false,
        page: false
    });

    // Products list from config (no longer filtered by brand)
    const availableProducts = config.products || [];

    const toggleManual = (field) => {
        setManualMode(prev => ({ ...prev, [field]: !prev[field] }));
        // Optionally clear the value or keep it? Keeping it is better UX (e.g. modify existing)
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Auto-generate Name
    useEffect(() => {
        const formattedPage = formData.page ? `(${formData.page})` : '';

        // Brand+Product (Joined by + per user request)
        const productPart = [formData.branding, formData.product].filter(Boolean).join('+');

        const parts = [
            formData.objective,
            productPart, // brand-product
            formData.audience,
            formData.date,
            formattedPage,
            formData.addon
        ].filter(Boolean);

        setFormData(prev => ({ ...prev, name: parts.join('_').toUpperCase() }));
    }, [
        formData.objective, formData.branding, formData.product,
        formData.audience, formData.page, formData.date, formData.addon
    ]);

    const handleSave = () => {
        if (!formData.name) return alert("Incomplete Name");
        setHistory([{ ...formData, Timestamp: new Date().toLocaleString() }, ...history]);
        alert("Saved!");
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(formData.name);
        alert("Copied!");
    };

    const handleExport = () => {
        if (history.length === 0) return alert("No data");
        const headers = Object.keys(history[0]);
        const csv = [headers.join(','), ...history.map(row => headers.map(h => `"${row[h]}"`).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'Campaign_History.csv'; a.click();
    };

    // Helper to render Field with Toggle
    const renderField = (label, fieldKey, options, placeholder = "Select...") => {
        const isManual = manualMode[fieldKey];
        return (
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex justify-between items-center">
                    {label}
                    <button
                        onClick={() => toggleManual(fieldKey)}
                        className="text-xs text-indigo-500 hover:text-indigo-700 underline font-normal"
                    >
                        {isManual ? "Switch to List" : "Type Manual"}
                    </button>
                </label>
                {isManual ? (
                    <input
                        type="text"
                        value={formData[fieldKey]}
                        onChange={(e) => handleChange(fieldKey, e.target.value)}
                        className="input-field border-indigo-300 ring-1 ring-indigo-100" // Highlight manual input
                        placeholder={`Type ${label}...`}
                    />
                ) : (
                    <select
                        value={formData[fieldKey]}
                        onChange={(e) => handleChange(fieldKey, e.target.value)}
                        className="input-field"
                    >
                        <option value="">{placeholder}</option>
                        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                )}
            </div>
        );
    };

    return (
        <div className="card animate-fade-in pb-24">
            <h2 className="text-2xl font-bold text-center mb-6">Campaign Name Generator</h2>

            {/* Google Sheets Status Banner */}
            {isUsingGoogle ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-green-800 font-medium">Using Google Sheets configuration</span>
                </div>
            ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                    <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div className="flex-1">
                            <p className="text-sm text-amber-800 font-medium">Using fallback configuration</p>
                            {loadError && <p className="text-xs text-amber-700 mt-1">{loadError}</p>}
                        </div>
                    </div>
                </div>
            )}

            {/* Generated Name Display - Font Size Reduced per Request */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 mb-8 text-center sticky top-20 z-40 shadow-sm">
                <label className="text-xs font-bold text-indigo-500 tracking-wider mb-2 block uppercase">Generated Campaign Name</label>
                <div className="flex items-center gap-2">
                    {/* Changed text-2xl/xl to text-lg for readability */}
                    <div className="w-full text-center text-lg font-mono text-slate-800 bg-white border border-indigo-100 rounded-md py-3 px-4 break-all min-h-[50px] flex items-center justify-center">
                        {formData.name || <span className="text-slate-300 italic">Complete the form...</span>}
                    </div>
                    <button onClick={handleCopy} className="bg-indigo-600 text-white px-4 py-3 rounded-md font-bold hover:bg-indigo-700 transition-colors">COPY</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 space-y-2">

                {/* Objective */}
                {renderField("Objective", "objective", config.objectives)}

                {/* Branding */}
                {renderField("Branding", "branding", config.brandings)}

                {/* Product */}
                {renderField("Product", "product", availableProducts, "Select Product...")}

                {/* Audience (Not requested to be manual, but keeping standard select) */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Audience</label>
                    <input type="text" value={formData.audience} onChange={e => handleChange('audience', e.target.value)} className="input-field" placeholder="Target Audience..." />
                </div>

                {/* Page */}
                {renderField("Page (Optional)", "page", config.pages)}

                {/* Date */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                    <input type="date" value={formData.date} onChange={e => handleChange('date', e.target.value)} className="input-field" />
                </div>

                {/* Addon */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Addon (Optional)</label>
                    <input type="text" value={formData.addon} onChange={e => handleChange('addon', e.target.value)} className="input-field" placeholder="Extra info..." />
                </div>
            </div>

            <button onClick={handleSave} className="btn-primary mt-8">Save to History</button>
            <HistoryTable title="Campaign" data={history} onClear={() => setHistory([])} onExport={handleExport} />
        </div>
    );
};

export default CampaignForm;
