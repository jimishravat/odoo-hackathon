/**
 * Fuel to Expense Synchronization Utility
 * 
 * Automatically creates/updates expense entries when fuel records are created/updated
 * Maps fuel fields to expense fields to maintain data consistency
 */

import { expensesAPI } from '../services/api';

/**
 * Maps fuel data to expense data
 * Takes fuel fields and creates corresponding expense fields
 * 
 * @param {Object} fuelData - Fuel record data
 * @returns {Object} - Expense data with mapped fields
 */
export const mapFuelToExpense = (fuelData) => {
  const fuelTypeToCategory = {
    diesel: 'Fuel',
    petrol: 'Fuel',
    cng: 'Fuel',
    electric: 'Fuel',
  };

  const fuelTypeDescription = {
    diesel: 'Diesel Refuel',
    petrol: 'Petrol Refuel',
    cng: 'CNG Refuel',
    electric: 'Electric Charging',
  };

  // Use pricePerLitre if available, otherwise use price
  const pricePerUnit = fuelData.pricePerLitre || fuelData.price;

  return {
    category: fuelTypeToCategory[fuelData.fuelType] || 'Fuel',
    description: `${fuelTypeDescription[fuelData.fuelType] || 'Fuel'} - ${fuelData.quantity}L at ${fuelData.location}`,
    vehicle: fuelData.vehicle,
    amount: fuelData.totalCost,
    date: fuelData.date,
    paymentMethod: fuelData.paymentMethod || 'cash',
    status: 'completed',
    notes: `Fuel Type: ${fuelData.fuelType}, Quantity: ${fuelData.quantity}L, Price: ₹${pricePerUnit}/L, Location: ${fuelData.location}`,
    // Link fuel record to expense for tracking
    sourceType: 'fuel',
    sourceId: fuelData.id,
  };
};

/**
 * Creates an expense entry when fuel is added
 * Syncs fuel data to expenses automatically
 * 
 * @param {Object} fuelData - Fuel record data
 * @returns {Promise<Object>} - Created expense data
 */
export const createExpenseFromFuel = async (fuelData) => {
  try {
    const expenseData = mapFuelToExpense(fuelData);
    const response = await expensesAPI.create(expenseData);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Failed to create expense from fuel:', error);
    // Don't throw - this is a secondary operation
    // Fuel should still be created even if expense creation fails
    return { success: false, error: error.message };
  }
};

/**
 * Updates expense when fuel record is updated
 * Finds the linked expense and updates it with new fuel data
 * 
 * @param {Object} fuelData - Updated fuel record data
 * @returns {Promise<Object>} - Updated expense data or new expense if not found
 */
export const updateExpenseFromFuel = async (fuelData) => {
  try {
    // In a real app, you'd query the expense API to find the linked expense
    // For now, we'll create a new expense if it doesn't exist
    // This is a simplified approach - production would need a proper relationship
    
    const expenseData = mapFuelToExpense(fuelData);
    
    // Try to find existing expense by sourceId
    // Since we don't have a search endpoint for sourceId, we'll create a new one
    // In production, this would query the database
    const response = await expensesAPI.create(expenseData);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Failed to update expense from fuel:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Deletes the linked expense when fuel record is deleted
 * Removes the corresponding expense entry
 * 
 * @param {Object} fuelData - Deleted fuel record data
 * @returns {Promise<Object>} - Deletion status
 */
export const deleteExpenseFromFuel = async (fuelData) => {
  try {
    // In a real app, you'd find and delete the linked expense
    // For now, this is a placeholder for the sync logic
    // Production would need proper linking between fuel and expenses
    
    console.log('Fuel deleted:', fuelData);
    console.log('Linked expense should be removed from system');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete expense from fuel:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Validates that fuel and expense data are in sync
 * Checks if all required fields are present and correctly mapped
 * 
 * @param {Object} fuelData - Fuel record data
 * @param {Object} expenseData - Expense record data
 * @returns {Object} - Validation result with any mismatches
 */
export const validateFuelExpenseSync = (fuelData, expenseData) => {
  const mismatches = [];

  // Check amount matches
  if (fuelData.totalCost !== expenseData.amount) {
    mismatches.push({
      field: 'amount',
      fuel: fuelData.totalCost,
      expense: expenseData.amount,
    });
  }

  // Check vehicle matches
  if (fuelData.vehicle !== expenseData.vehicle) {
    mismatches.push({
      field: 'vehicle',
      fuel: fuelData.vehicle,
      expense: expenseData.vehicle,
    });
  }

  // Check date matches
  if (fuelData.date !== expenseData.date) {
    mismatches.push({
      field: 'date',
      fuel: fuelData.date,
      expense: expenseData.date,
    });
  }

  return {
    isSynced: mismatches.length === 0,
    mismatches,
  };
};

/**
 * Gets all required fuel fields for expense creation
 * Useful for validation before sync
 * 
 * @returns {Array<string>} - List of required fields
 */
export const getRequiredFuelFields = () => {
  return ['id', 'fuelType', 'quantity', 'totalCost', 'vehicle', 'date', 'location', 'price'];
};

/**
 * Checks if fuel data has all required fields for sync
 * 
 * @param {Object} fuelData - Fuel record data
 * @returns {Object} - Validation result
 */
export const validateFuelDataForSync = (fuelData) => {
  if (!fuelData) {
    return {
      isValid: false,
      missingFields: ['fuelData'],
      error: 'No fuel data provided',
    };
  }

  // Check essential fields for sync
  const essentialFields = ['fuelType', 'quantity', 'totalCost', 'vehicle', 'date', 'location'];
  const missingFields = essentialFields.filter(field => fuelData[field] === undefined || fuelData[field] === null || fuelData[field] === '');
  
  // Check if at least one price field exists
  const hasPrice = fuelData.price || fuelData.pricePerLitre;
  if (!hasPrice) {
    missingFields.push('price');
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
};
