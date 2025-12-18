import React, { useState } from 'react';

const NameParser = () => {
    const [names, setNames] = useState('');
    const [firstNames, setFirstNames] = useState('');
    const [lastNames, setLastNames] = useState('');

    const prefixes = [
        // Royal & Noble
        'หม่อมเจ้า', 'ม.จ.', 'หม่อมราชวงศ์', 'ม.ร.ว.', 'หม่อมหลวง', 'ม.ล.', 'ท่านผู้หญิง', 'คุณหญิง',
        // Academic
        'ศาสตราจารย์', 'ศ.', 'รองศาสตราจารย์', 'รศ.', 'ผู้ช่วยศาสตราจารย์', 'ผศ.', 'ด็อกเตอร์', 'ดร.',
        // Medical & Professional
        'นายแพทย์', 'นพ.', 'แพทย์หญิง', 'พญ.', 'ทันตแพทย์', 'ทพ.', 'ทันตแพทย์หญิง', 'ทพญ.',
        'สัตวแพทย์', 'สพ.', 'สัตวแพทย์หญิง', 'สพญ.', 'เภสัชกร', 'ภก.', 'เภสัชกรหญิง', 'ภกญ.',
        // Military & Police
        'พลเอก', 'พล.อ.', 'พลเรือเอก', 'พล.ร.อ.', 'พลอากาศเอก', 'พล.อ.อ.',
        'พลโท', 'พล.ท.', 'พลเรือโท', 'พล.ร.ท.', 'พลอากาศโท', 'พล.o.ท.',
        'พลตรี', 'พล.ต.', 'พลเรือตรี', 'พล.ร.ต.', 'พลอากาศตรี', 'พล.o.ต.',
        'พันเอก', 'พ.อ.', 'พันโท', 'พ.ท.', 'พันตรี', 'พ.ต.',
        'ร้อยเอก', 'ร.อ.', 'ร้อยโท', 'ร.ท.', 'ร้อยตรี', 'ร.ต.',
        'พลตำรวจเอก', 'พล.ต.o.', 'พล.ต.อ.', 'พลตำรวจโท', 'พล.ต.ท.', 'พลตำรวจตรี', 'พล.ต.ต.',
        'พันตำรวจเอก', 'พ.ต.o.', 'พ.ต.อ.', 'พันตำรวจโท', 'พ.ต.ท.', 'พันตำรวจตรี', 'พ.ต.ต.',
        'ร้อยตำรวจเอก', 'ร.ต.o.', 'ร.ต.อ.', 'ร้อยตำรวจโท', 'ร.ต.ท.', 'ร้อยตำรวจตรี', 'ร.ต.ต.',
        'นายดาบตำรวจ', 'ด.ต.', 'ว่าที่ร้อยตรี', 'ว่าที่ ร.ต.', 'ว่าที่',
        // Common
        'นาย', 'นางสาว', 'นาง', 'น.ส.', 'นส.', 'เด็กชาย', 'ด.ช.', 'ดช.', 'เด็กหญิง', 'ด.ญ.', 'ดญ.', 'คุณ', 'ท่าน',
        // English Prefixes
        'Mr.', 'Mr', 'Mrs.', 'Mrs', 'Miss', 'Ms.', 'Ms', 'Dr.', 'Dr',
        'MR', 'MRS', 'MISS', 'MS', 'DR',
        // Common Misspellings
        'น.ส ', 'ด.ช ', 'ด.ญ ', 'พ.ต.ท ', 'พ.ต.o ', 'พ.ต.อ '
    ];

    // Sort prefixes by length descending
    const sortedPrefixes = prefixes.sort((a, b) => b.length - a.length);

    const handleProcess = () => {
        if (!names.trim()) return;

        const lines = names.split(/\n/).slice(0, 200);

        const processed = lines.map(line => {
            let cleanName = line.trim();
            if (!cleanName) return { first: '', last: '' };

            // 1. Language Validation check
            // Allow Thai, English, whitespace, dot, quote, dash
            // If invalid chars found (numbers, etc), return error
            if (!/^[a-zA-Zก-๙\s.'-]+$/.test(cleanName)) {
                return { first: 'สอบถามชื่อใหม่', last: '' };
            }

            // 2. Recursive Prefix Removal
            let prefixFound = true;
            while (prefixFound) {
                prefixFound = false;
                for (const prefix of sortedPrefixes) {
                    const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    // Case insensitive match at start
                    const regex = new RegExp(`^${escapedPrefix}\\s*`, 'i');
                    if (regex.test(cleanName)) {
                        cleanName = cleanName.replace(regex, '');
                        prefixFound = true;
                        break;
                    }
                }
            }

            // 3. Special Characters
            // Replace dots with space
            cleanName = cleanName.replace(/\./g, ' ');
            // Remove quotes
            cleanName = cleanName.replace(/'/g, '');

            // 4. Split
            const parts = cleanName.trim().split(/\s+/);
            let firstName = '';
            let lastName = '';

            if (parts.length > 0) {
                firstName = parts[0];
                if (parts.length > 1) {
                    lastName = parts.slice(1).join(' ');
                }
            }
            return { first: firstName, last: lastName };
        }).filter(item => item.first || item.last);

        setFirstNames(processed.map(p => p.first).join('\n'));
        setLastNames(processed.map(p => p.last).join('\n'));
    };

    const handleClear = () => {
        setNames('');
        setFirstNames('');
        setLastNames('');
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-indigo-100/50 flex items-center justify-center">
                    <span className="text-2xl">👤</span>
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-slate-800">Name Parser</h2>
                    <p className="text-sm text-slate-500">Extract Name / Surname (Max 200 lines)</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Section */}
                <div className="flex flex-col gap-4">
                    <div className="relative">
                        <textarea
                            value={names}
                            onChange={(e) => setNames(e.target.value)}
                            placeholder={`Paste names here...
นาย สมชาย ใจดี
นางสาว สวย มาก
Mr. John`}
                            className="w-full h-96 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none font-sarabun text-slate-700"
                        />
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleProcess}
                            className="flex-1 bg-indigo-600 text-white font-medium py-2.5 px-4 rounded-xl hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-200"
                        >
                            Extract Names
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
                            <span className="text-sm font-medium text-slate-600">First Name</span>
                            <button
                                onClick={() => handleCopy(firstNames)}
                                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium px-2 py-1 bg-indigo-50 rounded-lg transition-colors"
                            >
                                Copy
                            </button>
                        </div>
                        <div className="flex-1 bg-slate-900 rounded-xl p-4 overflow-auto border border-slate-800">
                            <pre className="font-mono text-sm text-emerald-400 whitespace-pre-wrap">{firstNames}</pre>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col gap-2">
                        <div className="flex justify-between items-center px-1">
                            <span className="text-sm font-medium text-slate-600">Last Name</span>
                            <button
                                onClick={() => handleCopy(lastNames)}
                                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium px-2 py-1 bg-indigo-50 rounded-lg transition-colors"
                            >
                                Copy
                            </button>
                        </div>
                        <div className="flex-1 bg-slate-900 rounded-xl p-4 overflow-auto border border-slate-800">
                            <pre className="font-mono text-sm text-emerald-400 whitespace-pre-wrap">{lastNames}</pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NameParser;
