import React, { useState, useEffect } from 'react';
import { APP_CONFIG } from '../config';
import { useLocalStorage } from '../hooks/useLocalStorage';
import HistoryTable from './HistoryTable';

const AdNameForm = () => {
    const [history, setHistory] = useLocalStorage('ad_history', []);

    const [formData, setFormData] = useState({
        page: '',
        brand: '',
        prod: '',
        formatType: 'IMG', // Dropdown value
        customFormatType: '', // Manual input for Custom
        creative: '',
        date: new Date().toISOString().slice(0, 10),
    });

    const [manualProd, setManualProd] = useState(false);
    const [finalName, setFinalName] = useState('');
    const [availableProducts, setAvailableProducts] = useState([]);

    useEffect(() => {
        if (formData.brand) {
            setAvailableProducts(APP_CONFIG.productsByBrand[formData.brand] || []);
        } else {
            setAvailableProducts([]);
        }
    }, [formData.brand]);

    useEffect(() => {
        const formatDateMMM = (dateString) => {
            if (!dateString) return "DATE";
            const d = new Date(dateString);
            const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
            // Format DDMM e.g. 01JAN. Or default req? Previous code was DDMMM. 
            // User requested Ad Set Date Format? No, Campaign Gen was YYYY-MM-DD. 
            // Keeping Ad Name format as DDMMM per legacy unless requested.
            // Wait, previous code was:  ${String(d.getDate()).padStart(2, '0')}${months[d.getMonth()]}
            return `${String(d.getDate()).padStart(2, '0')}${months[d.getMonth()]}`;
        };

        const { page, brand, prod, formatType, customFormatType, creative, date } = formData;

        let typeVal = formatType === 'Custom' ? customFormatType : formatType;

        let prefix = page ? `(${page})` : "PAGE";
        let brandProd = brand || "BRAND";
        if (prod) brandProd += `-${prod}`;

        const parts = [
            prefix,
            brandProd,
            creative || "CREATIVE",
            typeVal || "TYPE",
            formatDateMMM(date)
        ];

        setFinalName(parts.join('_').toUpperCase());

    }, [formData]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSave = () => {
        if (!formData.brand) return alert("Please fill required fields.");
        setHistory([{ AdName: finalName, ...formData, Timestamp: new Date().toLocaleString() }, ...history]);
        alert("Saved!");
    };
    const handleCopy = () => { navigator.clipboard.writeText(finalName); alert("Copied!"); };
    const handleExport = () => {
        if (history.length === 0) return alert("No data");
        const headers = Object.keys(history[0]);
        const csv = [headers.join(','), ...history.map(row => headers.map(h => `"${row[h]}"`).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'AdName_History.csv'; a.click();
    };

    return (
        <div className="card animate-fade-in pb-24">
            <h2 className="text-2xl font-bold text-center mb-1">Ad Name Generator</h2>
            <p className="text-center text-slate-500 mb-8">Creative & Asset Naming</p>

            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 mb-8 text-center sticky top-20 z-40 shadow-sm">
                <label className="text-xs font-bold text-indigo-500 tracking-wider mb-2 block uppercase">Generated Ad Name</label>
                <div className="flex items-center gap-2">
                    <input readOnly value={finalName} className="w-full text-center text-xl font-mono font-bold text-slate-800 bg-white border border-indigo-100 rounded-md py-3 px-4 focus:outline-none" />
                    <button onClick={handleCopy} className="bg-indigo-600 text-white px-6 py-3 rounded-md font-bold hover:bg-indigo-700 transition-colors">COPY</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Facebook Page</label>
                    <input list="page_list_ad" name="page" value={formData.page} onChange={handleChange} className="input-field" placeholder="Select or Type..." />
                    <datalist id="page_list_ad">
                        {APP_CONFIG.pages.map(p => <option key={p} value={p} />)}
                    </datalist>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Brand</label>
                    <select name="brand" value={formData.brand} onChange={handleChange} className="input-field">
                        <option value="">Select Brand...</option>
                        {APP_CONFIG.brandings.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1 flex justify-between">
                        Product
                        <button
                            onClick={() => setManualProd(!manualProd)}
                            className="text-xs text-indigo-500 hover:text-indigo-700 underline font-normal"
                        >
                            {manualProd ? "Switch to List" : "Type Manual"}
                        </button>
                    </label>
                    {manualProd ? (
                        <input
                            type="text"
                            name="prod"
                            value={formData.prod}
                            onChange={handleChange}
                            className="input-field border-indigo-300 ring-1 ring-indigo-100"
                            placeholder="Type custom product..."
                        />
                    ) : (
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
                    )}
                </div>

                {/* Format Type */}
                <div className={formData.formatType === 'Custom' ? "md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg" : ""}>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Format Type</label>
                        <select name="formatType" value={formData.formatType} onChange={handleChange} className="input-field">
                            <option value="IMG">IMG</option>
                            <option value="VDO">VDO</option>
                            <option value="Custom">Custom</option>
                        </select>
                    </div>
                    {formData.formatType === 'Custom' && (
                        <div className="animate-fade-in">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Custom Format</label>
                            <input
                                type="text"
                                name="customFormatType"
                                value={formData.customFormatType}
                                onChange={handleChange}
                                className="input-field border-indigo-300 ring-1 ring-indigo-100"
                                placeholder="e.g. GIF, CAROUSEL"
                            />
                        </div>
                    )}
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Creative Name / Concept</label>
                    <input type="text" name="creative" value={formData.creative} onChange={handleChange} className="input-field" placeholder="e.g. PROMO50, VDAY" />
                </div>
            </div>
            <button onClick={handleSave} className="btn-primary mt-8">Save Output</button>
            <HistoryTable title="Ad Name" data={history} onClear={() => setHistory([])} onExport={handleExport} />
        </div>
    );
};

export default AdNameForm;
