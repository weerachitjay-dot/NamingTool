import React, { useState, useEffect } from 'react';
import { useConfig } from '../context/ConfigContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import HistoryTable from './HistoryTable';
import { saveData } from '../services/GoogleSheetsService';

const LinkGenForm2026 = () => {
    const { config } = useConfig();
    const [history, setHistory] = useLocalStorage('link_history_2026', []);

    // Config Options
    const options = config.linkOptions2026 || {
        source: [], method: [], platform: [], creative: [], sequence: []
    };

    // Product Map for 2026 (Refactored)
    const productMap = config.productMap2026 || {};
    const availableBrands = Object.keys(productMap);

    // Builder State
    const [builder, setBuilder] = useState({
        source: '',
        method: '',
        platform: '',
        creative: '',
        date: new Date().toISOString().slice(0, 10).replace(/-/g, ''),
        sequence: 's1',
    });

    // Unified State: Section 2 (Product & Destination)
    // Controls both G-String and Final URL
    const [gState, setGState] = useState({
        brand: '',
        productCode: '', // Internal code for G string
        freetext: ''
    });

    // Valid products for selected brand
    const availableProducts = gState.brand ? productMap[gState.brand] : [];

    // Form State (Destination URL)
    const [formData, setFormData] = useState({
        baseUrl: '', // Automatically set by Product Selection
        customBaseUrl: '', // User override
        params: '',
        bannerId: '',
    });

    // Handle Brand Change
    const handleBrandChange = (e) => {
        const newBrand = e.target.value;
        setGState(prev => ({ ...prev, brand: newBrand, productCode: '' }));
        // Reset URL if brand changes (optional, but cleaner)
        setFormData(prev => ({ ...prev, baseUrl: '', customBaseUrl: '' }));
    };

    // Handle Product Change
    const handleProductChange = (e) => {
        const code = e.target.value;
        setGState(prev => ({ ...prev, productCode: code }));

        // Find match to set Base URL
        if (gState.brand && code) {
            const match = productMap[gState.brand].find(p => p.codeName === code);
            if (match) {
                // Set default Base URL, clear custom override
                setFormData(prev => ({ ...prev, baseUrl: match.baseUrl, customBaseUrl: '' }));
            }
        } else {
            setFormData(prev => ({ ...prev, baseUrl: '' }));
        }
    };

    // Auto-update Custom Text (G) and Validate
    const [customTextG, setCustomTextG] = useState('');
    const [customTextError, setCustomTextError] = useState('');

    useEffect(() => {
        // G String Construction: Brand-ProductCode-Freetext
        const parts = [
            gState.brand,
            gState.productCode,
            gState.freetext
        ].filter(Boolean);

        let rawG = parts.join('-');
        rawG = rawG.toLowerCase().replace(/[\s+_]/g, '-');

        setCustomTextG(rawG);

        if (rawG.length > 45) {
            setCustomTextError(`Exceeded limit: ${rawG.length}/45 chars`);
        } else {
            setCustomTextError('');
        }

    }, [gState]);

    const handleDateChange = (e) => {
        const val = e.target.value.replace(/-/g, '');
        setBuilder({ ...builder, date: val });
    };

    // 1. Build TypeDealer Result (A-B-C-D-E-F-G)
    const [typeDealerResult, setTypeDealerResult] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isDuplicate, setIsDuplicate] = useState(false);

    useEffect(() => {
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

        // Duplicate Check
        let dup = false;
        if (builder.date && builder.sequence) {
            const currentFormattedDate = `d${builder.date}`;
            dup = history.some(h => h.Date === currentFormattedDate && h.Sequence === builder.sequence);
        }
        setIsDuplicate(dup);

        if (!A || !B || !C || !D || !E || !F) {
            setErrorMsg('Missing required fields.');
        } else if (customTextError) {
            setErrorMsg('Fix Custom Text errors.');
        } else if (dup) {
            setErrorMsg('Error: Duplicate Sequence for this Date.');
        } else {
            setErrorMsg('');
        }

    }, [builder, customTextG, customTextError, history]);


    // 2. Build Final URL
    const [finalLink, setFinalLink] = useState('');

    useEffect(() => {
        // Use custom override if present, else default base
        let url = formData.customBaseUrl || formData.baseUrl;

        if (!url) {
            setFinalLink('');
            return;
        }

        const parts = [];
        if (formData.params) parts.push(formData.params);
        if (formData.bannerId) parts.push(`bannerid=${formData.bannerId}`);

        if (parts.length > 0) {
            const joiner = url.includes('?') ? '&' : '?';
            url += joiner + parts.join('&');
        }
        setFinalLink(url);
    }, [formData]);

    const handleSave = async () => {
        if (!typeDealerResult) return alert("TypeDealer string incomplete");
        if (customTextError) return alert("Please fix errors");
        if (isDuplicate) return alert("Error: Duplicate Sequence. Please change Sequence or Date.");

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

                {/* G: Brand, Product, Freetext (MOVED HERE) */}
                <div className="bg-white p-4 rounded-md border border-slate-200 mb-4 bg-yellow-50/30">
                    <label className="block text-xs font-bold text-indigo-600 uppercase mb-2">
                        G: Product Selection (Custom Text)
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                        {/* 1. Brand */}
                        <select value={gState.brand} onChange={handleBrandChange} className="input-field text-sm">
                            <option value="">Select Brand...</option>
                            {availableBrands.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>

                        {/* 2. Product */}
                        <select value={gState.productCode} onChange={handleProductChange} className="input-field text-sm" disabled={!gState.brand}>
                            <option value="">Select Product...</option>
                            {availableProducts.map(p => (
                                <option key={p.codeName} value={p.codeName}>
                                    {p.displayName}
                                </option>
                            ))}
                        </select>

                        {/* 3. Freetext */}
                        <input
                            placeholder="FreeText (Optional)"
                            value={gState.freetext}
                            onChange={e => setGState({ ...gState, freetext: e.target.value })}
                            className="input-field text-sm"
                        />
                    </div>
                    <div className="flex justify-between items-center px-1">
                        <span className="text-xs text-slate-400">
                            G String: {customTextG || '...'}
                        </span>
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

            {/* EXTERNAL LINKS BUTTONS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <a
                    href="https://www.silkspan.com/webpartner/group/"
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-col items-center justify-center p-4 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors group text-center"
                >
                    <span className="text-emerald-700 font-bold mb-1 group-hover:underline">สร้าง TypeDealer-internal</span>
                    <span className="text-xs text-emerald-500">Open External Tool ↗</span>
                </a>

                <a
                    href="https://web.silkspan.com/Insurancedocument/BannerSet.aspx"
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-col items-center justify-center p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors group text-center"
                >
                    <span className="text-blue-700 font-bold mb-1 group-hover:underline">สร้าง BannerID-internal</span>
                    <span className="text-xs text-blue-500">Open External Tool ↗</span>
                </a>
            </div>

            {/* 2. TARGET URL SECTION (Simplified) */}
            <div className="mb-8 bg-slate-50 p-6 rounded-lg border border-slate-200">
                <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <span className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
                    Target URL & Parameters
                </h3>

                {/* Base URL (Auto-set but Editable) */}
                <div className="relative mb-4">
                    <label className="block text-sm font-bold text-slate-700 mb-1">Base URL</label>
                    <input
                        type="url"
                        value={formData.customBaseUrl || formData.baseUrl}
                        onChange={e => setFormData({ ...formData, customBaseUrl: e.target.value })}
                        className="input-field bg-slate-100"
                        placeholder="Select Product in Step 1 to auto-fill (or type here)..."
                    />
                    {formData.baseUrl && !formData.customBaseUrl && (
                        <p className="text-xs text-slate-500 mt-1">
                            Link from: {gState.brand} / {gState.productCode}
                        </p>
                    )}
                    {formData.customBaseUrl && (
                        <p className="text-xs text-orange-500 mt-1 font-bold">
                            * Custom URL Override Active
                        </p>
                    )}
                </div>

                {/* Params & BannerID */}
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
