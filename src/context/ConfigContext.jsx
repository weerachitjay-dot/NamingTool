import React, { createContext, useContext, useEffect, useState } from 'react';
import { APP_CONFIG } from '../config'; // Fallback
import { fetchConfig } from '../services/GoogleSheetsService';

const ConfigContext = createContext();

export const useConfig = () => useContext(ConfigContext);

export const ConfigProvider = ({ children }) => {
    const [config, setConfig] = useState(APP_CONFIG);
    const [loading, setLoading] = useState(true);
    const [isUsingGoogle, setIsUsingGoogle] = useState(false);

    useEffect(() => {
        const loadGoogleConfig = async () => {
            const data = await fetchConfig();
            if (data) {
                // Merge or Replace? 
                // For simplicity, we assume Google Sheet provides similar structure or we map it.
                // If the user setup follows instructions, we should map the raw sheet data to our app structure.

                // MAP Logic (Simplified for MVP):
                // Assuming `data.campaign` is array of rows [Objective, Branding, Category, Page]
                // Assuming `data.adSet` is array of rows [Category, Location]
                // Assuming `data.products` is array of rows [Brand, Product, ...]

                const newConfig = { ...APP_CONFIG };

                if (data.campaign && data.campaign.length > 1) {
                    // Skip header row usually, or logic inside service handles it.
                    // Let's assume service returns raw values.

                    // Simple distinct extraction for now or assume columns:
                    // Col 0: Objectives, Col 1: Brandings, Col 2: Categories, Col 3: Pages
                    const objs = [...new Set(data.campaign.map(r => r[0]).filter(Boolean))];
                    const brands = [...new Set(data.campaign.map(r => r[1]).filter(Boolean))];
                    const cats = [...new Set(data.campaign.map(r => r[2]).filter(Boolean))];
                    const pgs = [...new Set(data.campaign.map(r => r[3]).filter(Boolean))];

                    if (objs.length) newConfig.objectives = objs;
                    if (brands.length) newConfig.brandings = brands;
                    if (cats.length) newConfig.categories = cats;
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

                setConfig(newConfig);
                setIsUsingGoogle(true);
            }
            setLoading(false);
        };

        loadGoogleConfig();
    }, []);

    return (
        <ConfigContext.Provider value={{ config, loading, isUsingGoogle }}>
            {children}
        </ConfigContext.Provider>
    );
};
