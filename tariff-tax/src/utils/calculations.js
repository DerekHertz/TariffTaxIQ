/**
 * Calculate tariff pass-through rate based on product elasticity
 * Uses supply and demand elasticity to determine what percentage of tariff costs are passed to consumers
 * Formula: supply elasticity / (supply elasticity + |demand elasticity|) * 100
 * @param {Object} product - Product object with elasticity data
 * @param {Object} product.elasticity - Elasticity values
 * @param {number} product.elasticity.demand - Demand elasticity (typically negative)
 * @param {number} product.elasticity.supply - Supply elasticity (typically positive)
 * @returns {number} Pass-through rate as percentage (0-100)
 */
export const calculatePassThrough = (product) => {
    if (!product) return 0;
    const { demand, supply } = product.elasticity;
    return (supply / (supply + Math.abs(demand))) * 100;
};

/**
 * Calculate consumer burden from tariffs
 * Estimates the additional cost burden on consumers based on tariff rate and pass-through
 * @param {number} tariffRate - Tariff rate as percentage
 * @param {number} passThrough - Pass-through rate as percentage
 * @param {number} baseConsumption - Base consumption value (default: 15)
 * @returns {string} Consumer burden formatted to 2 decimal places
 */
export const calculateConsumerBurden = (tariffRate, passThrough, baseConsumption = 15) => {
    return (tariffRate * (passThrough / 100) * baseConsumption).toFixed(2);
};

/**
 * Calculate import cost from retail price and markup
 * Works backwards from retail price to determine the original import cost
 * @param {number} retailPrice - Final retail price in dollars
 * @param {number} markupPercent - Retailer markup percentage
 * @returns {number} Import cost before markup
 */
export const calculateImportCost = (retailPrice, markupPercent) => {
    return retailPrice / (1 + markupPercent / 100);
};

/**
 * Calculate absolute tariff amount in dollars
 * @param {number} importCost - Import cost in dollars
 * @param {number} tariffRate - Tariff rate as percentage
 * @returns {number} Tariff amount in dollars
 */
export const calculateTariffAmount = (importCost, tariffRate) => {
    return importCost * (tariffRate / 100);
};

/**
 * Calculate how much of the tariff cost is passed to consumers
 * @param {number} tariffAmount - Total tariff amount in dollars
 * @param {number} passThroughRate - Pass-through rate as percentage
 * @returns {number} Amount of tariff passed to consumers in dollars
 */
export const calculateTariffPassed = (tariffAmount, passThroughRate) => {
    return tariffAmount * (passThroughRate / 100);
};

/**
 * Calculate future retail price after tariff implementation
 * @param {number} retailPrice - Current retail price in dollars
 * @param {number} tariffPassed - Amount of tariff passed to consumers
 * @returns {number} New retail price including tariff impact
 */
export const calculateFuturePrice = (retailPrice, tariffPassed) => {
    return retailPrice + tariffPassed;
};

/**
 * Calculate what percentage of the future price represents tariff tax
 * Shows the effective tax rate consumers pay due to tariffs
 * @param {number} tariffPassed - Amount of tariff passed to consumers
 * @param {number} futurePrice - Future retail price including tariff
 * @returns {number} Tariff tax percentage of final price
 */
export const calculateTariffTaxPercentage = (tariffPassed, futurePrice) => {
    return futurePrice > 0 ? (tariffPassed / futurePrice) * 100 : 0;
};

/**
 * Calculate initial price impact accounting for inventory buffer
 * Companies with existing inventory will see gradual price increases
 * @param {number} inventoryMonths - Months of inventory buffer (0-12)
 * @param {number} priceIncrease - Full price increase amount
 * @returns {number} Adjusted price increase accounting for inventory cushion
 */
export const calculateInventoryImpact = (inventoryMonths, priceIncrease) => {
    return priceIncrease * (1 - inventoryMonths / 12);
};