/**
 * Trip Cost Calculator Utility
 * Functions to calculate operational costs for trips
 */

/**
 * Calculate total operational cost for a trip
 * Sums all expenses linked to the trip (fuel, maintenance, tolls, parking, etc.)
 * 
 * @param {Array} expenses - Array of expense records
 * @param {number} tripId - Trip ID to filter expenses
 * @returns {number} Total operational cost
 */
export const calculateTripOperationalCost = (expenses, tripId) => {
  if (!Array.isArray(expenses) || !tripId) return 0;
  
  const tripExpenses = expenses.filter(expense => expense.tripId === tripId);
  return tripExpenses.reduce((total, expense) => total + (expense.amount || 0), 0);
};

/**
 * Calculate cost per kilometer for a trip
 * Divides total operational cost by distance traveled
 * 
 * @param {number} operationalCost - Total operational cost
 * @param {number} distance - Distance traveled in km
 * @returns {number} Cost per km (rounded to 2 decimals)
 */
export const calculateCostPerKm = (operationalCost, distance) => {
  if (!distance || distance === 0) return 0;
  return Math.round((operationalCost / distance) * 100) / 100;
};

/**
 * Calculate cost per unit of load (e.g., per kg)
 * Useful for profitability analysis
 * 
 * @param {number} operationalCost - Total operational cost
 * @param {number} load - Load carried in kg
 * @returns {number} Cost per kg (rounded to 2 decimals)
 */
export const calculateCostPerUnit = (operationalCost, load) => {
  if (!load || load === 0) return 0;
  return Math.round((operationalCost / load) * 100) / 100;
};

/**
 * Get formatted cost string with currency symbol
 * 
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string (e.g., "₹4,322.50")
 */
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '₹0';
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Get cost efficiency status based on cost per km
 * Returns color and label for UI display
 * 
 * @param {number} costPerKm - Cost per kilometer
 * @returns {Object} { status: string, color: string, label: string }
 */
export const getCostEfficiencyStatus = (costPerKm) => {
  if (costPerKm <= 10) {
    return { status: 'excellent', color: '#4CAF50', label: 'Excellent' };
  } else if (costPerKm <= 20) {
    return { status: 'good', color: '#8BC34A', label: 'Good' };
  } else if (costPerKm <= 35) {
    return { status: 'normal', color: '#FFC107', label: 'Normal' };
  } else if (costPerKm <= 50) {
    return { status: 'poor', color: '#FF9800', label: 'Poor' };
  } else {
    return { status: 'critical', color: '#F44336', label: 'Critical' };
  }
};

/**
 * Calculate profitability metrics for a trip
 * Compares cost against expected revenue/distance
 * 
 * @param {Object} trip - Trip object with distance and cost
 * @param {number} revenuePerKm - Expected revenue per km (default: 100)
 * @returns {Object} Profitability metrics
 */
export const calculateTripProfitability = (trip, operationalCost, revenuePerKm = 100) => {
  const distance = trip.distance || 0;
  const expectedRevenue = distance * revenuePerKm;
  const profit = expectedRevenue - operationalCost;
  const profitMargin = expectedRevenue > 0 ? (profit / expectedRevenue) * 100 : 0;
  
  return {
    expectedRevenue,
    operationalCost,
    profit,
    profitMargin: Math.round(profitMargin * 100) / 100,
    isProfitable: profit > 0,
  };
};

/**
 * Summary: Get all cost metrics for a trip at once
 * 
 * @param {Object} trip - Trip object
 * @param {number} operationalCost - Total operational cost
 * @returns {Object} Complete cost metrics
 */
export const getTripCostMetrics = (trip, operationalCost) => {
  const costPerKm = calculateCostPerKm(operationalCost, trip.distance);
  const costPerUnit = calculateCostPerUnit(operationalCost, trip.load);
  const efficiency = getCostEfficiencyStatus(costPerKm);
  
  return {
    totalCost: operationalCost,
    costPerKm,
    costPerUnit,
    efficiency,
    formattedCost: formatCurrency(operationalCost),
    formattedCostPerKm: formatCurrency(costPerKm),
    formattedCostPerUnit: formatCurrency(costPerUnit),
  };
};
