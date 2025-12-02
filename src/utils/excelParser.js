import * as XLSX from "xlsx";

/**
 * Validates Excel file structure
 * @param {Object} workbook - XLSX workbook object
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
function validateExcelStructure(workbook) {
    const errors = [];
    const requiredSheets = [
        "Cash Flow Statement",
        "Contribution Margin",
        "Pricing Sensitivity"
    ];

    // Check if all required sheets exist
    requiredSheets.forEach((sheetName) => {
        if (!workbook.SheetNames.includes(sheetName)) {
            errors.push(`Missing required sheet: "${sheetName}"`);
        }
    });

    if (errors.length > 0) {
        return { valid: false, errors };
    }

    // Validate Cash Flow Statement columns
    const cashFlowSheet = workbook.Sheets["Cash Flow Statement"];
    const cashFlowHeaders = XLSX.utils.sheet_to_json(cashFlowSheet, { header: 1 })[0];
    const requiredCashFlowCols = [
        "Date",
        "Description",
        "Cash In",
        "Cash Out",
        "Net Cash Flow",
        "Running Balance"
    ];

    requiredCashFlowCols.forEach((col) => {
        if (!cashFlowHeaders.includes(col)) {
            errors.push(`Cash Flow Statement missing column: "${col}"`);
        }
    });

    // Validate Contribution Margin columns
    const contributionSheet = workbook.Sheets["Contribution Margin"];
    const contributionHeaders = XLSX.utils.sheet_to_json(contributionSheet, { header: 1 })[0];
    const requiredContributionCols = [
        "Item",
        "Value",
        "Price",
        "Variable Cost",
        "Fixed Costs",
        "CM",
        "Break-Even Units",
        "Break-Even SAR"
    ];

    requiredContributionCols.forEach((col) => {
        if (!contributionHeaders.includes(col)) {
            errors.push(`Contribution Margin missing column: "${col}"`);
        }
    });

    // Validate Pricing Sensitivity columns
    const pricingSheet = workbook.Sheets["Pricing Sensitivity"];
    const pricingHeaders = XLSX.utils.sheet_to_json(pricingSheet, { header: 1 })[0];
    const requiredPricingCols = [
        "Scenario",
        "Price",
        "Units Sold",
        "Revenue",
        "Variable Cost",
        "CM",
        "Profit"
    ];

    requiredPricingCols.forEach((col) => {
        if (!pricingHeaders.includes(col)) {
            errors.push(`Pricing Sensitivity missing column: "${col}"`);
        }
    });

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Parse Excel file and extract business data
 * @param {File} file - Excel file from input
 * @returns {Promise<Object>} - Parsed business data
 */
export async function parseExcelFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: "array" });

                console.log("📊 Workbook loaded. Sheets:", workbook.SheetNames);

                // Validate structure
                const validation = validateExcelStructure(workbook);
                if (!validation.valid) {
                    reject(new Error(`Invalid Excel structure:\n${validation.errors.join("\n")}`));
                    return;
                }

                // Parse Cash Flow Statement
                const cashFlowSheet = workbook.Sheets["Cash Flow Statement"];
                const cashFlowData = XLSX.utils.sheet_to_json(cashFlowSheet);

                const cashFlow = cashFlowData.map((row) => ({
                    date: formatDate(row["Date"]),
                    description: row["Description"] || "",
                    cashIn: Number(row["Cash In"]) || 0,
                    cashOut: Number(row["Cash Out"]) || 0,
                    netCashFlow: Number(row["Net Cash Flow"]) || 0,
                    runningBalance: Number(row["Running Balance"]) || 0
                }));

                console.log("✅ Cash Flow parsed:", cashFlow.length, "entries");

                // Parse Contribution Margin
                const contributionSheet = workbook.Sheets["Contribution Margin"];
                const contributionData = XLSX.utils.sheet_to_json(contributionSheet);

                // Get fixed cost from first row
                const fixedCost = Number(contributionData[0]["Fixed Costs"]) || 0;

                const products = contributionData.map((row, index) => ({
                    id: `product_${index + 1}`,
                    name: row["Item"] || "",
                    category: row["Value"] || "",
                    pricePerUnit: Number(row["Price"]) || 0,
                    variableCostPerUnit: Number(row["Variable Cost"]) || 0,
                    contributionMargin: Number(row["CM"]) || 0,
                    breakEvenUnits: Number(row["Break-Even Units"]) || 0,
                    breakEvenRevenue: Number(row["Break-Even SAR"]) || 0
                }));

                console.log("✅ Products parsed:", products.length, "items");
                console.log("✅ Fixed Cost:", fixedCost);

                // Parse Pricing Sensitivity
                const pricingSheet = workbook.Sheets["Pricing Sensitivity"];
                const pricingData = XLSX.utils.sheet_to_json(pricingSheet);

                const pricingScenarios = pricingData.map((row) => ({
                    scenario: row["Scenario"] || "",
                    price: Number(row["Price"]) || 0,
                    unitsSold: Number(row["Units Sold"]) || 0,
                    revenue: Number(row["Revenue"]) || 0,
                    variableCost: Number(row["Variable Cost"]) || 0,
                    contributionMargin: Number(row["CM"]) || 0,
                    profit: Number(row["Profit"]) || 0
                }));

                console.log("✅ Pricing scenarios parsed:", pricingScenarios.length, "scenarios");

                // Return parsed data
                resolve({
                    fixedCost,
                    products,
                    cashFlow,
                    pricingScenarios
                });

            } catch (error) {
                console.error("🔥 Parse error:", error);
                reject(new Error(`Failed to parse Excel file: ${error.message}`));
            }
        };

        reader.onerror = () => {
            reject(new Error("Failed to read file"));
        };

        reader.readAsArrayBuffer(file);
    });
}

/**
 * Format date from Excel serial number or string
 * @param {*} dateValue - Date value from Excel
 * @returns {string} - Formatted date string (YYYY-MM-DD)
 */
function formatDate(dateValue) {
    if (!dateValue) return "";

    // If it's already a string date
    if (typeof dateValue === "string") {
        return dateValue;
    }

    // If it's an Excel serial number
    if (typeof dateValue === "number") {
        const excelEpoch = new Date(1900, 0, 1);
        const days = dateValue - 2; // Excel wrongly considers 1900 as leap year
        const date = new Date(excelEpoch.getTime() + days * 24 * 60 * 60 * 1000);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    return String(dateValue);
}