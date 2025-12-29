import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import HistoryTable from './HistoryTable';
import { useConfig } from '../context/ConfigContext';
import { saveData } from '../services/GoogleSheetsService';

const AdSetForm = () => {
    const { config, loading } = useConfig();
    const [history, setHistory] = useLocalStorage('adset_history', []);

    // Config options
    const adSetCategories = config?.adSetCategories || [];
    const locations = config?.locations || [];

    const [formData, setFormData] = useState({
        type: '',
        cat: '',
        aud: '',
        loc: '',
        gender: 'ALL',
        age: ''
    });

    const [manualLoc, setManualLoc] = useState(false);
    const [finalName, setFinalName] = useState('');

    useEffect(() => {
        const { type, cat, aud, loc, gender, age } = formData;
        const parts = [
            type || "TYPE",
            cat || "CAT",
            aud || "AUD",
            loc || "LOC",
            gender || "ALL",
            age || "AGE"
        ];
        setFinalName(parts.join('_').toUpperCase());
    }, [formData]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSave = async () => {
        if (!formData.type) return alert("Please fill required fields.");
        setHistory([{ AdSetName: finalName, ...formData, Timestamp: new Date().toLocaleString() }, ...history]);

        // Save to Google
        alert("Saving...");
        await saveData('adset', {
            Type: formData.type,
            Category: formData.cat,
            Audience: formData.aud,
            Location: formData.loc,
            Gender: formData.gender,
            Age: formData.age,
            GeneratedName: finalName
        });
        alert("Saved to Database!");
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(finalName);
        alert("Copied!");
    };

    const handleExport = () => {
        if (history.length === 0) return alert("No data");
        const headers = Object.keys(history[0]);
        const csv = [headers.join(','), ...history.map(row => headers.map(h => `"${row[h]}"`).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'AdSet_History.csv'; a.click();
    };

    return (
        <div className="card animate-fade-in">
            <h2 className="text-2xl font-bold text-center mb-1">Ad Set Generator</h2>
            <p className="text-center text-slate-500 mb-8">Define your target audience</p>

            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 mb-8 text-center sticky top-20 z-40 shadow-sm">
                <label className="text-xs font-bold text-indigo-500 tracking-wider mb-2 block uppercase">Generated Ad Set Name</label>
                <div className="flex items-center gap-2">
                    <input readOnly value={finalName} className="w-full text-center text-xl font-mono font-bold text-slate-800 bg-white border border-indigo-100 rounded-md py-3 px-4 focus:outline-none" />
                    <button onClick={handleCopy} className="bg-indigo-600 text-white px-6 py-3 rounded-md font-bold hover:bg-indigo-700 transition-colors">COPY</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Target Type</label>
                    <select name="type" value={formData.type} onChange={handleChange} className="input-field">
                        <option value="">Select Type...</option>
                        {["INTEREST", "LOOKALIKE", "CUSTOM"].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                    <input list="adset_cat_list" name="cat" value={formData.cat} onChange={handleChange} className="input-field" placeholder="Select or Type..." />
                    <datalist id="adset_cat_list">
                        {adSetCategories.map(c => <option key={c} value={c} />)}
                    </datalist>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Audience Name</label>
                    <input type="text" name="aud" value={formData.aud} onChange={handleChange} className="input-field" placeholder="Detailed targeting name..." />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1 flex justify-between">
                        Location
                        <button
                            onClick={() => setManualLoc(!manualLoc)}
                            className="text-xs text-indigo-500 hover:text-indigo-700 underline font-normal"
                        >
                            {manualLoc ? "Switch to List" : "Type Manual"}
                        </button>
                    </label>
                    {manualLoc ? (
                        <input
                            type="text"
                            name="loc"
                            value={formData.loc}
                            onChange={handleChange}
                            className="input-field border-indigo-300 ring-1 ring-indigo-100"
                            placeholder="Type custom location..."
                        />
                    ) : (
                        <select name="loc" value={formData.loc} onChange={handleChange} className="input-field">
                            <option value="">{loading ? "Loading..." : "Select Location..."}</option>
                            {locations.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} className="input-field">
                        <option value="ALL">All Information</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
                    <input type="text" name="age" value={formData.age} onChange={handleChange} className="input-field" placeholder="e.g. 25-45" />
                </div>
            </div>

            <button onClick={handleSave} className="btn-primary mt-8">Save Output</button>
            <HistoryTable title="Ad Set" data={history} onClear={() => setHistory([])} onExport={handleExport} />
        </div>
    );
};

export default AdSetForm;
