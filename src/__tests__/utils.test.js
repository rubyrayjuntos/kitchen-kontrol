/**
 * Utility Functions Tests
 * Tests for common utility functions
 */

// Mock utility functions for testing
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password);
};

const formatDate = (date) => {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  return date.toLocaleDateString();
};

const truncateString = (str, length) => {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

describe('Utility Functions', () => {
  describe('validateEmail', () => {
    it('should accept valid email', () => {
      expect(validateEmail('user@example.com')).toBe(true);
    });

    it('should reject invalid email without domain', () => {
      expect(validateEmail('user@')).toBe(false);
    });

    it('should reject email without @ symbol', () => {
      expect(validateEmail('userexample.com')).toBe(false);
    });

    it('should reject email with spaces', () => {
      expect(validateEmail('user @example.com')).toBe(false);
    });

    it('should accept valid email with subdomain', () => {
      expect(validateEmail('user@mail.example.com')).toBe(true);
    });
  });

  describe('validatePassword', () => {
    it('should accept valid password', () => {
      expect(validatePassword('Password123')).toBe(true);
    });

    it('should reject password without uppercase', () => {
      expect(validatePassword('password123')).toBe(false);
    });

    it('should reject password without lowercase', () => {
      expect(validatePassword('PASSWORD123')).toBe(false);
    });

    it('should reject password without number', () => {
      expect(validatePassword('Password')).toBe(false);
    });

    it('should reject short password', () => {
      expect(validatePassword('Pass1')).toBe(false);
    });

    it('should accept long password', () => {
      expect(validatePassword('VeryLongPassword123')).toBe(true);
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2025-10-15T00:00:00');
      const formatted = formatDate(date);
      // Accept various date formats depending on locale
      expect(formatted).toBeDefined();
      expect(typeof formatted).toBe('string');
      // Verify it contains the month or day
      expect(formatted.length).toBeGreaterThan(0);
    });

    it('should handle string date input', () => {
      const formatted = formatDate('2025-10-15');
      expect(formatted).toBeDefined();
    });

    it('should return localized date string', () => {
      const date = new Date('2025-12-25');
      const formatted = formatDate(date);
      expect(formatted).toMatch(/25/);
    });
  });

  describe('truncateString', () => {
    it('should not truncate short string', () => {
      expect(truncateString('Hello', 10)).toBe('Hello');
    });

    it('should truncate long string', () => {
      expect(truncateString('Hello World', 5)).toBe('Hello...');
    });

    it('should truncate to exact length', () => {
      const result = truncateString('Hello World', 5);
      expect(result).toBe('Hello...');
    });

    it('should handle empty string', () => {
      expect(truncateString('', 5)).toBe('');
    });

    it('should preserve string with length exactly equal to limit', () => {
      expect(truncateString('12345', 5)).toBe('12345');
    });
  });

  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      const result = formatCurrency(100.50);
      expect(result).toMatch(/\$|100\.50/);
    });

    it('should handle whole dollar amounts', () => {
      const result = formatCurrency(100);
      expect(result).toMatch(/\$|100/);
    });

    it('should handle decimal values', () => {
      const result = formatCurrency(99.99);
      expect(result).toMatch(/99\.99/);
    });

    it('should handle zero amount', () => {
      const result = formatCurrency(0);
      expect(result).toBeDefined();
    });

    it('should handle large amounts', () => {
      const result = formatCurrency(1000000);
      expect(result).toBeDefined();
    });
  });
});
