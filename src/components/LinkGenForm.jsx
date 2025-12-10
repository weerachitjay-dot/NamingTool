import React, { useState, useEffect } from 'react';
import { APP_CONFIG } from '../config';
import { useLocalStorage } from '../hooks/useLocalStorage';
import HistoryTable from './HistoryTable';

const LinkGenForm = () => {
    const [history, setHistory] = useLocalStorage('link_history', []);
    const [brand, setBrand] = useState('');
    const [product, setProduct] = useState('');

    // Derived state for dropdowns
    const uniqueBrands = [...new Set(APP_CONFIG.linkProducts.map(p => p.brand))];
    const filteredProducts = brand
        ? APP_CONFIG.linkProducts.filter(p => p.brand === brand)
        : APP_CONFIG.linkProducts;

    const [formData, setFormData] = useState({
        baseUrl: '',
        builderType: '', // "Link Builder: TypeDealer"
        utmSource: '',
        utmMedium: '',
        utmCampaign: '',
        utmContent: '',
        utmTerm: '',
        bannerId: '',
    });
    const [finalLink, setFinalLink] = useState('');

    const handleProductSelect = (prodName) => {
        setProduct(prodName);
        const match = APP_CONFIG.linkProducts.find(p => p.product === prodName);
        if (match) {
            setFormData(prev => ({ ...prev, baseUrl: match.url }));
            if (!brand) setBrand(match.brand);
        }
    };

    useEffect(() => {
        let url = formData.baseUrl;
        if (!url) {
            setFinalLink('');
            return;
        }

        const params = new URLSearchParams();

        // 1. UTM Builder
        if (formData.utmSource) params.append('utm_source', formData.utmSource);
        if (formData.utmMedium) params.append('utm_medium', formData.utmMedium);
        if (formData.utmCampaign) params.append('utm_campaign', formData.utmCampaign);
        if (formData.utmContent) params.append('utm_content', formData.utmContent);
        if (formData.utmTerm) params.append('utm_term', formData.utmTerm);

        // 2. TypeDealer (If user meant adding a specific parameter)
        // Adjust this logic if "TypeDealer" means something else
        if (formData.builderType) params.append('type', formData.builderType);

        // 3. Banner ID
        if (formData.bannerId) params.append('bannerid', formData.bannerId);

        const queryString = params.toString();
        if (queryString) {
            const joiner = url.includes('?') ? '&' : '?';
            url += joiner + queryString;
        }
        setFinalLink(url);
    }, [formData]);

    const handleSave = () => {
        if (!finalLink) return alert("No link generated");
        setHistory([{ FinalURL: finalLink, ...formData, Timestamp: new Date().toLocaleString() }, ...history]);
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pb-6 border-b border-slate-100">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Filter Brand</label>
                    <select value={brand} onChange={e => setBrand(e.target.value)} className="input-field">
                        <option value="">All Brands</option>
                        {uniqueBrands.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Select Product (Auto-Fill)</label>
                    <select value={product} onChange={e => handleProductSelect(e.target.value)} className="input-field">
                        <option value="">Select Product...</option>
                        {filteredProducts.map(p => <option key={p.product} value={p.product}>{p.product}</option>)}
                    </select>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Base URL</label>
                    <input type="url" value={formData.baseUrl} onChange={e => setFormData({ ...formData, baseUrl: e.target.value })} className="input-field" placeholder="https://..." />
                </div>

                {/* BUILDER SECTION */}
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <h3 className="font-semibold text-slate-700 mb-4">Link Builder</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">TypeDealer (Builder)</label>
                            <select value={formData.builderType} onChange={e => setFormData({ ...formData, builderType: e.target.value })} className="input-field">
                                <option value="">Default</option>
                                <option value="Dealer">Dealer</option>
                                <option value="Direct">Direct</option>
                                <option value="Agent">Agent</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Banner ID</label>
                            <input type="text" value={formData.bannerId} onChange={e => setFormData({ ...formData, bannerId: e.target.value })} className="input-field" placeholder="12345" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">UTM Source</label>
                            <input type="text" value={formData.utmSource} onChange={e => setFormData({ ...formData, utmSource: e.target.value })} className="input-field" placeholder="facebook" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">UTM Medium</label>
                            <input type="text" value={formData.utmMedium} onChange={e => setFormData({ ...formData, utmMedium: e.target.value })} className="input-field" placeholder="cpc" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">UTM Campaign</label>
                            <input type="text" value={formData.utmCampaign} onChange={e => setFormData({ ...formData, utmCampaign: e.target.value })} className="input-field" placeholder="promo" />
                        </div>
                    </div>
                </div>
            </div>

            <button onClick={handleSave} className="btn-primary mt-8">Save Output</button>
            <HistoryTable title="Link" data={history} onClear={() => setHistory([])} onExport={handleExport} />
        </div>
    );
};

export default LinkGenForm;
