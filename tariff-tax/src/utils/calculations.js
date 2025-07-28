export const calculatePassThrough = (product) => {
    if (!product) return 0;
    const { demand, supply } = product.elasticity;
    return (supply / (supply + Math.abs(demand))) * 100;
};

export const calculateConsumerBurden = (tariffRate, passThrough, baseConsumption = 15) => {
    return (tariffRate * (passThrough / 100) * baseConsumption).toFixed(2);
};

export const calculateImportCost = (retailPrice, markupPercent) => {
    return retailPrice / (1 + markupPercent / 100);
};

export const calculateTariffAmount = (importCost, tariffRate) => {
    return importCost * (tariffRate / 100);
};

export const calculateTariffPassed = (tariffAmount, passThroughRate) => {
    return tariffAmount * (passThroughRate / 100);
};

export const calculateFuturePrice = (retailPrice, tariffPassed) => {
    return retailPrice + tariffPassed;
};

export const calculateTariffTaxPercentage = (tariffPassed, futurePrice) => {
    return futurePrice > 0 ? (tariffPassed / futurePrice) * 100 : 0;
};

export const calculateInventoryImpact = (inventoryMonths, priceIncrease) => {
    return priceIncrease * (1 - inventoryMonths / 12);
};