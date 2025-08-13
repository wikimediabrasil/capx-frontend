import {
  getCapacityValidationErrorMessage,
  isCapacityValidationError,
  validateCapacitiesBeforeSave,
} from '@/lib/utils/capacityValidation';

describe('capacityValidation', () => {
  const mockPageContent = {
    'snackbar-capacity-validation-available-without-known':
      'Available capacities must be selected from your known capacities.',
    'snackbar-capacity-validation-conflict': 'There was a conflict with your capacity selections.',
    'snackbar-edit-profile-failed': 'Error updating profile.',
  };

  describe('validateCapacitiesBeforeSave', () => {
    it('should pass validation when no available capacities are provided', () => {
      const result = validateCapacitiesBeforeSave([1, 2, 3], [], mockPageContent);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.invalidAvailableCapacities).toHaveLength(0);
    });

    it('should pass validation when available capacities are subset of known capacities', () => {
      const result = validateCapacitiesBeforeSave([1, 2, 3, 4], [2, 3], mockPageContent);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.invalidAvailableCapacities).toHaveLength(0);
    });

    it('should fail validation when available capacity is not in known capacities', () => {
      const result = validateCapacitiesBeforeSave([1, 2], [2, 3], mockPageContent);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toBe(
        mockPageContent['snackbar-capacity-validation-available-without-known']
      );
      expect(result.invalidAvailableCapacities).toEqual([3]);
    });

    it('should identify multiple invalid available capacities', () => {
      const result = validateCapacitiesBeforeSave([1, 2], [3, 4, 5], mockPageContent);
      expect(result.isValid).toBe(false);
      expect(result.invalidAvailableCapacities).toEqual([3, 4, 5]);
    });

    it('should handle empty arrays', () => {
      const result = validateCapacitiesBeforeSave([], [], mockPageContent);
      expect(result.isValid).toBe(true);
    });

    it('should handle undefined/null arrays', () => {
      const result = validateCapacitiesBeforeSave(undefined as any, null as any, mockPageContent);
      expect(result.isValid).toBe(true);
    });
  });

  describe('isCapacityValidationError', () => {
    it('should identify 409 status code as capacity validation error', () => {
      const error = { response: { status: 409 } };
      expect(isCapacityValidationError(error)).toBe(true);
    });

    it('should identify capacity-related error messages', () => {
      const error = { message: 'Capacity conflict detected' };
      expect(isCapacityValidationError(error)).toBe(true);
    });

    it('should not identify other errors as capacity validation errors', () => {
      const error = { response: { status: 500 } };
      expect(isCapacityValidationError(error)).toBe(false);
    });
  });

  describe('getCapacityValidationErrorMessage', () => {
    it('should return capacity validation message for 409 error', () => {
      const error = { response: { status: 409 } };
      const message = getCapacityValidationErrorMessage(error, mockPageContent);
      expect(message).toBe(mockPageContent['snackbar-capacity-validation-conflict']);
    });

    it('should return generic error message for non-capacity errors', () => {
      const error = { response: { status: 500 } };
      const message = getCapacityValidationErrorMessage(error, mockPageContent);
      expect(message).toBe(mockPageContent['snackbar-edit-profile-failed']);
    });
  });
});
