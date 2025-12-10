import React, { useState, useEffect } from 'react';
import { APP_CONFIG } from '../config';
import { useLocalStorage } from '../hooks/useLocalStorage';
import HistoryTable from './HistoryTable';

const LinkGenForm = () => {
    const [history, setHistory] = useLocalStorage('link_history', []);
    const [brand, setBrand] = useState('');
    const [product, setProduct] = useState('');

    const uniqueBrands = [...new Set(APP_CONFIG.linkProducts.map(p => p.brand))];
    const filteredProducts = brand
        ? APP_CONFIG.linkProducts.filter(p => p.brand === brand)
        : APP_CONFIG.linkProducts;

    // Builder State
    const [builder, setBuilder] = useState({
        channel: '',
        type: '',
        post: '',
        isInternalType: true, // "สร้าง TypeDealer-internal"
        isInternalBanner: true // "สร้าง BannerID-internal"
    });

    // Form State
    const [formData, setFormData] = useState({
        baseUrl: '',
        params: '',
        bannerId: '',
    });

    const [typeDealerResult, setTypeDealerResult] = useState('');
    const [finalLink, setFinalLink] = useState('');

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
        // Logic: Try to match "Legacy" format. 
        // User didn't specify format, but usually it's Channel_Type_Post
        // We will just concatenate non-empty parts with underscores
        const parts = [
            builder.channel,
            builder.type,
            builder.post
        ].filter(Boolean);

        setTypeDealerResult(parts.join('_'));
    }, [builder.channel, builder.type, builder.post]);

    // 2. Build Final URL
    useEffect(() => {
        let url = formData.baseUrl;
        if (!url) {
            setFinalLink('');
            return;
        }

        const parts = [];

        // Manual Params
        if (formData.params) parts.push(formData.params);

        // Banner ID (Internal Toggle logic?)
        // User said: "สร้าง BannerID-internal /" -> Checked means include it?
        if (builder.isInternalBanner && formData.bannerId) {
            parts.push(`bannerid=${formData.bannerId}`);
        } else if (!builder.isInternalBanner && formData.bannerId) {
            // If unchecked, do we exclude it? Assuming yes.
        }

        // TypeDealer (Internal Toggle)
        if (builder.isInternalType && typeDealerResult) {
            parts.push(`typedealer=${typeDealerResult}`);
        }

        if (parts.length > 0) {
            const joiner = url.includes('?') ? '&' : '?';
            url += joiner + parts.join('&');
        }
        setFinalLink(url);
    }, [formData, builder, typeDealerResult]);

    const handleSave = () => {
        if (!finalLink) return alert("No link generated");
        setHistory([{ FinalURL: finalLink, ...formData, typeDealer: typeDealerResult, Timestamp: new Date().toLocaleString() }, ...history]);
        alert("Saved!");
    };

    const handleCopy = () => { navigator.clipboard.writeText(finalLink); alert("Copied!"); };
    const handleExport = () => {
        if (history.length === 0) return alert("No data");
        const headers = Object.keys(history[0]);
        const csv = [headers.join(','), ...history.map(row => headers.map(h => `"${row[h]}"`).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'Link_History.csv'; a.click();
    };

    return (
        <div className="card animate-fade-in">
            <h2 className="text-2xl font-bold text-center mb-1">Link Generator</h2>
            <p className="text-center text-slate-500 mb-8">Create tracking URLs for products</p>

            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 mb-8 text-center sticky top-20 z-40 shadow-sm">
                <label className="text-xs font-bold text-indigo-500 tracking-wider mb-2 block uppercase">Final URL</label>
                <div className="flex items-center gap-2">
                    <input readOnly value={finalLink} className="w-full text-center text-sm font-mono text-slate-800 bg-white border border-indigo-100 rounded-md py-3 px-4 focus:outline-none" />
                    <button onClick={handleCopy} className="bg-indigo-600 text-white px-6 py-3 rounded-md font-bold hover:bg-indigo-700 transition-colors">COPY</button>
                </div>
            </div>

            {/* 1. BUILDER: TypeDealer */}
            <div className="mb-8 bg-slate-50 p-6 rounded-lg border border-slate-200">
                <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <span className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
                    Builder: TypeDealer
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Channel</label>
                        <select value={builder.channel} onChange={e => setBuilder({ ...builder, channel: e.target.value })} className="input-field">
                            <option value="">Select Channel...</option>
                            {APP_CONFIG.linkChannels?.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                        <select value={builder.type} onChange={e => setBuilder({ ...builder, type: e.target.value })} className="input-field">
                            <option value="">Select Type...</option>
                            {APP_CONFIG.linkBuilderTypes?.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Post (Max 35)</label>
                        <input maxLength={35} type="text" value={builder.post} onChange={e => setBuilder({ ...builder, post: e.target.value })} className="input-field" placeholder="Campaign Name..." />
                    </div>
                </div>

                <div className="bg-white border border-slate-200 p-3 rounded-md mb-4 flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-500 uppercase">TypeDealer Result:</span>
                    <code className="text-indigo-600 font-bold">{typeDealerResult || "..."}</code>
                </div>

                <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input type="checkbox" checked={builder.isInternalType} onChange={e => setBuilder({ ...builder, isInternalType: e.target.checked })} className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" />
                        <span className="text-sm text-slate-700">สร้าง TypeDealer-internal</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input type="checkbox" checked={builder.isInternalBanner} onChange={e => setBuilder({ ...builder, isInternalBanner: e.target.checked })} className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" />
                        <span className="text-sm text-slate-700">สร้าง BannerID-internal</span>
                    </label>
                </div>
            </div>

            {/* 2. PARAMETERS */}
            <div className="mb-8 bg-slate-50 p-6 rounded-lg border border-slate-200">
                <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <span className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
                    URL Parameters
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Custom Parameters</label>
                        <input type="text" value={formData.params} onChange={e => setFormData({ ...formData, params: e.target.value })} className="input-field" placeholder="e.g. pnlid=123" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Banner ID (Optional)</label>
                        <input type="text" value={formData.bannerId} onChange={e => setFormData({ ...formData, bannerId: e.target.value })} className="input-field" placeholder="12345" />
                    </div>
                </div>
            </div>

            {/* 3. PRODUCT */}
            <div className="mb-8 bg-slate-50 p-6 rounded-lg border border-slate-200">
                <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <span className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">3</span>
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
                <div className="mt-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Target Base URL</label>
                    <input type="url" value={formData.baseUrl} onChange={e => setFormData({ ...formData, baseUrl: e.target.value })} className="input-field bg-slate-100" readOnly />
                </div>
            </div>

            <button onClick={handleSave} className="btn-primary">Save Output</button>
            <HistoryTable title="Link" data={history} onClear={() => setHistory([])} onExport={handleExport} />
        </div>
    );
};

export default LinkGenForm;
