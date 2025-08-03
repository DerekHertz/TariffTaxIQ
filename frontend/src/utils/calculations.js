/**
 * Calculate tariff pass-through rate based on product elasticity
 * 
 * This function implements the economic theory that tariff pass-through rates
 * depend on the relative elasticities of supply and demand. Products with
 * inelastic demand (fewer substitutes) have higher pass-through rates.
 * 
 * Economic Formula: supply elasticity / (supply elasticity + |demand elasticity|) * 100
 * 
 * Examples:
 * - High pass-through (85%): Luxury goods with inelastic demand
 * - Low pass-through (25%): Commodities with many substitutes
 * 
 * @param {Object|null} product - Product object with elasticity data
 * @param {Object} product.elasticity - Elasticity values container
 * @param {number} product.elasticity.demand - Demand elasticity (typically negative, e.g., -2.5)
 * @param {number} product.elasticity.supply - Supply elasticity (typically positive, e.g., 1.8)
 * @returns {number} Pass-through rate as percentage (0-100)
 * 
 * @example
 * const product = {
 *   elasticity: { demand: -2.0, supply: 1.5 }
 * };
 * const rate = calculatePassThrough(product); // Returns ~42.9%
 */
export const calculatePassThrough = (product) => {
    // Handle null/undefined product gracefully
    if (!product || !product.elasticity) return 0;
    
    const { demand, supply } = product.elasticity;
    
    // Validate elasticity values
    if (typeof demand !== 'number' || typeof supply !== 'number') return 0;
    
    // Apply economic formula for pass-through rate
    return (supply / (supply + Math.abs(demand))) * 100;
};

/**
 * Calculate consumer burden from tariffs
 * 
 * Estimates the additional cost burden on consumers based on tariff rate,
 * pass-through rate, and base consumption patterns. This helps quantify
 * the real-world impact of tariffs on household budgets.
 * 
 * @param {number} tariffRate - Tariff rate as percentage (e.g., 25 for 25%)
 * @param {number} passThrough - Pass-through rate as percentage (0-100)
 * @param {number} baseConsumption - Base consumption multiplier (default: 15)
 * @returns {string} Consumer burden formatted to 2 decimal places
 * 
 * @example
 * const burden = calculateConsumerBurden(25, 75, 15); // "281.25"
 */
export const calculateConsumerBurden = (tariffRate, passThrough, baseConsumption = 15) => {
    // Validate input parameters
    if (typeof tariffRate !== 'number' || typeof passThrough !== 'number') {
        return '0.00';
    }
    
    // Calculate burden: tariff × pass-through × consumption base
    const burden = tariffRate * (passThrough / 100) * baseConsumption;
    return burden.toFixed(2);
};

/**
 * Calculate import cost from retail price and markup
 * 
 * Works backwards from the retail price to determine the original import cost
 * before retailer markup was applied. This is essential for calculating
 * the tariff base amount.
 * 
 * Formula: Import Cost = Retail Price ÷ (1 + Markup%/100)
 * 
 * @param {number} retailPrice - Final retail price in dollars
 * @param {number} markupPercent - Retailer markup percentage (e.g., 50 for 50%)
 * @returns {number} Import cost before markup in dollars
 * 
 * @example
 * const importCost = calculateImportCost(100, 50); // Returns 66.67
 * // $100 retail price with 50% markup = $66.67 import cost
 */
export const calculateImportCost = (retailPrice, markupPercent) => {
    // Validate inputs to prevent division by zero or invalid calculations
    if (typeof retailPrice !== 'number' || typeof markupPercent !== 'number' || retailPrice <= 0) {
        return 0;
    }
    
    // Prevent negative markup from causing invalid results
    if (markupPercent <= -100) return 0;
    
    // Calculate original import cost before markup
    return retailPrice / (1 + markupPercent / 100);
};

/**
 * Calculate absolute tariff amount in dollars
 * 
 * Determines the total tariff tax applied to imported goods based on
 * the import cost and the applicable tariff rate.
 * 
 * Formula: Tariff Amount = Import Cost × (Tariff Rate / 100)
 * 
 * @param {number} importCost - Import cost in dollars (before tariff)
 * @param {number} tariffRate - Tariff rate as percentage (e.g., 25 for 25%)
 * @returns {number} Tariff amount in dollars
 * 
 * @example
 * const tariffAmount = calculateTariffAmount(66.67, 25); // Returns 16.67
 * // $66.67 import cost with 25% tariff = $16.67 tariff
 */
export const calculateTariffAmount = (importCost, tariffRate) => {
    // Validate inputs
    if (typeof importCost !== 'number' || typeof tariffRate !== 'number' || importCost < 0 || tariffRate < 0) {
        return 0;
    }
    
    // Calculate tariff as percentage of import cost
    return importCost * (tariffRate / 100);
};

