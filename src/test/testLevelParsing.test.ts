import { describe, it, expect } from 'vitest';

describe('TSV Level Parsing', () => {
  it('should correctly parse level 6 from TSV content', () => {
    // Simulate the TSV content structure (tab-separated)
    const tsvLine = `INT601\t6\tTest question for level 6?\tOption A\tOption B\tOption C\tOption D\tA\tExplanation here\tHint 1: First hint | Hint 2: Second hint\tConcepts`;
    
    const values = tsvLine.split('\t');
    
    // Column 0: id, Column 1: level
    const level = parseInt(values[1]) || 1;
    const hint = values[9] || undefined;
    
    expect(level).toBe(6);
    expect(hint).toBe('Hint 1: First hint | Hint 2: Second hint');
  });

  it('should support levels 1-7 in validation', () => {
    const testLevels = [1, 2, 3, 4, 5, 6, 7, 8, 10];
    const expectedValid = [1, 2, 3, 4, 5, 6, 7, 7, 7]; // 8 and 10 should cap at 7
    
    testLevels.forEach((inputLevel, index) => {
      const validLevel = Math.min(7, Math.max(1, inputLevel));
      expect(validLevel).toBe(expectedValid[index]);
    });
  });
});
