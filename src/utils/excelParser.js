// excelParser.js
import * as XLSX from "xlsx";

/**
 * Validate workbook has the right sheets + columns
 */
function validateExcelStructure(workbook) {
  const errors = [];

  const requiredSheets = [
    "Cash Flow Statement",
    "Contribution Margin",
    "Pricing Sensitivity",
  ];

  requiredSheets.forEach((sheetName) => {
    if (!workbook.SheetNames.includes(sheetName)) {
      errors.push(`Missing required sheet: "${sheetName}"`);
    }
  });

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // ===== Cash Flow Statement =====
  const cfSheet = workbook.Sheets["Cash Flow Statement"];
  const cfHeaders = XLSX.utils.sheet_to_json(cfSheet, { header: 1 })[0] || [];
  const requiredCFCols = [
    "Date",
    "Description",
    "Cash In",
    "Cash Out",
    "Net Cash Flow",
    "Running Balance",
  ];

  requiredCFCols.forEach((col) => {
    if (!cfHeaders.includes(col)) {
      errors.push(`Cash Flow: missing column "${col}"`);
    }
  });

  // ===== Contribution Margin =====
  const cmSheet = workbook.Sheets["Contribution Margin"];
  const cmHeaders = XLSX.utils.sheet_to_json(cmSheet, { header: 1 })[0] || [];
  const requiredCMCols = [
    "Item",
    "Value",
    "Price",
    "Variable Cost",
    "Fixed Costs",
    "CM",
    "Break-Even Units",
    "Break-Even SAR",
  ];

  requiredCMCols.forEach((col) => {
    if (!cmHeaders.includes(col)) {
      errors.push(`Contribution Margin: missing column "${col}"`);
    }
  });

  // ===== Pricing Sensitivity =====
  const psSheet = workbook.Sheets["Pricing Sensitivity"];
  const psHeaders = XLSX.utils.sheet_to_json(psSheet, { header: 1 })[0] || [];
  const requiredPSCols = [
    "Scenario",
    "Price",
    "Units Sold",
    "Revenue",
    "Variable Cost",
    "CM",
    "Profit",
  ];

  requiredPSCols.forEach((col) => {
    if (!psHeaders.includes(col)) {
      errors.push(`Pricing Sensitivity: missing column "${col}"`);
    }
  });

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, errors: [] };
}

/** helper to handle numbers with commas / blanks */
function toNumber(value) {
  if (value === null || value === undefined || value === "") return 0;
  if (typeof value === "number") return value;
  const cleaned = String(value).replace(/,/g, "");
  const n = Number(cleaned);
  return Number.isNaN(n) ? 0 : n;
}

/** Excel serial / string → YYYY-MM-DD */
function formatDate(dateValue) {
  if (!dateValue) return "";

  // Already string (e.g. "2025-01-05")
  if (typeof dateValue === "string") {
    // try to standardize
    const d = new Date(dateValue);
    if (!Number.isNaN(d.getTime())) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
    return dateValue;
  }

  // Excel serial
  if (typeof dateValue === "number") {
    const excelEpoch = new Date(1900, 0, 1);
    const days = dateValue - 2; // Excel bug: 1900 leap year
    const date = new Date(
      excelEpoch.getTime() + days * 24 * 60 * 60 * 1000
    );

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  return String(dateValue);
}

/**
 * Main parser — returns:
 * {
 *   fixedCost,
 *   products: [...],
 *   cashFlow: [...],
 *   pricingScenarios: [...]
 * }
 */
export function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        const validation = validateExcelStructure(workbook);
        if (!validation.valid) {
          console.error("❌ Excel validation failed:", validation.errors);
          return reject(
            new Error(
              "Invalid Excel structure:\n" + validation.errors.join("\n")
            )
          );
        }

        /* ================= CASH FLOW SHEET ================= */
        const cfSheet = workbook.Sheets["Cash Flow Statement"];
        const cfRows = XLSX.utils.sheet_to_json(cfSheet, { defval: null });

        const cashFlow = cfRows.map((row) => ({
          date: formatDate(row["Date"]),
          description: row["Description"] || "",
          cashIn: toNumber(row["Cash In"]),
          cashOut: toNumber(row["Cash Out"]),
          netCashFlow: toNumber(row["Net Cash Flow"]),
          runningBalance: toNumber(row["Running Balance"]),
        }));

        console.log("✅ Cash flow rows parsed:", cashFlow.length);

        /* ================= CONTRIBUTION MARGIN ================= */
        const cmSheet = workbook.Sheets["Contribution Margin"];
        const cmRows = XLSX.utils.sheet_to_json(cmSheet, { defval: null });

        const products = cmRows
          .filter((row) => row["Item"])
          .map((row, index) => ({
            // Option B fields
            index, // internal index (not required in DB but useful in UI)
            name: row["Item"] || "",
            value: row["Value"] || "",

            pricePerUnit: toNumber(row["Price"]),
            variableCostPerUnit: toNumber(row["Variable Cost"]),
            fixedCosts: toNumber(row["Fixed Costs"]),
            cm: toNumber(row["CM"]),
            breakEvenUnits: toNumber(row["Break-Even Units"]),
            breakEvenSar: toNumber(row["Break-Even SAR"]),
          }));

        console.log("✅ Products parsed:", products.length, "products");

        // overall fixed cost (first product fixed costs)
        const fixedCost =
          products.length > 0 ? products[0].fixedCosts || 0 : 0;

        /* ================= PRICING SENSITIVITY ================= */
        const psSheet = workbook.Sheets["Pricing Sensitivity"];
        const psRows = XLSX.utils.sheet_to_json(psSheet, { defval: null });

        const pricingScenarios = psRows
          .filter((row) => row["Scenario"])
          .map((row) => ({
            scenario: row["Scenario"] || "",
            price: toNumber(row["Price"]),
            unitsSold: toNumber(row["Units Sold"]),
            revenue: toNumber(row["Revenue"]),
            variableCost: toNumber(row["Variable Cost"]),
            cm: toNumber(row["CM"]),
            profit: toNumber(row["Profit"]),
          }));

        console.log(
          "✅ Pricing scenarios parsed:",
          pricingScenarios.length,
          "scenarios"
        );

        resolve({
          fixedCost,
          products,
          cashFlow,
          pricingScenarios,
        });
      } catch (error) {
        console.error("🔥 Parse error:", error);
        reject(
          new Error(`Failed to parse Excel file: ${error.message}`)
        );
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsArrayBuffer(file);
  });
}