/**
 * Calculate how much of the tariff cost is passed to consumers
 * 
 * Not all tariff costs are passed to consumers - companies may absorb
 * some costs to remain competitive. This function calculates the portion
 * that reaches consumers based on the pass-through rate.
 * 
 * Formula: Consumer Impact = Tariff Amount × (Pass-Through Rate / 100)
 * 
 * @param {number} tariffAmount - Total tariff amount in dollars
 * @param {number} passThroughRate - Pass-through rate as percentage (0-100)
 * @returns {number} Amount of tariff passed to consumers in dollars
 * 
 * @example
 * const consumerImpact = calculateTariffPassed(16.67, 75); // Returns 12.50
 * // $16.67 tariff with 75% pass-through = $12.50 to consumers
 */
export const calculateTariffPassed = (tariffAmount, passThroughRate) => {
    // Validate inputs
    if (typeof tariffAmount !== 'number' || typeof passThroughRate !== 'number' || tariffAmount < 0) {
        return 0;
    }
    
    // Clamp pass-through rate to valid range (0-100%)
    const clampedRate = Math.max(0, Math.min(100, passThroughRate));
    
    // Calculate portion of tariff passed to consumers
    return tariffAmount * (clampedRate / 100);
};

/**
 * Calculate future retail price after tariff implementation
 * 
 * Determines the new retail price consumers will pay after tariffs
 * are implemented, including the portion of tariff costs passed through.
 * 
 * Formula: Future Price = Current Price + Tariff Passed to Consumers
 * 
 * @param {number} retailPrice - Current retail price in dollars
 * @param {number} tariffPassed - Amount of tariff passed to consumers in dollars
 * @returns {number} New retail price including tariff impact
 * 
 * @example
 * const futurePrice = calculateFuturePrice(100, 12.50); // Returns 112.50
 * // $100 current price + $12.50 tariff impact = $112.50 future price
 */
export const calculateFuturePrice = (retailPrice, tariffPassed) => {
    // Validate inputs
    if (typeof retailPrice !== 'number' || typeof tariffPassed !== 'number' || retailPrice < 0 || tariffPassed < 0) {
        return retailPrice || 0;
    }
    
    // Calculate new price including tariff impact
    return retailPrice + tariffPassed;
};

/**
 * Calculate what percentage of the future price represents tariff tax
 * 
 * Shows the effective tax rate consumers pay due to tariffs as a percentage
 * of the final purchase price. This helps consumers understand the true
 * tax burden of tariffs.
 * 
 * Formula: Effective Tax Rate = (Tariff Passed / Future Price) × 100
 * 
 * @param {number} tariffPassed - Amount of tariff passed to consumers in dollars
 * @param {number} futurePrice - Future retail price including tariff in dollars
 * @returns {number} Tariff tax percentage of final price (0-100)
 * 
 * @example
 * const taxRate = calculateTariffTaxPercentage(12.50, 112.50); // Returns 11.11
 * // $12.50 tariff in $112.50 price = 11.11% effective tax rate
 */
export const calculateTariffTaxPercentage = (tariffPassed, futurePrice) => {
    // Validate inputs and prevent division by zero
    if (typeof tariffPassed !== 'number' || typeof futurePrice !== 'number' || futurePrice <= 0 || tariffPassed < 0) {
        return 0;
    }
    
    // Calculate percentage of final price that is tariff tax
    return (tariffPassed / futurePrice) * 100;
};

/**
 * Calculate initial price impact accounting for inventory buffer
 * 
 * Companies with existing inventory can delay price increases until their
 * current stock is depleted. This function calculates the reduced initial
 * impact based on inventory levels.
 * 
 * The logic: More inventory = lower immediate impact, but full impact
 * occurs when inventory is exhausted.
 * 
 * Formula: Initial Impact = Price Increase × (1 - Inventory Months / 12)
 * 
 * @param {number} inventoryMonths - Months of inventory buffer (0-12)
 * @param {number} priceIncrease - Full price increase amount in dollars
 * @returns {number} Adjusted price increase accounting for inventory cushion
 * 
 * @example
 * const initialImpact = calculateInventoryImpact(3, 12.50); // Returns 9.375
 * // 3 months inventory reduces immediate impact by 25% (3/12)
 * // $12.50 × (1 - 3/12) = $9.375 initial impact
 */
export const calculateInventoryImpact = (inventoryMonths, priceIncrease) => {
    // Validate inputs
    if (typeof inventoryMonths !== 'number' || typeof priceIncrease !== 'number' || priceIncrease < 0) {
        return priceIncrease || 0;
    }
    
    // Clamp inventory months to realistic range (0-12)
    const clampedMonths = Math.max(0, Math.min(12, inventoryMonths));
    
    // Calculate reduced initial impact based on inventory buffer
    return priceIncrease * (1 - clampedMonths / 12);
};