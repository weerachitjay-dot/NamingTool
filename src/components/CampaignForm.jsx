import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import HistoryTable from './HistoryTable';
import { useConfig } from '../context/ConfigContext';
import { saveData } from '../services/GoogleSheetsService';

const CampaignForm = () => {
    const { config, loading } = useConfig();
    const [history, setHistory] = useLocalStorage('campaign_history', []);

    // Config Options from Context (Fallback to empty if loading)
    const objectives = config?.objectives || [];
    const brandings = config?.brandings || [];
    const categories = config?.categories || [];
    const productsByBrand = config?.productsByBrand || {};
    const pages = config?.pages || [];

    const [formData, setFormData] = useState({
        name: '',
        objective: '',
        branding: '',
        category: '',
        product: '',
        audience: '',
        page: '',
        date: new Date().toISOString().split('T')[0],
        addon: '',
    });

    const [manualMode, setManualMode] = useState({
        objective: false,
        branding: false,
        category: false,
        product: false,
        audience: false,
        page: false
    });

    // Derived Products based on Branding
    const availableProducts = (formData.branding && productsByBrand[formData.branding])
        ? productsByBrand[formData.branding]
        : [];

    const toggleManual = (field) => {
        setManualMode(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Auto-generate Name
    useEffect(() => {
        const formattedPage = formData.page ? `(${formData.page})` : '';

        // 1. Branding + Category (Joined by +)
        const brandCat = [formData.branding, formData.category].filter(Boolean).join('+');

        // 2. Add Product (Joined by - if brandCat exists)
        let middleSection = brandCat;
        if (formData.product) {
            middleSection = middleSection ? `${middleSection}-${formData.product}` : formData.product;
        }

        const parts = [
            formData.objective,
            middleSection,
            formData.audience,
            formData.date,
            formattedPage,
            formData.addon
        ].filter(Boolean);

        setFormData(prev => ({ ...prev, name: parts.join('_').toUpperCase() }));
    }, [
        formData.objective, formData.branding, formData.category, formData.product,
        formData.audience, formData.page, formData.date, formData.addon
    ]);

    const handleSave = async () => {
        if (!formData.name) return alert("Incomplete Name");

        // 1. Save Local
        setHistory([{ ...formData, Timestamp: new Date().toLocaleString() }, ...history]);

        // 2. Save to Google Sheets
        alert("Saving...");
        // Payload matches the columns defined in Setup Instructions
        // We send the whole object, the script will pick what it needs or save raw JSON if generic.
        // Assuming Script expects "OP, BRAND, CAT, PAGE" specifically? 
        // For flexibility, let's send these fields.
        const payload = {
            Objective: formData.objective,
            Branding: formData.branding,
            Category: formData.category,
            Product: formData.product,
            Audience: formData.audience,
            Page: formData.page,
            Date: formData.date,
            GeneratedName: formData.name
        };

        await saveData('campaign', payload);
        alert("Saved to Database!");
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
                        className="input-field border-indigo-300 ring-1 ring-indigo-100"
                        placeholder={`Type ${label}...`}
                    />
                ) : (
                    <select
                        value={formData[fieldKey]}
                        onChange={(e) => handleChange(fieldKey, e.target.value)}
                        className="input-field"
                    >
                        <option value="">{loading ? "Loading..." : placeholder}</option>
                        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                )}
            </div>
        );
    };

    return (
        <div className="card animate-fade-in pb-24">
            <h2 className="text-2xl font-bold text-center mb-6">Campaign Name Generator</h2>

            {/* Generated Name Display */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 mb-8 text-center sticky top-20 z-40 shadow-sm">
                <label className="text-xs font-bold text-indigo-500 tracking-wider mb-2 block uppercase">Generated Campaign Name</label>
                <div className="flex items-center gap-2">
                    <div className="w-full text-center text-lg font-mono text-slate-800 bg-white border border-indigo-100 rounded-md py-3 px-4 break-all min-h-[50px] flex items-center justify-center">
                        {formData.name || <span className="text-slate-300 italic">Complete the form...</span>}
                    </div>
                    <button onClick={handleCopy} className="bg-indigo-600 text-white px-4 py-3 rounded-md font-bold hover:bg-indigo-700 transition-colors">COPY</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 space-y-2">

                {/* Objective */}
                {renderField("Objective", "objective", objectives)}

                {/* Branding */}
                {renderField("Branding", "branding", brandings)}

                {/* Category */}
                {renderField("Category", "category", categories)}

                {/* Product */}
                {renderField("Product", "product", availableProducts, formData.branding ? "Select Product..." : "Select Branding First")}

                {/* Audience */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Audience</label>
                    <input type="text" value={formData.audience} onChange={e => handleChange('audience', e.target.value)} className="input-field" placeholder="Target Audience..." />
                </div>

                {/* Page */}
                {renderField("Page (Optional)", "page", pages)}

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

            <button onClick={handleSave} className="btn-primary mt-8">Save to Database</button>
            <HistoryTable title="Campaign" data={history} onClear={() => setHistory([])} onExport={handleExport} />
        </div>
    );
};

export default CampaignForm;
