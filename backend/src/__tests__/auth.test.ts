import { generateToken, verifyToken, extractTokenFromHeader } from '../utils/jwt';

describe('Authentication', () => {
  describe('JWT Utilities', () => {
    test('generateToken creates valid JWT', () => {
      const token = generateToken('kepler', 'Kepler');
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT format: header.payload.signature
    });

    test('verifyToken decodes token correctly', () => {
      const token = generateToken('kepler', 'Kepler');
      const decoded = verifyToken(token);
      expect(decoded.agentId).toBe('kepler');
      expect(decoded.agentName).toBe('Kepler');
    });

    test('verifyToken throws on invalid token', () => {
      expect(() => {
        verifyToken('invalid-token');
      }).toThrow('Invalid or expired token');
    });

    test('verifyToken throws on malformed token', () => {
      expect(() => {
        verifyToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature');
      }).toThrow('Invalid or expired token');
    });

    test('extractTokenFromHeader extracts Bearer token correctly', () => {
      const token = generateToken('kepler', 'Kepler');
      const authHeader = `Bearer ${token}`;
      const extracted = extractTokenFromHeader(authHeader);
      expect(extracted).toBe(token);
    });

    test('extractTokenFromHeader returns null for missing header', () => {
      const extracted = extractTokenFromHeader(undefined);
      expect(extracted).toBeNull();
    });

    test('extractTokenFromHeader returns null for missing Bearer prefix', () => {
      const token = generateToken('kepler', 'Kepler');
      const extracted = extractTokenFromHeader(token);
      expect(extracted).toBeNull();
    });

    test('extractTokenFromHeader returns null for invalid format', () => {
      const extracted = extractTokenFromHeader('InvalidFormat token');
      expect(extracted).toBeNull();
    });

    test('extractTokenFromHeader returns null for multiple spaces', () => {
      const token = generateToken('kepler', 'Kepler');
      const extracted = extractTokenFromHeader(`Bearer ${token} extra`);
      expect(extracted).toBeNull();
    });

    test('token expiry is set to 24h', () => {
      const token = generateToken('test-agent', 'TestAgent');
      const decoded = verifyToken(token) as any;
      expect(decoded).toHaveProperty('iat');
      expect(decoded).toHaveProperty('exp');
      // exp should be approximately 24 hours after iat (86400 seconds)
      const expiryDiff = decoded.exp - decoded.iat;
      expect(expiryDiff).toBeGreaterThan(86300); // Allow 100 second tolerance
      expect(expiryDiff).toBeLessThan(86500); // Allow 100 second tolerance
    });

    test('different agents get different tokens', () => {
      const token1 = generateToken('agent1', 'Agent1');
      const token2 = generateToken('agent2', 'Agent2');
      expect(token1).not.toBe(token2);
    });

    test('same agent id/name produces deterministic token structure', () => {
      const token1 = generateToken('kepler', 'Kepler');
      const token2 = generateToken('kepler', 'Kepler');
      const decoded1 = verifyToken(token1);
      const decoded2 = verifyToken(token2);
      expect(decoded1.agentId).toBe(decoded2.agentId);
      expect(decoded1.agentName).toBe(decoded2.agentName);
    });
  });
});
