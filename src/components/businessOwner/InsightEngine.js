// InsightEngine.js — FINAL VERSION (REAL DATA ENABLED)

export function generateDashboardInsights(baseData) {
    if (!baseData) return null;

    const {
        contributionMargin,
        cashFlow,
        pricingSensitivity
    } = baseData;

    // -----------------------------------------------------
    // BREAK-EVEN INSIGHTS (from Contribution Margin sheet)
    // -----------------------------------------------------
    const bepInsights = [];

    if (Array.isArray(contributionMargin) && contributionMargin.length > 0) {
        contributionMargin.forEach((row) => {
            const cm = Number(row.CM) || 0;
            const breakUnits = Number(row["Break-Even Units"]) || 0;

            if (cm <= 0) {
                bepInsights.push({
                    product: row.Item,
                    issue: true,
                    message: `${row.Item} cannot break even because CM is 0 or negative.`
                });
            } else {
                bepInsights.push({
                    product: row.Item,
                    issue: false,
                    breakEvenUnits: breakUnits,
                    message: `${row.Item} needs ${breakUnits.toLocaleString()} units to break even.`
                });
            }
        });
    }

    // -----------------------------------------------------
    // PRICING INSIGHTS (from Contribution Margin sheet)
    // -----------------------------------------------------
    const pricingInsights = (contributionMargin || []).map((row) => {
        const price = Number(row.Price) || 0;
        const varCost = Number(row["Variable Cost"]) || 0;
        const margin = price > 0 ? ((price - varCost) / price) * 100 : 0;

        return {
            product: row.Item,
            margin,
            opportunity:
                margin < 30
                    ? "Low margin — consider raising price."
                    : margin > 60
                    ? "High margin — premium pricing viable."
                    : "Healthy margin."
        };
    });

    // -----------------------------------------------------
    // CASH FLOW INSIGHTS (from Cash Flow sheet)
    // -----------------------------------------------------
    const cashInsights = computeCashFlowMetrics(cashFlow);

    // -----------------------------------------------------
    // BUSINESS HEALTH SCORE
    // -----------------------------------------------------
    const healthScore =
        (pricingInsights.filter((p) => p.margin > 40).length * 5) +
        (cashInsights.isHealthy ? 60 : 20);

    return {
        bepInsights,
        pricingInsights,
        pricingSensitivity,
        cashInsights,
        healthScore: Math.min(100, healthScore),
        recommendations: buildRecommendations(
            bepInsights,
            pricingInsights,
            cashInsights
        )
    };
}

// -----------------------------------------------------
// CASH FLOW METRIC ENGINE
// -----------------------------------------------------
function computeCashFlowMetrics(cashFlow = []) {
    if (!Array.isArray(cashFlow) || cashFlow.length === 0) {
        return {
            realBurnRate: 0,
            dangerMonths: 0,
            firstDangerMonth: null,
            isHealthy: true
        };
    }

    let running = Number(cashFlow[0].RunningBalance || 0);
    const negatives = [];
    let sumNeg = 0, negCount = 0;

    cashFlow.forEach((row, i) => {
        const net = Number(row.NetCashFlow || row["Net Cash Flow"] || 0);

        if (i !== 0) running += net;

        if (net < 0) {
            sumNeg += net;
            negCount++;
        }
        if (running < 0) {
            negatives.push(row.Date);
        }
    });

    return {
        realBurnRate: negCount ? Math.abs(sumNeg / negCount) : 0,
        dangerMonths: negatives.length,
        firstDangerMonth: negatives[0] || null,
        isHealthy: negatives.length === 0
    };
}

// -----------------------------------------------------
// AUTOMATIC RECOMMENDATION ENGINE
// -----------------------------------------------------
function buildRecommendations(bepInsights, pricingInsights, cashInsights) {
    const recs = [];

    if (cashInsights.dangerMonths > 0) {
        recs.push(
            `Cash may turn negative starting ${cashInsights.firstDangerMonth}.`
        );
    }

    pricingInsights.forEach((p) => {
        if (p.margin < 30) {
            recs.push(`${p.product} has a low margin — consider increasing price.`);
        }
    });

    bepInsights.forEach((b) => {
        if (b.issue) {
            recs.push(`Review cost structure for ${b.product}; cannot break even.`);
        }
    });

    if (recs.length === 0) {
        recs.push("Your business looks healthy. Keep going!");
    }

    return recs;
}
