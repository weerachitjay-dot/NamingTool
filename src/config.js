// CONFIGURATION FILE - NAMING TOOL
export const APP_CONFIG = {
    // 1. CAMPAIGN GENERATOR
    dates: {
        months: ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
    },

    pages: [
        "Facebook Page A",
        "TikTok Main",
        "Line OA",
        "สร้างมรดกหลักล้าน ด้วยประกันชีวิต",
        "ประกันสำหรับคนทำงาน",
        "ประกันสุขภาพเพื่อครอบครัว",
        "ประกันสุขภาพเหมาจ่าย จบจริง",
        "ประกันชีวิต สูงวัยได้เงินชัวร์-เพื่อผู้สูงวัย",
        "SILKSPAN",
        "ประกันภัยรถยนต์",
        "ประกันสุขภาพ",
        "ประกันสุขภาพทั่วไทย",
        "ประกันสุขภาพและมะเร็งสุดคุ้ม",
        "พร้อมใช้ชีวิตชิลๆ ในวัยเกษียณ",
        "Take Care มะเร็ง"
    ],

    objectives: [
        "CONVERSIONS",
        "LEADGENERATION",
        "MESSAGES"
    ],

    brandings: [
        "CHUBBLIFE",
        "FWD",
        "GENERALI",
        "THAILIFE",
        "SILKSPAN"
    ],

    categories: [
        "LIFE", "SAVING", "Cl", "HEALTH"
    ],

    productsByBrand: {
        "CHUBBLIFE": ["SAVING-21/15", "LIFE-TERM10/10"],
        "FWD": ["SAVING-forpension857", "SAVING-For-Saving-2010", "HEALTH-Easy-E-CANCER", "HEALTH-BIG3", "HEALTH-delight-care"],
        "GENERALI": ["SENIOR-GEN-SENIOR-55", "GEN-HEALTH-LUMP-SUM-PLUS"],
        "THAILIFE": ["MONEYSAVING14/6", "HAPPY", "SENIOR-MORRADOK", "SENIOR-BONECARE", "EXTRASENIOR-BUPHAKARI", "TOPUP-SICK", "SABAI-JAI", "LEGACY-FIT-CI-CARE"],
        "SILKSPAN": ["Home", "Car-insurance", "Type1", "Type2+", "Type3+", "Type3"]
    },

    // 2. AD SET GENERATOR
    adSetCategories: [
        "Food & Drink", "Finance", "Situation", "Real Estate", "Shopping", "Business",
        "Health", "Car & Vehicle", "Family & Status", "Pollution", "Horo", "Competitor",
        "Department", "Crypto", "Electric", "Game", "GAS & Fuel", "Lookalike", "Telco",
        "Travel", "Sports", "Entertainment", "Online", "Natural", "Agent", "Career & Job",
        "home garden", "Non-Category", "retargeting"
    ],

    locations: [
        "TH", "BKK", "UPC"
    ],

    // 3. LINK GENERATOR
    linkProducts: [
        { brand: "THAILIFE", product: "Buphakari (สูงวัยมีทรัพย์)", url: "https://www.silkspan.com/online/life-insurance/thailife-extra-senior-ab" },
        { brand: "THAILIFE", product: "Morradok (สูงวัยไร้กังวล)", url: "https://www.silkspan.com/online/life-insurance/thailife-senior-ab/" },
        { brand: "THAILIFE", product: "ซีเนียร์ โบน แคร์ (เพื่อผู้สูงอายุ)", url: "https://www.silkspan.com/online/life-insurance/thailife-legacyfitsenior-ab" },
        { brand: "THAILIFE", product: "14/6 Money Saving", url: "https://www.silkspan.com/online/life-insurance/thailife-money-saving-14-6/" },
        { brand: "THAILIFE", product: "15/5 Saving Happy", url: "https://www.silkspan.com/online/life-insurance/thailife-smile/" },
        { brand: "THAILIFE", product: "CI Leagacy", url: "https://www.silkspan.com/online/life-insurance/thailife-cancer-money-sure/" },
        { brand: "THAILIFE", product: "Health (เฮลท์เหมาสบายใจ)", url: "https://www.silkspan.com/online/life-insurance/thailife-health-sabai-jai/" },
        { brand: "THAILIFE", product: "Topup (เติมเงินยามป่วย)", url: "https://www.silkspan.com/online/life-insurance/thailife-topup/" },
        { brand: "CHUBB", product: "Chubb Life", url: "https://www.silkspan.com/online/chubb/chubb-life/" },
        { brand: "GENERALI", product: "Generali Health", url: "https://www.silkspan.com/health/generali/gen-health-lump-sum-plus/" },
        { brand: "GENERALI", product: "Generali Senior", url: "https://www.silkspan.com/life-insurance/generali/gen-senior-55/" },
        { brand: "FWD", product: "Easy-E-CANCER", url: "https://www.silkspan.com/fwd/easy-e-cancer/" },
        { brand: "FWD", product: "Delight Care", url: "https://www.silkspan.com/online/fwd/delight-care-80-80/" },
        { brand: "FWD", product: "BIG3", url: "https://www.silkspan.com/fwd/big-3/" },
        { brand: "FWD", product: "For Pension 85/7", url: "https://www.silkspan.com/online/fwd/for-pension85-7/" },
        { brand: "FWD", product: "For Saving 20/10", url: "https://www.silkspan.com/online/fwd-for-saving-20-10/" },
        { brand: "SILKSPAN", product: "Home", url: "https://www.silkspan.com/" },
        { brand: "SILKSPAN", product: "Car-insurance", url: "https://www.silkspan.com/car-insurance/" },
        { brand: "SILKSPAN", product: "Type1", url: "https://www.silkspan.com/car-insurance/type1/" },
        { brand: "SILKSPAN", product: "Type2+", url: "https://www.silkspan.com/car-insurance/type2plus/" },
        { brand: "SILKSPAN", product: "Type3+", url: "https://www.silkspan.com/car-insurance/type3plus/" },
        { brand: "SILKSPAN", product: "Type3", url: "https://www.silkspan.com/car-insurance/type3/" }
    ],

    linkChannels: [
        { label: "Facebook ads", value: "Ads-Fb-" },
        { label: "Line ads", value: "Ads-Line-" },
        { label: "Line BC", value: "BC-Line-" },
        { label: "New", value: "Ads-news-" },
        { label: "Google ads", value: "Ads-gg-" },
        { label: "Tiktok ads", value: "Ads-tiktok-" }
    ],

    linkBuilderTypes: [
        { label: "Car Insurance", value: "ins-" },
        { label: "Lead Agency", value: "life-" }
    ]
};
