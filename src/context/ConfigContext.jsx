import React, { createContext, useContext, useEffect, useState } from 'react';
import { APP_CONFIG } from '../config'; // Fallback
import { fetchConfig } from '../services/GoogleSheetsService';

const ConfigContext = createContext();

export const useConfig = () => useContext(ConfigContext);

export const ConfigProvider = ({ children }) => {
    const [config, setConfig] = useState(APP_CONFIG);
    const [loading, setLoading] = useState(true);
    const [isUsingGoogle, setIsUsingGoogle] = useState(false);
    const [loadError, setLoadError] = useState(null);

    useEffect(() => {
        const loadGoogleConfig = async () => {
            try {
                const data = await fetchConfig();
                if (data) {
                    console.log('✅ Google Sheets config loaded successfully');
                    // Merge or Replace? 
                    // For simplicity, we assume Google Sheet provides similar structure or we map it.
                    // If the user setup follows instructions, we should map the raw sheet data to our app structure.

                    // MAP Logic (Simplified for MVP):
                    // New structure: data.campaign is array of rows [Objective, Branding, ProductName, Pages]
                    // Assuming `data.adSet` is array of rows [Category, Location]
                    // Assuming `data.products` is array of rows [Brand, Product, ...]

                    const newConfig = { ...APP_CONFIG };

                    if (data.campaign && data.campaign.length > 1) {
                        // Skip header row usually, or logic inside service handles it.
                        // Let's assume service returns raw values.

                        // Simple distinct extraction for now or assume columns:
                        // Col 0: Objective, Col 1: Branding, Col 2: ProductName, Col 3: Pages
                        const objs = [...new Set(data.campaign.map(r => r[0]).filter(Boolean))];
                        const brands = [...new Set(data.campaign.map(r => r[1]).filter(Boolean))];
                        const products = [...new Set(data.campaign.map(r => r[2]).filter(Boolean))];
                        const pgs = [...new Set(data.campaign.map(r => r[3]).filter(Boolean))];

                        if (objs.length) newConfig.objectives = objs;
                        if (brands.length) newConfig.brandings = brands;
                        if (products.length) newConfig.products = products;
                        if (pgs.length) newConfig.pages = pgs;
                    }

                    if (data.adSet && data.adSet.length > 1) {
                        const cats = [...new Set(data.adSet.map(r => r[0]).filter(Boolean))];
                        const locs = [...new Set(data.adSet.map(r => r[1]).filter(Boolean))];

                        if (cats.length) newConfig.adSetCategories = cats;
                        if (locs.length) newConfig.locations = locs;
                    }

                    if (data.products && data.products.length > 1) {
                        // Col 0: Brand, Col 1: Product Name, Col 2: URL (for Links)
                        // We need to rebuild `productsByBrand` and `linkProducts`

                        const derivedProductsByBrand = {};
                        const derivedLinkProducts = [];

                        data.products.forEach(row => {
                            const brand = row[0];
                            const prodName = row[1];
                            const url = row[2];

                            if (brand && prodName) {
                                // If it has a URL, it's a "Link Product" (Friendly Name)
                                // If it has NO URL, it's a "Campaign Product Code" (Internal Code)

                                if (url) {
                                    derivedLinkProducts.push({
                                        brand: brand,
                                        product: prodName,
                                        url: url
                                    });
                                } else {
                                    // Campaign Code only
                                    if (!derivedProductsByBrand[brand]) derivedProductsByBrand[brand] = [];
                                    derivedProductsByBrand[brand].push(prodName);
                                }
                            }
                        });

                        if (Object.keys(derivedProductsByBrand).length > 0) {
                            newConfig.productsByBrand = derivedProductsByBrand;
                            newConfig.linkProducts = derivedLinkProducts;
                        }
                    }

                    // Parse Options_Link2026
                    if (data.linkConfig2026 && data.linkConfig2026.length > 0) {
                        const linkOpts = {
                            source: [],
                            method: [],
                            platform: [],
                            creative: [],
                            sequence: []
                        };

                        data.linkConfig2026.forEach(row => {
                            // Headers: ConfigType, Label, Value
                            const type = row[0]?.toLowerCase();
                            const label = row[1];
                            const value = row[2];

                            if (type && label && value !== undefined) {
                                if (type === 'source') linkOpts.source.push({ label, value });
                                else if (type === 'method') linkOpts.method.push({ label, value });
                                else if (type === 'platform') linkOpts.platform.push({ label, value });
                                else if (type === 'creative') linkOpts.creative.push({ label, value });
                                else if (type === 'sequence') linkOpts.sequence.push({ label, value });
                            }
                        });

                        newConfig.linkOptions2026 = linkOpts;
                    } else {
                        // Fallback default options if sheet is empty or not yet created
                        newConfig.linkOptions2026 = {
                            source: [
                                { label: "Paid", value: "p" },
                                { label: "Non-Paid", value: "np" }
                            ],
                            method: [
                                { label: "Direct", value: "direct" },
                                { label: "SEO", value: "seo" },
                                { label: "Post", value: "post" },
                                { label: "Article", value: "article" },
                                { label: "Backlink", value: "backlink" }
                            ],
                            platform: [
                                { label: "Line", value: "ln" },
                                { label: "Facebook", value: "fb" },
                                { label: "X", value: "x" },
                                { label: "Instagram", value: "ig" },
                                { label: "Youtube", value: "yt" },
                                { label: "Google", value: "gg" }
                            ],
                            creative: [
                                { label: "Picture", value: "picture" },
                                { label: "Text", value: "text" },
                                { label: "Video", value: "video" },
                                { label: "Live", value: "live" }
                            ],
                            sequence: Array.from({ length: 20 }, (_, i) => ({ label: `S${i + 1}`, value: `s${i + 1}` }))
                        };
                    }

                    // Parse Options_ProductMap2026
                    if (data.productMap2026) {
                        console.log("Raw ProductMap2026:", data.productMap2026);
                    }
                    if (data.productMap2026 && data.productMap2026.length > 0) {
                        // Headers: Brand, DisplayName, CodeName, BaseURL
                        const map = {};
                        data.productMap2026.forEach(row => {
                            // [Brand, DisplayName, CodeName, BaseURL]
                            const [brand, displayName, codeName, baseUrl] = row;

                            // Check if Brand exists (skip empty rows)
                            if (brand) {
                                if (!map[brand]) map[brand] = [];
                                map[brand].push({ displayName, codeName, baseUrl });
                            }
                        });
                        newConfig.productMap2026 = map;
                    } else {
                        newConfig.productMap2026 = {};
                    }

                    setConfig(newConfig);
                    setIsUsingGoogle(true);
                    setLoadError(null); // Clear any previous errors
                } else {
                    console.warn('⚠️ Google Sheets config not available - using fallback from config.js');
                    setLoadError('Google Sheets configuration not available. Check your .env file for VITE_GOOGLE_SCRIPT_URL.');
                    setIsUsingGoogle(false);
                }
            } catch (error) {
                console.error('❌ Error loading Google Sheets config:', error);
                setLoadError(`Failed to load Google Sheets: ${error.message}`);
                setIsUsingGoogle(false);
            } finally {
                setLoading(false);
            }
        };

        loadGoogleConfig();
    }, []);

    return (
        <ConfigContext.Provider value={{ config, loading, isUsingGoogle, loadError }}>
            {children}
        </ConfigContext.Provider>
    );
};
