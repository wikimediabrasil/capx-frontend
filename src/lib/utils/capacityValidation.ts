/**
 * Capacity validation utilities for profile forms
 * Handles business logic validation between different capacity types
 */

export interface CapacityValidationResult {
  isValid: boolean;
  errors: string[];
  invalidAvailableCapacities: number[];
}

/**
 * Validates that all available capacities are also present in known capacities
 * @param knownCapacities - Array of known capacity IDs
 * @param availableCapacities - Array of available capacity IDs
 * @param pageContent - Localization content object
 * @returns Validation result with errors if any
 */
export function validateCapacitiesBeforeSave(
  knownCapacities: number[] = [],
  availableCapacities: number[] = [],
  pageContent: Record<string, string> = {}
): CapacityValidationResult {
  const result: CapacityValidationResult = {
    isValid: true,
    errors: [],
    invalidAvailableCapacities: [],
  };

  // If no available capacities, validation passes
  if (!availableCapacities || availableCapacities.length === 0) {
    return result;
  }

  // Check each available capacity is in known capacities
  const knownCapacitiesSet = new Set(knownCapacities || []);
  const invalidAvailable = availableCapacities.filter(
    capacityId => !knownCapacitiesSet.has(capacityId)
  );

  if (invalidAvailable.length > 0) {
    result.isValid = false;
    result.invalidAvailableCapacities = invalidAvailable;

    // Create error message
    const errorMessage =
      pageContent['snackbar-capacity-validation-available-without-known'] ||
      'Available capacities must be selected from your known capacities. Please add the capacity to your known skills first.';

    result.errors.push(errorMessage);
  }

  return result;
}

/**
 * Checks if a specific error is a capacity validation conflict (409)
 * @param error - The error object to check
 * @returns true if this is a capacity validation conflict
 */
export function isCapacityValidationError(error: any): boolean {
  // Check for 409 status code or specific error messages
  if (error?.response?.status === 409) {
    return true;
  }

  // Check for specific error messages that indicate capacity validation issues
  const errorMessage = error?.response?.data?.message || error?.message || '';
  const validationKeywords = ['capacity', 'available', 'known', 'skills', 'conflict'];

  return validationKeywords.some(keyword => errorMessage.toLowerCase().includes(keyword));
}

/**
 * Extracts a user-friendly error message from a capacity validation error
 * @param error - The error object
 * @param pageContent - Localization content object
 * @returns User-friendly error message
 */
export function getCapacityValidationErrorMessage(
  error: any,
  pageContent: Record<string, string> = {}
): string {
  // Check if we have a specific capacity validation error message
  if (isCapacityValidationError(error)) {
    return (
      pageContent['snackbar-capacity-validation-conflict'] ||
      'There was a conflict with your capacity selections. Please ensure all available capacities are also marked as known capacities.'
    );
  }

  // Fall back to generic error message
  return pageContent['snackbar-edit-profile-failed'] || 'Error updating profile. Please try again.';
}
