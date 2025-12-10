import React, { useState, useEffect } from 'react';
import { APP_CONFIG } from '../config';
import { useLocalStorage } from '../hooks/useLocalStorage';
import HistoryTable from './HistoryTable';

const LinkGenForm = () => {
    const [history, setHistory] = useLocalStorage('link_history', []);
    const [brand, setBrand] = useState('');
    const [product, setProduct] = useState('');

    // Config Data
    const uniqueBrands = [...new Set(APP_CONFIG.linkProducts.map(p => p.brand))];
    const filteredProducts = brand
        ? APP_CONFIG.linkProducts.filter(p => p.brand === brand)
        : APP_CONFIG.linkProducts;

    // Builder State
    const [builder, setBuilder] = useState({
        channel: '',
        type: '',
        post: '',
    });

    // Form State
    const [formData, setFormData] = useState({
        baseUrl: '',
        params: '',
        bannerId: '',
    });

    const [typeDealerResult, setTypeDealerResult] = useState('');
    const [finalLink, setFinalLink] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const handleProductSelect = (prodName) => {
        setProduct(prodName);
        const match = APP_CONFIG.linkProducts.find(p => p.product === prodName);
        if (match) {
            setFormData(prev => ({ ...prev, baseUrl: match.url }));
            if (!brand) setBrand(match.brand);
        }
    };

    // 1. Build TypeDealer Result
    useEffect(() => {
        let rawString = (builder.channel || '') + (builder.type || '') + (builder.post || '');

        // Formatting Rules: Lowercase, replace space/plus/underscore with dash
        let formatted = rawString.toLowerCase().replace(/[\s+_]/g, '-');

        if (formatted.length > 50) {
            setErrorMsg(`Warning: Total length is ${formatted.length} chars (Limit: 50)`);
        } else {
            setErrorMsg('');
        }

        setTypeDealerResult(formatted);
    }, [builder]);

    // 2. Build Final URL
    useEffect(() => {
        let url = formData.baseUrl;
        if (!url) {
            setFinalLink('');
            return;
        }

        const parts = [];

        // Manual Params first? Or TypeDealer logic? 
        // User asked for "Select Product -> URL Params -> Final URL" visually, 
        // but Logic wise, we append parameters standardly.

        if (formData.params) parts.push(formData.params);

        // BannerID (from input)
        if (formData.bannerId) parts.push(`bannerid=${formData.bannerId}`);

        // TypeDealer 
        // User didn't specify the KEY for this logic update, only "TypeDealer คือ..."
        // Assuming we still append it as `typedealer=...` OR if this is for the INTERNAL tools.
        // User mentioned "สร้าง TypeDealer-internal" link.
        // But for the Final Link, usually we want it too. 
        // I will adhere to previous behavior: append it if it exists.
        // TypeDealer Result is NOT added to Final URL per user request
        // if (typeDealerResult) {
        //    parts.push(`typedealer=${typeDealerResult}`);
        // }

        if (parts.length > 0) {
            const joiner = url.includes('?') ? '&' : '?';
            url += joiner + parts.join('&');
        }
        setFinalLink(url);
    }, [formData, typeDealerResult]);

    const handleSave = () => {
        if (!finalLink) return alert("No link generated");
        setHistory([{ FinalURL: finalLink, ...formData, typeDealer: typeDealerResult, Timestamp: new Date().toLocaleString() }, ...history]);
        alert("Saved!");
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
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'Link_History.csv'; a.click();
    };

    return (
        <div className="card animate-fade-in pb-24">
            <h2 className="text-2xl font-bold text-center mb-1">Final URL Generator</h2>
            <p className="text-center text-slate-500 mb-8">Create compliant tracking links</p>

            {/* 1. BUILDER: TypeDealer */}
            <div className="mb-8 bg-slate-50 p-6 rounded-lg border border-slate-200 shadow-sm relative">
                <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <span className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
                    Builder: TypeDealer
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Channel</label>
                        <select value={builder.channel} onChange={e => setBuilder({ ...builder, channel: e.target.value })} className="input-field">
                            <option value="">Select Channel...</option>
                            {APP_CONFIG.linkChannels?.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                        <select value={builder.type} onChange={e => setBuilder({ ...builder, type: e.target.value })} className="input-field">
                            <option value="">Select Type...</option>
                            {APP_CONFIG.linkBuilderTypes?.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Post (Max 35)</label>
                        <input maxLength={35} type="text" value={builder.post} onChange={e => setBuilder({ ...builder, post: e.target.value })} className="input-field" placeholder="Campaign..." />
                        <div className="text-right text-xs text-slate-400 mt-1">{builder.post.length}/35</div>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 p-4 rounded-md flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex-1 w-full">
                        <span className="text-xs font-bold text-slate-500 uppercase block mb-1">TypeDealer Result</span>
                        <div className={`font-mono text-lg font-bold break-all ${errorMsg ? 'text-red-600' : 'text-indigo-600'}`}>
                            {typeDealerResult || "..."}
                        </div>
                        {errorMsg && <p className="text-red-500 text-xs mt-1 font-bold">{errorMsg}</p>}
                    </div>
                    <button
                        onClick={() => handleCopy(typeDealerResult)}
                        className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-md font-bold hover:bg-indigo-200 transition-colors text-sm whitespace-nowrap"
                    >
                        Copy
                    </button>
                </div>
            </div>

            {/* EXTERNAL LINKS */}
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

            {/* 3. PRODUCT */}
            <div className="mb-8 bg-slate-50 p-6 rounded-lg border border-slate-200">
                <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <span className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
                    Select Product
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Filter Brand</label>
                        <select value={brand} onChange={e => setBrand(e.target.value)} className="input-field">
                            <option value="">All Brands</option>
                            {uniqueBrands.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
                        <select value={product} onChange={e => handleProductSelect(e.target.value)} className="input-field whitespace-normal h-auto py-2">
                            <option value="">Select Product...</option>
                            {filteredProducts.map(p => <option key={p.product} value={p.product}>{p.product}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* 4. PARAMETERS */}
            <div className="mb-8 bg-slate-50 p-6 rounded-lg border border-slate-200">
                <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <span className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">3</span>
                    URL Parameters
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Custom Parameters</label>
                        <input type="text" value={formData.params} onChange={e => setFormData({ ...formData, params: e.target.value })} className="input-field" placeholder="e.g. pnlid=123" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Banner ID</label>
                        <input type="text" value={formData.bannerId} onChange={e => setFormData({ ...formData, bannerId: e.target.value })} className="input-field" placeholder="12345" />
                    </div>
                </div>
            </div>

            {/* STICKY FINAL URL - MOVED TO BOTTOM PER REQ? OR KEEP TOP? 
                User said "ลำดับตามเดิม Select Product URL Parameters FINAL URL".
                Usually Final URL is bottom result. I will place it at the bottom but maybe sticky.
            */}

            <div className="bg-indigo-900 text-white rounded-lg p-6 shadow-xl sticky bottom-4 z-50 border-2 border-indigo-400">
                <label className="text-xs font-bold text-indigo-300 tracking-wider mb-2 block uppercase flex justify-between">
                    <span>Final URL</span>
                    <span className="text-emerald-400 font-normal">Ready to use</span>
                </label>
                <div className="flex items-center gap-2">
                    <input
                        readOnly
                        value={finalLink}
                        className="w-full text-center text-sm font-mono text-white bg-indigo-800/50 border border-indigo-500 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder-indigo-400"
                        placeholder="Generate links by filling the form above..."
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

            <HistoryTable title="Link" data={history} onClear={() => setHistory([])} onExport={handleExport} />
        </div>
    );
};

export default LinkGenForm;
