/**
 * NAMING TOOL BACKEND SCRIPT
 */

// HARDCODED SHEET ID (CONNECT TO SPECIFIC SHEET)
const SHEET_ID = "1y0xlWvpBOscukaBM4g6VHHWRyMHICucHNvTxo4W91uI";

function doGet(e) {
  // Guard clause for manual run (e is undefined)
  if (!e || !e.parameter) {
    return ContentService.createTextOutput("Error: Please run 'setupDatabase' function manually to initialize. do not run doGet directly.");
  }

  const op = e.parameter.op;
  // USE openById instead of getActiveSpreadsheet
  const ss = SpreadsheetApp.openById(SHEET_ID);

  if (op === 'setup') {
    setupDatabase();
    return ContentService.createTextOutput("Setup Complete!");
  }

  if (op === 'getConfig') {
    const campaignOpts = readSheet(ss, 'Options_Campaign');
    const adSetOpts = readSheet(ss, 'Options_AdSet');
    const products = readSheet(ss, 'Options_Products');
    const linkOpts = readSheet(ss, 'Options_Link'); 
    
    return ContentService.createTextOutput(JSON.stringify({
      campaign: campaignOpts,
      adSet: adSetOpts,
      products: products,
      linkConfig: linkOpts
    })).setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput("Naming Tool API Ready.");
}

function doPost(e) {
  try {
    // USE openById
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const data = JSON.parse(e.postData.contents);
    const type = data.type; // 'campaign', 'adset', 'link', 'ad'
    const payload = data.payload;

    let sheetName = '';
    if (type === 'campaign') sheetName = 'History_Campaign';
    else if (type === 'adset') sheetName = 'History_AdSet';
    else if (type === 'ad') sheetName = 'History_AdName';
    else if (type === 'link') sheetName = 'History_Link';

    if (sheetName) {
      const sheet = ss.getSheetByName(sheetName);
      if (!sheet) {
        // Create if missing
        const newSheet = ss.insertSheet(sheetName);
        newSheet.appendRow(["Timestamp", ...Object.keys(payload)]);
      }
      
      const targetSheet = ss.getSheetByName(sheetName);
      targetSheet.appendRow([new Date(), ...Object.values(payload)]);
      
      return ContentService.createTextOutput(JSON.stringify({result: "Success"}));
    }
    return ContentService.createTextOutput(JSON.stringify({error: "Unknown Type"}));
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({error: err.toString()}));
  }
}

function readSheet(ss, name) {
  const sheet = ss.getSheetByName(name);
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  // Remove headers
  return data.slice(1);
}

