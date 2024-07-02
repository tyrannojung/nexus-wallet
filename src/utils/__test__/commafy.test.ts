import commafy from '../commafy';

describe('commafy function tests', () => {
  test('should format numbers with commas correctly', () => {
    expect(commafy(1234567)).toBe('1,234,567');
    expect(commafy(123)).toBe('123');
    expect(commafy(1000)).toBe('1,000');
    expect(commafy(987654321)).toBe('987,654,321');
  });

  test('should handle zero correctly', () => {
    expect(commafy(0)).toBe('0');
  });

  test('should handle negative numbers correctly', () => {
    expect(commafy(-123456)).toBe('-123,456');
    expect(commafy(-1000)).toBe('-1,000');
  });
});
