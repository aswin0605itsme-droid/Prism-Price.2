
/**
 * Utility functions for comparing product specifications.
 */

// Helper to extract numeric value from string (e.g., "5000 mAh" -> 5000)
const extractNumber = (val: string | number): number => {
  if (typeof val === 'number') return val;
  const match = val.match(/(\d+(\.\d+)?)/);
  return match ? parseFloat(match[0]) : 0;
};

// Heuristic to check if 'Lower is Better' for a specific key
const isLowerBetter = (key: string): boolean => {
  const lowerBetterKeys = ['weight', 'price', 'thickness', 'response time', 'latency'];
  return lowerBetterKeys.some(k => key.toLowerCase().includes(k));
};

/**
 * Determines which values in a list are the "best" based on the spec key.
 * Returns an array of booleans corresponding to the input values.
 */
export const identifyWinners = (key: string, values: (string | number | undefined)[]): boolean[] => {
  // Filter out undefined or non-comparable values
  const validIndices = values.map((v, i) => ({ val: v, index: i })).filter(item => item.val !== undefined && item.val !== '-');
  
  if (validIndices.length === 0) return values.map(() => false);

  const numericValues = validIndices.map(item => ({
    ...item,
    num: extractNumber(item.val!)
  }));

  // Check if we are comparing numbers
  const hasNumbers = numericValues.some(item => item.num > 0);

  if (hasNumbers) {
    // Numeric Comparison
    const nums = numericValues.map(i => i.num);
    const bestVal = isLowerBetter(key) ? Math.min(...nums) : Math.max(...nums);
    
    // Allow for small margin of error or ties
    return values.map((v) => {
        if (!v || v === '-') return false;
        return extractNumber(v) === bestVal;
    });
  } else {
    // Boolean/String Heuristics (e.g. "Yes" vs "No")
    // If one is "Yes" and others "No", highlight "Yes"
    const yesIndices = values.map(v => typeof v === 'string' && ['yes', 'true', 'amoled', 'oled', '5g'].includes(v.toLowerCase()));
    if (yesIndices.some(Boolean)) return yesIndices;
    
    return values.map(() => false);
  }
};
