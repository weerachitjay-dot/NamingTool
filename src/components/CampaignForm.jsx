import React, { useState, useEffect } from 'react';
import { APP_CONFIG } from '../config';
import { useLocalStorage } from '../hooks/useLocalStorage';
import HistoryTable from './HistoryTable';

const CampaignForm = () => {
    const [history, setHistory] = useLocalStorage('campaign_history', []);

    const [formData, setFormData] = useState({
        obj: '',
        brand: '',
        cat: '',
        prod: '',
        aud: '',
        date: new Date().toISOString().slice(0, 10),
        page: '',
        addon: ''
    });

    const [finalName, setFinalName] = useState('');
    const [availableProducts, setAvailableProducts] = useState([]);

    // Update Product list when Brand changes
    useEffect(() => {
        if (formData.brand) {
            const products = APP_CONFIG.productsByBrand[formData.brand] || [];
            setAvailableProducts(products);
        } else {
            setAvailableProducts([]);
        }
    }, [formData.brand]);

    // Generate Name Logic
    useEffect(() => {
        const formatDateMMM = (dateString) => {
            if (!dateString) return "DATE";
            const d = new Date(dateString);
            const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
            return `${String(d.getDate()).padStart(2, '0')}${months[d.getMonth()]}`;
        };

        const { obj, brand, cat, prod, aud, date, page, addon } = formData;

        // Parts
        const parts = [
            obj || "OBJ",
            brand || "BRAND",
            cat || "CAT",
            prod || "PROD",
            aud || "AUD",
            formatDateMMM(date)
        ];

        let name = parts.join('_');
        if (page) name += `_(${page})`;
        if (addon) name += `_${addon}`;

        setFinalName(name.toUpperCase());
    }, [formData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        if (!formData.obj || !formData.brand || !formData.prod) {
            alert("Please complete at least Objective, Brand, and Product.");
            return;
        }

        const newItem = {
            ConfigName: finalName,
            ...formData,
            Timestamp: new Date().toLocaleString()
        };

        setHistory([newItem, ...history]);
        alert("Saved to History!");
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(finalName);
        alert("Copied: " + finalName);
    };

    const handleExport = () => {
        if (history.length === 0) return alert("No data");
        const headers = Object.keys(history[0]);
        const csv = [
            headers.join(','),
            ...history.map(row => headers.map(h => `"${row[h]}"`).join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Campaign_History_${new Date().toLocaleDateString()}.csv`;
        a.click();
    };

    return (
        <div className="card animate-fade-in">
            <h2 className="text-2xl font-bold text-center mb-1">Campaign Generator</h2>
            <p className="text-center text-slate-500 mb-8">Create standardized campaign naming conventions</p>

            {/* Result Box */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 mb-8 text-center sticky top-20 z-40 shadow-sm">
                <label className="text-xs font-bold text-indigo-500 tracking-wider mb-2 block uppercase">Generated Campaign Name</label>
                <div className="flex items-center gap-2">
                    <input
                        readOnly
                        value={finalName}
                        className="w-full text-center text-xl font-mono font-bold text-slate-800 bg-white border border-indigo-100 rounded-md py-3 px-4 focus:outline-none"
                    />
                    <button onClick={handleCopy} className="bg-indigo-600 text-white px-6 py-3 rounded-md font-bold hover:bg-indigo-700 transition-colors">
                        COPY
                    </button>
                </div>
            </div>

            {/* Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Objective</label>
                    <select name="obj" value={formData.obj} onChange={handleChange} className="input-field">
                        <option value="">Select Objective...</option>
                        {APP_CONFIG.objectives.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Branding</label>
                    <select name="brand" value={formData.brand} onChange={handleChange} className="input-field">
                        <option value="">Select Brand...</option>
                        {APP_CONFIG.brandings.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                    <select name="cat" value={formData.cat} onChange={handleChange} className="input-field">
                        <option value="">Select Category...</option>
                        {APP_CONFIG.categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Product</label>
                    <select
                        name="prod"
                        value={formData.prod}
                        onChange={handleChange}
                        disabled={!formData.brand}
                        className="input-field disabled:bg-slate-100 disabled:text-slate-400"
                    >
                        <option value="">{formData.brand ? "Select Product..." : "Select Brand First"}</option>
                        {availableProducts.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Audience</label>
                    <input type="text" name="aud" value={formData.aud} onChange={handleChange} placeholder="e.g. BROAD, INTEREST" className="input-field" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                    <input type="date" name="date" value={formData.date} onChange={handleChange} className="input-field" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Page (Optional)</label>
                    <input list="page_list" name="page" value={formData.page} onChange={handleChange} className="input-field" />
                    <datalist id="page_list">
                        {APP_CONFIG.pages.map(p => <option key={p} value={p} />)}
                    </datalist>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Addon (Optional)</label>
                    <input type="text" name="addon" value={formData.addon} onChange={handleChange} placeholder="Extra info" className="input-field" />
                </div>
            </div>

            <button onClick={handleSave} className="btn-primary mt-8">Save Output</button>

            <HistoryTable
                title="Campaign"
                data={history}
                onClear={() => setHistory([])}
                onExport={handleExport}
            />
        </div>
    );
};

export default CampaignForm;
