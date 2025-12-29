import React, { useState, useEffect } from 'react';
import { useConfig } from '../context/ConfigContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import HistoryTable from './HistoryTable';
import { saveData } from '../services/GoogleSheetsService';

const LinkGenForm2026 = () => {
    const { config } = useConfig();
    const [history, setHistory] = useLocalStorage('link_history_2026', []);

    // Config Options (Fallbacks in case context isn't ready or empty)
    const options = config.linkOptions2026 || {
        source: [], method: [], platform: [], creative: [], sequence: []
    };

    const uniqueBrands = [...new Set(config.linkProducts.map(p => p.brand))];
    const [brand, setBrand] = useState('');
    const filteredProducts = brand
        ? config.linkProducts.filter(p => p.brand === brand)
        : config.linkProducts;

    // Builder State
    const [builder, setBuilder] = useState({
        source: '',
        method: '',
        platform: '',
        creative: '',
        date: new Date().toISOString().slice(0, 10).replace(/-/g, ''), // Default YYYYMMDD
        sequence: 's1',
    });

    // Custom Text Components (Field G)
    const [customTextHelper, setCustomTextHelper] = useState({
        brand: '',
        product: '',
        freetext: ''
    });

    // Form State
    const [formData, setFormData] = useState({
        baseUrl: '',
        customBaseUrl: '',
        params: '',
        bannerId: '',
    });

    const [typeDealerResult, setTypeDealerResult] = useState('');
    const [finalLink, setFinalLink] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [customTextError, setCustomTextError] = useState('');

    const handleProductSelect = (prodName) => {
        if (prodName === 'Custom (อื่นๆ)') {
            setFormData(prev => ({ ...prev, baseUrl: '' }));
            return;
        }

        const match = config.linkProducts.find(p => p.product === prodName);
        if (match) {
            setFormData(prev => ({ ...prev, baseUrl: match.url }));
            if (!brand) setBrand(match.brand);

            // Auto-fill Custom Text Brand/Product if empty
            if (!customTextHelper.brand) setCustomTextHelper(prev => ({ ...prev, brand: match.brand }));
            if (!customTextHelper.product) setCustomTextHelper(prev => ({ ...prev, product: match.product }));
        }
    };

    // Auto-update Custom Text (G) and Validate
    const [customTextG, setCustomTextG] = useState('');

    useEffect(() => {
        const parts = [
            customTextHelper.brand,
            customTextHelper.product,
            customTextHelper.freetext
        ].filter(Boolean); // Remote empty strings

        let rawG = parts.join('-');

        // Sanitize: lowercase, replace spaces/underscores with dashes
        rawG = rawG.toLowerCase().replace(/[\s+_]/g, '-');

        setCustomTextG(rawG);

        if (rawG.length > 45) {
            setCustomTextError(`Exceeded limit: ${rawG.length}/45 chars`);
        } else {
            setCustomTextError('');
        }

    }, [customTextHelper]);

    const handleDateChange = (e) => {
        // Input type="date" returns YYYY-MM-DD
        const val = e.target.value.replace(/-/g, ''); // -> YYYYMMDD
        setBuilder({ ...builder, date: val });
    };

    // 1. Build TypeDealer Result (A-B-C-D-E-F-G)
    useEffect(() => {
        // Format: A-B-C-D-E-F-G
        const A = builder.source;
        const B = builder.method;
        const C = builder.platform;
        const D = builder.creative;
        const E = builder.date ? `d${builder.date}` : '';
        const F = builder.sequence;
        const G = customTextG;

        const parts = [A, B, C, D, E, F, G].filter(Boolean);
        const fullString = parts.join('-');

        setTypeDealerResult(fullString);

        // General Warnings
        if (!A || !B || !C || !D || !E || !F) {
            setErrorMsg('Missing required fields.');
        } else if (customTextError) {
            setErrorMsg('Fix Custom Text errors.');
        } else {
            setErrorMsg('');
        }

    }, [builder, customTextG, customTextError]);


    // 2. Build Final URL
    useEffect(() => {
        let url = formData.customBaseUrl || formData.baseUrl;

        if (!url) {
            setFinalLink('');
            return;
        }

        const parts = [];
        if (formData.params) parts.push(formData.params);
        if (formData.bannerId) parts.push(`bannerid=${formData.bannerId}`);

        // Start with TypeDealer result in the query string? 
        // Current requirement usually implies TypeDealer string is used for tracking parameter (e.g. utm_content or similar)
        // OR simply just generating the string.
        // Based on previous code, it seems we generated a string but didn't explicitly append it unless it was part of specific params.
        // However, standard usually appends it as `utm_campaign` or similar. 
        // *Revisiting previous LinkGenForm*: It didn't strictly append "typeDealerResult" to the URL automatically.
        // It just generated the string for record keeping.

        // We will keep it separate but available.

        if (parts.length > 0) {
            const joiner = url.includes('?') ? '&' : '?';
            url += joiner + parts.join('&');
        }
        setFinalLink(url);
    }, [formData]);

    const handleSave = async () => {
        if (!typeDealerResult) return alert("TypeDealer string incomplete");
        if (customTextError) return alert("Please fix errors");

        const row = {
            SourceType: builder.source,
            Method: builder.method,
            Platform: builder.platform,
            CreativeFormat: builder.creative,
            Date: `d${builder.date}`,
            Sequence: builder.sequence,
            CustomText: customTextG,
            FinalURL: finalLink,
            RawString: typeDealerResult,
            Timestamp: new Date().toLocaleString()
        };

        setHistory([row, ...history]);

        // Save to Google Sheet
        const res = await saveData('link2026', row);
        if (res.result === 'Success') {
            alert("Saved to Google Sheet!");
        } else {
            alert("Saved locally (Google Sheet failed: " + (res.error || "Unknown") + ")");
        }
    };

    const handleCopy = (text) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        alert("Copied: " + text);
    };

    const handleExport = () => {
        if (history.length === 0) return alert("No data");
        const headers = Object.keys(history[0]);
        const csv = [headers.join(','), ...history.map(row => headers.map(h => `"${row[h]}"`).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'Link_History_2026.csv'; a.click();
    };

    // Method filtering logic
    const availableMethods = builder.source === 'p'
        ? options.method.filter(m => ['post', 'article'].includes(m.value))
        : options.method;

    return (
        <div className="card animate-fade-in pb-24">
            <h2 className="text-2xl font-bold text-center mb-1">Standard Link Generator (2026)</h2>
            <p className="text-center text-slate-500 mb-8">TypeDealer Standard A-G</p>

            {/* 1. BUILDER: TypeDealer */}
            <div className="mb-8 bg-slate-50 p-6 rounded-lg border border-slate-200 shadow-sm relative">
                <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <span className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
                    Builder: TypeDealer
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {/* A */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">A: Source Type</label>
                        <select value={builder.source} onChange={e => setBuilder({ ...builder, source: e.target.value, method: '' })} className="input-field">
                            <option value="">Select...</option>
                            {options.source.map(opt => <option key={opt.value} value={opt.value}>{opt.label} ({opt.value})</option>)}
                        </select>
                    </div>
                    {/* B */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">B: Method</label>
                        <select value={builder.method} onChange={e => setBuilder({ ...builder, method: e.target.value })} className="input-field" disabled={!builder.source}>
                            <option value="">Select...</option>
                            {availableMethods.map(opt => <option key={opt.value} value={opt.value}>{opt.label} ({opt.value})</option>)}
                        </select>
                    </div>
                    {/* C */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">C: Platform</label>
                        <select value={builder.platform} onChange={e => setBuilder({ ...builder, platform: e.target.value })} className="input-field">
                            <option value="">Select...</option>
                            {options.platform.map(opt => <option key={opt.value} value={opt.value}>{opt.label} ({opt.value})</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {/* D */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">D: Creative</label>
                        <select value={builder.creative} onChange={e => setBuilder({ ...builder, creative: e.target.value })} className="input-field">
                            <option value="">Select...</option>
                            {options.creative.map(opt => <option key={opt.value} value={opt.value}>{opt.label} ({opt.value})</option>)}
                        </select>
                    </div>
                    {/* E */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">E: Date</label>
                        <input
                            type="date"
                            className="input-field"
                            // Value needs YYYY-MM-DD
                            value={builder.date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')}
                            onChange={handleDateChange}
                        />
                    </div>
                    {/* F */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">F: Sequence</label>
                        <select value={builder.sequence} onChange={e => setBuilder({ ...builder, sequence: e.target.value })} className="input-field">
                            {options.sequence.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                </div>

                {/* G */}
                <div className="bg-white p-3 rounded border border-slate-200 mb-4">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">G: Custom Text (Brand-Product-FreeText)</label>
                    <div className="grid grid-cols-3 gap-2">
                        <input
                            placeholder="Brand"
                            value={customTextHelper.brand}
                            onChange={e => setCustomTextHelper({ ...customTextHelper, brand: e.target.value })}
                            className="input-field text-sm"
                        />
                        <input
                            placeholder="Product"
                            value={customTextHelper.product}
                            onChange={e => setCustomTextHelper({ ...customTextHelper, product: e.target.value })}
                            className="input-field text-sm"
                        />
                        <input
                            placeholder="FreeText"
                            value={customTextHelper.freetext}
                            onChange={e => setCustomTextHelper({ ...customTextHelper, freetext: e.target.value })}
                            className="input-field text-sm"
                        />
                    </div>
                    <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-slate-400">Preview: {customTextG || '(empty)'}</span>
                        <span className={`text-xs font-bold ${customTextError ? 'text-red-500' : 'text-slate-400'}`}>
                            {customTextG.length}/45
                        </span>
                    </div>
                </div>

                {/* RESULT DISPLAY */}
                <div className="bg-slate-800 text-white p-4 rounded-md flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex-1 w-full overflow-hidden">
                        <span className="text-xs font-bold text-slate-400 uppercase block mb-1">TypeDealer Result</span>
                        <div className="font-mono text-lg font-bold break-all text-emerald-400">
                            {typeDealerResult || "..."}
                        </div>
                        {errorMsg && <p className="text-red-400 text-xs mt-1">{errorMsg}</p>}
                    </div>
                    <button
                        onClick={() => handleCopy(typeDealerResult)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md font-bold hover:bg-indigo-500 transition-colors text-sm whitespace-nowrap"
                    >
                        Copy String
                    </button>
                </div>
            </div>

            {/* PRODUCT & URL SECTION (SIMPLIFIED FOR 2026) */}
            <div className="mb-8 bg-slate-50 p-6 rounded-lg border border-slate-200">
                <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <span className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
                    Target URL
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Filter Brand</label>
                        <select value={brand} onChange={e => setBrand(e.target.value)} className="input-field">
                            <option value="">All Brands</option>
                            {uniqueBrands.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
                        <select onChange={e => handleProductSelect(e.target.value)} className="input-field h-auto py-2">
                            <option value="">Select Product...</option>
                            <option value="Custom (อื่นๆ)">Custom (อื่นๆ)</option>
                            {filteredProducts.map(p => <option key={p.product} value={p.product}>{p.product}</option>)}
                        </select>
                    </div>
                </div>
                <div className="relative mb-4">
                    <label className="block text-sm font-bold text-slate-700 mb-1">Base URL</label>
                    <input
                        type="url"
                        value={formData.customBaseUrl || formData.baseUrl}
                        onChange={e => setFormData({ ...formData, customBaseUrl: e.target.value })}
                        className="input-field"
                        placeholder="https://..."
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Params</label>
                        <input type="text" value={formData.params} onChange={e => setFormData({ ...formData, params: e.target.value })} className="input-field" placeholder="e.g. pnlid=123" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Banner ID</label>
                        <input type="text" value={formData.bannerId} onChange={e => setFormData({ ...formData, bannerId: e.target.value })} className="input-field" placeholder="12345" />
                    </div>
                </div>
            </div>

            {/* STICKY FINAL URL */}
            <div className="bg-indigo-900 icon-white text-white rounded-lg p-6 shadow-xl sticky bottom-4 z-50 border-2 border-indigo-400">
                <label className="text-xs font-bold text-indigo-300 tracking-wider mb-2 block uppercase flex justify-between">
                    <span>Final URL</span>
                </label>
                <div className="flex items-center gap-2">
                    <input
                        readOnly
                        value={finalLink}
                        className="w-full text-center text-sm font-mono text-white bg-indigo-800/50 border border-indigo-500 rounded-md py-3 px-4 focus:outline-none"
                    />
                    <button
                        onClick={() => handleCopy(finalLink)}
                        className="bg-emerald-500 text-white px-6 py-3 rounded-md font-bold hover:bg-emerald-600 transition-colors shadow-lg"
                    >
                        COPY
                    </button>
                    <button onClick={handleSave} className="bg-indigo-600 border border-indigo-500 text-white px-4 py-3 rounded-md font-bold hover:bg-indigo-700 transition-colors">
                        SAVE
                    </button>
                </div>
            </div>

            <HistoryTable title="Link 2026" data={history} onClear={() => setHistory([])} onExport={handleExport} />
        </div>
    );
};

export default LinkGenForm2026;
