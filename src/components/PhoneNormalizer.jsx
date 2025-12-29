import React, { useState } from 'react';

const PhoneNormalizer = () => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');

    const handleProcess = () => {
        if (!input.trim()) return;

        const lines = input.split(/\n/).slice(0, 200);

        const results = lines.map(line => {
            let digits = line.replace(/\D/g, '');
            if (!digits) return '';

            // 1. Prefix handling
            if (digits.startsWith('66')) {
                digits = '0' + digits.slice(2);
            } else if (digits.startsWith('60')) {
                digits = '0' + digits.slice(2);
            } else if (!digits.startsWith('0') && digits.length > 0) {
                digits = '0' + digits;
            }

            // 2. Smart fallback (last 10 digits)
            if (digits.length > 10) {
                const lastTen = digits.slice(-10);
                if (lastTen.startsWith('0')) {
                    digits = lastTen;
                }
            }

            // 3. Fallback cleanup (00 prefix)
            if (digits.length > 10) {
                if (digits.startsWith('00')) {
                    digits = digits.substring(1);
                }
            }

            // 4. Strict Validation
            if (digits.length !== 10) {
                return 'เบอร์ไม่ถูกต้อง';
            }

            return digits;
        }).filter(d => d.length > 0);

        setOutput(results.join('\n'));
    };

    const handleClear = () => {
        setInput('');
        setOutput('');
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(output);
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-rose-100/50 flex items-center justify-center">
                    <span className="text-2xl">📞</span>
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-slate-800">Phone Normalizer</h2>
                    <p className="text-sm text-slate-500">Format & Validate Numbers (Max 200 lines)</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Section */}
                <div className="flex flex-col gap-4">
                    <div className="relative">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={`Paste phone numbers here...
081-111-1111
+6691111111`}
                            className="w-full h-96 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all resize-none font-mono text-slate-700"
                        />
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleProcess}
                            className="flex-1 bg-rose-600 text-white font-medium py-2.5 px-4 rounded-xl hover:bg-rose-700 active:scale-95 transition-all shadow-lg shadow-rose-200"
                        >
                            Normalize Numbers
                        </button>
                        <button
                            onClick={handleClear}
                            className="px-6 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-all"
                        >
                            Clear
                        </button>
                    </div>
                </div>

                {/* Output Section */}
                <div className="flex flex-col gap-4">
                    <div className="flex-1 flex flex-col gap-2">
                        <div className="flex justify-between items-center px-1">
                            <span className="text-sm font-medium text-slate-600">Normalized Result</span>
                            <button
                                onClick={handleCopy}
                                className="text-xs text-rose-600 hover:text-rose-700 font-medium px-2 py-1 bg-rose-50 rounded-lg transition-colors"
                            >
                                Copy
                            </button>
                        </div>
                        <div className="flex-1 bg-slate-900 rounded-xl p-4 overflow-auto border border-slate-800">
                            <pre className="font-mono text-sm text-emerald-400 whitespace-pre-wrap h-full">{output}</pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PhoneNormalizer;
