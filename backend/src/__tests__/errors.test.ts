import { AppError, asyncHandler } from '../middleware/errorHandler';
import {
  validateRequired,
  validateEnum,
  validateUUID,
  validatePagination,
} from '../utils/validation';

describe('Error Handling', () => {
  describe('AppError', () => {
    test('AppError creates error with correct properties', () => {
      const error = new AppError(400, 'Test error', { field: 'value' });
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Test error');
      expect(error.details).toEqual({ field: 'value' });
    });

    test('AppError without details', () => {
      const error = new AppError(500, 'Server error');
      expect(error.statusCode).toBe(500);
      expect(error.details).toBeUndefined();
    });
  });

  describe('Validation Functions', () => {
    test('validateRequired throws AppError for missing fields', () => {
      expect(() => {
        validateRequired({ name: 'Test' }, ['name', 'category']);
      }).toThrow(AppError);
    });

    test('validateRequired passes when all fields present', () => {
      expect(() => {
        validateRequired({ name: 'Test', category: 'active' }, ['name', 'category']);
      }).not.toThrow();
    });

    test('validateEnum throws for invalid enum value', () => {
      expect(() => {
        validateEnum('invalid', ['active', 'inactive'], 'status');
      }).toThrow(AppError);
    });

    test('validateEnum passes for valid enum value', () => {
      expect(() => {
        validateEnum('active', ['active', 'inactive'], 'status');
      }).not.toThrow();
    });

    test('validateUUID throws for invalid UUID', () => {
      expect(() => {
        validateUUID('not-a-uuid');
      }).toThrow(AppError);
    });

    test('validateUUID passes for valid UUID', () => {
      expect(() => {
        validateUUID('550e8400-e29b-41d4-a716-446655440000');
      }).not.toThrow();
    });

    test('validateUUID accepts custom fieldName in error', () => {
      expect(() => {
        validateUUID('invalid', 'missionId');
      }).toThrow();
    });

    test('validatePagination returns defaults', () => {
      const result = validatePagination(undefined, undefined);
      expect(result.limit).toBe(10);
      expect(result.offset).toBe(0);
    });

    test('validatePagination parses provided values', () => {
      const result = validatePagination('50', '100');
      expect(result.limit).toBe(50);
      expect(result.offset).toBe(100);
    });

    test('validatePagination throws for limit > 100', () => {
      expect(() => {
        validatePagination('150', '0');
      }).toThrow(AppError);
    });

    test('validatePagination throws for limit < 1', () => {
      expect(() => {
        validatePagination('0', '0');
      }).toThrow(AppError);
    });

    test('validatePagination throws for negative offset', () => {
      expect(() => {
        validatePagination('10', '-1');
      }).toThrow(AppError);
    });
  });

  describe('asyncHandler', () => {
    test('asyncHandler wraps async function', () => {
      const mockFn = jest.fn().mockResolvedValue(undefined);
      const wrapped = asyncHandler(mockFn);
      
      const mockReq = {};
      const mockRes = {};
      const mockNext = jest.fn();

      wrapped(mockReq as any, mockRes as any, mockNext);
      expect(mockFn).toHaveBeenCalled();
    });

    test('asyncHandler catches errors and calls next', (done) => {
      const error = new Error('Test error');
      const mockFn = jest.fn().mockRejectedValue(error);
      const wrapped = asyncHandler(mockFn);
      
      const mockReq = {};
      const mockRes = {};
      const mockNext = jest.fn((err) => {
        expect(err).toBe(error);
        done();
      });

      wrapped(mockReq as any, mockRes as any, mockNext);
    });
  });
});