// --- SETUP FUNCTION (RUN ONCE) ---
function setupDatabase() {
  // USE openById
  const ss = SpreadsheetApp.openById(SHEET_ID);
  
  // Notify user on the Sheet UI that something is happening
  try {
    ss.toast("Starting Setup... Migrating all data.", "Naming Tool");
  } catch (e) {
    console.log("Could not show toast (likely standalone script): " + e);
  }

  // 1. Setup Options_Campaign
  // Data from config.js: Objectives, Brandings, Categories, Pages
  setupSheet(ss, 'Options_Campaign', ["Objectives", "Brandings", "Categories", "Pages"], [
    ["CONVERSIONS", "CHUBBLIFE", "LIFE", "Facebook Page A"],
    ["LEADGENERATION", "FWD", "SAVING", "TikTok Main"],
    ["MESSAGES", "GENERALI", "Cl", "Line OA"],
    ["", "THAILIFE", "HEALTH", "สร้างมรดกหลักล้าน ด้วยประกันชีวิต"],
    ["", "SILKSPAN", "", "ประกันสำหรับคนทำงาน"],
    ["", "", "", "ประกันสุขภาพเพื่อครอบครัว"],
    ["", "", "", "ประกันสุขภาพเหมาจ่าย จบจริง"],
    ["", "", "", "ประกันชีวิต สูงวัยได้เงินชัวร์-เพื่อผู้สูงวัย"],
    ["", "", "", "SILKSPAN"],
    ["", "", "", "ประกันภัยรถยนต์"],
    ["", "", "", "ประกันสุขภาพ"],
    ["", "", "", "ประกันสุขภาพทั่วไทย"],
    ["", "", "", "ประกันสุขภาพและมะเร็งสุดคุ้ม"],
    ["", "", "", "พร้อมใช้ชีวิตชิลๆ ในวัยเกษียณ"],
    ["", "", "", "Take Care มะเร็ง"]
  ]);

  // 2. Setup Options_AdSet
  // Data from config.js: adSetCategories, locations
  setupSheet(ss, 'Options_AdSet', ["Categories", "Locations"], [
    ["Food & Drink", "TH"],
    ["Finance", "BKK"],
    ["Situation", "UPC"],
    ["Real Estate", ""],
    ["Shopping", ""],
    ["Business", ""],
    ["Health", ""],
    ["Car & Vehicle", ""],
    ["Family & Status", ""],
    ["Pollution", ""],
    ["Horo", ""],
    ["Competitor", ""],
    ["Department", ""],
    ["Crypto", ""],
    ["Electric", ""],
    ["Game", ""],
    ["GAS & Fuel", ""],
    ["Lookalike", ""],
    ["Telco", ""],
    ["Travel", ""],
    ["Sports", ""],
    ["Entertainment", ""],
    ["Online", ""],
    ["Natural", ""],
    ["Agent", ""],
    ["Career & Job", ""],
    ["home garden", ""],
    ["Non-Category", ""],
    ["retargeting", ""]
  ]);

  // 3. Setup Options_Products
  // Merging 'productsByBrand' (Codes) and 'linkProducts' (Links)
  setupSheet(ss, 'Options_Products', ["Brand", "ProductName", "URL"], [
    // CHUBBLIFE
    ["CHUBBLIFE", "SAVING-21/15", ""],
    ["CHUBBLIFE", "LIFE-TERM10/10", ""],
    ["CHUBBLIFE", "Chubb Life", "https://www.silkspan.com/online/chubb/chubb-life/"], // Link
    
    // FWD
    ["FWD", "SAVING-forpension857", ""],
    ["FWD", "SAVING-For-Saving-2010", ""],
    ["FWD", "HEALTH-Easy-E-CANCER", ""],
    ["FWD", "HEALTH-BIG3", ""],
    ["FWD", "HEALTH-delight-care", ""],
    ["FWD", "Easy-E-CANCER", "https://www.silkspan.com/fwd/easy-e-cancer/"], // Link
    ["FWD", "Delight Care", "https://www.silkspan.com/online/fwd/delight-care-80-80/"], // Link
    ["FWD", "BIG3", "https://www.silkspan.com/fwd/big-3/"], // Link
    ["FWD", "For Pension 85/7", "https://www.silkspan.com/online/fwd/for-pension85-7/"], // Link
    ["FWD", "For Saving 20/10", "https://www.silkspan.com/online/fwd-for-saving-20-10/"], // Link

    // GENERALI
    ["GENERALI", "SENIOR-GEN-SENIOR-55", ""],
    ["GENERALI", "GEN-HEALTH-LUMP-SUM-PLUS", ""],
    ["GENERALI", "Generali Health", "https://www.silkspan.com/health/generali/gen-health-lump-sum-plus/"], // Link
    ["GENERALI", "Generali Senior", "https://www.silkspan.com/life-insurance/generali/gen-senior-55/"], // Link

    // THAILIFE
    ["THAILIFE", "MONEYSAVING14/6", ""],
    ["THAILIFE", "HAPPY", ""],
    ["THAILIFE", "SENIOR-MORRADOK", ""],
    ["THAILIFE", "SENIOR-BONECARE", ""],
    ["THAILIFE", "EXTRASENIOR-BUPHAKARI", ""],
    ["THAILIFE", "TOPUP-SICK", ""],
    ["THAILIFE", "SABAI-JAI", ""],
    ["THAILIFE", "LEGACY-FIT-CI-CARE", ""],
    ["THAILIFE", "Buphakari (สูงวัยมีทรัพย์)", "https://www.silkspan.com/online/life-insurance/thailife-extra-senior-ab"], // Link
    ["THAILIFE", "Morradok (สูงวัยไร้กังวล)", "https://www.silkspan.com/online/life-insurance/thailife-senior-ab/"], // Link
    ["THAILIFE", "ซีเนียร์ โบน แคร์ (เพื่อผู้สูงอายุ)", "https://www.silkspan.com/online/life-insurance/thailife-legacyfitsenior-ab"], // Link
    ["THAILIFE", "14/6 Money Saving", "https://www.silkspan.com/online/life-insurance/thailife-money-saving-14-6/"], // Link
    ["THAILIFE", "15/5 Saving Happy", "https://www.silkspan.com/online/life-insurance/thailife-smile/"], // Link
    ["THAILIFE", "CI Leagacy", "https://www.silkspan.com/online/life-insurance/thailife-cancer-money-sure/"], // Link
    ["THAILIFE", "Health (เฮลท์เหมาสบายใจ)", "https://www.silkspan.com/online/life-insurance/thailife-health-sabai-jai/"], // Link
    ["THAILIFE", "Topup (เติมเงินยามป่วย)", "https://www.silkspan.com/online/life-insurance/thailife-topup/"], // Link

    // SILKSPAN
    ["SILKSPAN", "Home", "https://www.silkspan.com/"],
    ["SILKSPAN", "Car-insurance", "https://www.silkspan.com/car-insurance/"],
    ["SILKSPAN", "Type1", "https://www.silkspan.com/car-insurance/type1/"],
    ["SILKSPAN", "Type2+", "https://www.silkspan.com/car-insurance/type2plus/"],
    ["SILKSPAN", "Type3+", "https://www.silkspan.com/car-insurance/type3plus/"],
    ["SILKSPAN", "Type3", "https://www.silkspan.com/car-insurance/type3/"]
  ]);

  // 4. Setup Options_Link (Channels, Types)
  setupSheet(ss, 'Options_Link', ["ConfigType", "Label", "Value"], [
    ["Channel", "Facebook ads", "Ads-Fb-"],
    ["Channel", "Line ads", "Ads-Line-"],
    ["Channel", "Line BC", "BC-Line-"],
    ["Channel", "New", "Ads-news-"],
    ["Channel", "Google ads", "Ads-gg-"],
    ["Channel", "Tiktok ads", "Ads-tiktok-"],
    ["Type", "Car Insurance", "ins-"],
    ["Type", "Lead Agency", "life-"]
  ]);

  // 5. Create History Sheets (Headers only)
  createHistorySheet(ss, 'History_Campaign', ["Timestamp", "Objective", "Branding", "Category", "Product", "Audience", "Page", "Date", "GeneratedName"]);
  createHistorySheet(ss, 'History_AdSet', ["Timestamp", "Type", "Category", "Audience", "Location", "Gender", "Age", "GeneratedName"]);
  createHistorySheet(ss, 'History_AdName', ["Timestamp", "Page", "Brand", "Product", "Format", "Creative", "GeneratedName"]);
  createHistorySheet(ss, 'History_Link', ["Timestamp", "Channel", "Type", "Brand", "ProductName", "FinalURL"]);

  try {
    // Alert logic remains valid as long as the user is "active" in some sheet context, 
    // but toast works best.
    console.log("Setup Completed for " + ss.getName());
  } catch (e) {
    console.log("Could not show alert: " + e);
  }
}

function setupSheet(ss, name, headers, data) {
  let sheet = ss.getSheetByName(name);
  if (sheet) {
    sheet.clear();
  } else {
    sheet = ss.insertSheet(name);
  }
  sheet.appendRow(headers);
  if (data && data.length > 0) {
    const range = sheet.getRange(2, 1, data.length, data[0].length);
    range.setValues(data);
  }
}

function createHistorySheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
  }
}
