import React from 'react';

const HistoryTable = ({ title, data, onClear, onExport }) => {
    if (!data || data.length === 0) return null;

    const headers = Object.keys(data[0]);

    return (
        <div className="mt-8 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-bold text-slate-700">{title} History <span className="text-sm font-normal text-slate-500">({data.length})</span></h4>
                <div className="flex gap-2">
                    <button
                        onClick={onExport}
                        className="px-3 py-1.5 bg-emerald-500 text-white text-sm font-medium rounded-md hover:bg-emerald-600 transition-colors"
                    >
                        Export CSV
                    </button>
                    <button
                        onClick={onClear}
                        className="px-3 py-1.5 bg-red-500 text-white text-sm font-medium rounded-md hover:bg-red-600 transition-colors"
                    >
                        Clear
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-700 uppercase font-semibold">
                        <tr>
                            {headers.map(key => (
                                <th key={key} className="px-4 py-3 border-b border-slate-200 whitespace-nowrap">{key}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data.slice(0, 10).map((row, idx) => (
                            <tr key={idx} className="bg-white hover:bg-slate-50 transition-colors">
                                {headers.map(key => (
                                    <td key={key} className="px-4 py-3 text-slate-600 whitespace-nowrap">{row[key]}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {data.length > 10 && (
                <p className="text-center text-xs text-slate-400 mt-2">Showing recent 10 of {data.length} items</p>
            )}
        </div>
    );
};

export default HistoryTable;
