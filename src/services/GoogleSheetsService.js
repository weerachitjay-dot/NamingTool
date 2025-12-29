// Service to interact with Google Apps Script Web App
// The User needs to provide their own Web App URL here after setup.

// Configured via Database > Google Apps Script > Deploy > Web App URL
export const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

/**
 * Fetch configuration (Dropdown options) from Google Sheet
 * @returns {Promise<Object>} { campaign: {}, adSet: {}, products: [] }
 */
export const fetchConfig = async () => {
    if (!GOOGLE_SCRIPT_URL) {
        console.warn("Google Script URL not set in .env");
        return null;
    }

    try {
        const response = await fetch(`${GOOGLE_SCRIPT_URL}?op=getConfig`);
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        return data; // Expected format: { campaign: [], adSet: [], products: [] }
    } catch (error) {
        console.error("Error fetching config:", error);
        return null;
    }
};

/**
 * Save data to Google Sheet
 * @param {string} type - 'campaign', 'adset', 'link'
 * @param {object} payload - The data row to save
 */
export const saveData = async (type, payload) => {
    if (!GOOGLE_SCRIPT_URL) {
        alert("Please set VITE_GOOGLE_SCRIPT_URL in .env");
        return { error: "URL not set" };
    }

    try {
        // We use no-cors mode for simple submission if CORS is an issue, 
        // but Apps Script usually handles CORS if "Anyone" is set. 
        // Ideally, we start with standard fetch.
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8', // Apps Script requires simple content type sometimes
            },
            body: JSON.stringify({ type, payload })
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error saving data:", error);
        return { error: error.message };
    }
};
