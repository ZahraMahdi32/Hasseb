// InsightEngine.js

export function generateDashboardInsights(baseData) {
    if (!baseData) return null;

    const { fixedCost, products, cashFlow, pricingScenarios } = baseData;

    // ============================
    // 1) UNIFY PRODUCT DATA
    // ============================
    // إذا كان السعر والتكلفة غير موجودين داخل products, استخدم scenarios
    const normalizedProducts = (products || []).map((p, i) => {
        const scenario = pricingScenarios?.[i];

        return {
            name: p.name,
            pricePerUnit: scenario?.price ?? p.pricePerUnit ?? 0,
            variableCostPerUnit: scenario?.variableCost ?? p.variableCostPerUnit ?? 0
        };
    });

    // ============================
    // BREAK-EVEN INSIGHTS
    // ============================
    const bepInsights = [];

    if (normalizedProducts.length > 0 && fixedCost != null) {
        normalizedProducts.forEach((p) => {

            const cm = Number(p.pricePerUnit) - Number(p.variableCostPerUnit);

            if (isNaN(cm)) return;

            if (cm <= 0) {
                bepInsights.push({
                    product: p.name,
                    issue: true,
                    message: `${p.name} cannot break even because its price is lower than its variable cost.`
                });
            } else {
                const units = Math.ceil(Number(fixedCost) / cm);
                bepInsights.push({
                    product: p.name,
                    issue: false,
                    breakEvenUnits: units,
                    message: `${p.name} needs around ${units.toLocaleString()} units to cover fixed costs.`
                });
            }
        });
    }

    // ============================
    // PRICING INSIGHTS
    // ============================
    const pricingInsights = normalizedProducts.map((p) => {
        const price = Number(p.pricePerUnit) || 0;
        const varCost = Number(p.variableCostPerUnit) || 0;

        const margin = price > 0 ? ((price - varCost) / price) * 100 : 0;

        return {
            product: p.name,
            margin,
            opportunity:
                margin < 30
                    ? "Low margin — consider slight price increase."
                    : margin > 60
                    ? "High margin — strong margin, possible premium pricing."
                    : "Healthy margin."
        };
    });

    // ============================
    // CASH FLOW INSIGHTS
    // ============================
    let cashInsights = {
        realBurnRate: 0,
        dangerMonths: 0,
        firstDangerMonth: null,
        isHealthy: true
    };

    if (Array.isArray(cashFlow) && cashFlow.length > 0) {
        let running =
            cashFlow[0].runningBalance != null
                ? Number(cashFlow[0].runningBalance)
                : 0;

        const danger = [];
        const netFlows = [];

        cashFlow.forEach((row, i) => {
            const cashIn = Number(row.cashIn) || 0;
            const cashOut = Number(row.cashOut) || 0;

            const net = cashIn - cashOut;
            netFlows.push(net);

            if (i !== 0 || row.runningBalance == null) {
                running += net;
            }

            if (running < 0) {
                danger.push({ month: row.date, balance: running });
            }
        });

        const negativeMonths = netFlows.filter((n) => n < 0);

        const realBurnRate =
            negativeMonths.length > 0
                ? Math.abs(
                      negativeMonths.reduce((sum, n) => sum + n, 0) /
                          negativeMonths.length
                  )
                : 0;

        cashInsights = {
            realBurnRate,
            dangerMonths: danger.length,
            firstDangerMonth: danger[0]?.month || null,
            isHealthy: danger.length === 0
        };
    }

    // ============================
    // HEALTH SCORE
    // ============================
    const scoreParts = [];

    const healthyProductsCount =
        pricingInsights.filter((p) => p.margin > 40).length;
    scoreParts.push(healthyProductsCount * 5);

    scoreParts.push(cashInsights.isHealthy ? 60 : 20);

    const healthScore = Math.min(
        100,
        scoreParts.reduce((a, b) => a + b, 0)
    );

    // ============================
    // RECOMMENDATIONS
    // ============================
    return {
        bepInsights,
        pricingInsights,
        cashInsights,
        healthScore,
        recommendations: buildRecommendations(
            bepInsights,
            pricingInsights,
            cashInsights
        )
    };
}

// ------------------------------------------------------
// RECOMMENDATION ENGINE
// ------------------------------------------------------
function buildRecommendations(bepInsights, pricingInsights, cashInsights) {
    const recs = [];

    if (cashInsights.dangerMonths > 0) {
        recs.push(
            `Cash reserves may become negative starting ${cashInsights.firstDangerMonth}. Consider expense reduction or revenue increase.`
        );
    }

    pricingInsights.forEach((p) => {
        if (p.margin < 30) {
            recs.push(
                `${p.product} has a low profit margin — consider increasing price.`
            );
        }
    });

    bepInsights.forEach((b) => {
        if (b.issue) {
            recs.push(
                `Review cost structure of ${b.product}. It cannot break even.`
            );
        }
    });

    if (recs.length === 0) {
        recs.push("Your business fundamentals look healthy. Maintain momentum.");
    }

    return recs;
}
