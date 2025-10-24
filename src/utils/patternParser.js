/**
 * Parse Strudel-inspired pattern syntax
 * For drums: "k s k s" (k=kick, s=snare, h=hihat, -=rest)
 * For notes: "c4 e4 g4" or "c4 e4 g4 | d4 f4 a4" for multiple bars
 */
export const parseStrudelPattern = (pattern, type) => {
  const bars = pattern.split('|').map(bar => bar.trim());
  return bars.map(bar => {
    const items = bar.split(/\s+/).filter(n => n);
    return items.length > 0 ? items : null;
  });
};

/**
 * Validate a pattern based on its type
 */
export const validatePattern = (pattern, type) => {
  const errors = [];

  if (!pattern || pattern.trim() === '') {
    return { valid: true, errors: [] };
  }

  const bars = pattern.split('|');

  bars.forEach((bar, barIndex) => {
    const items = bar.trim().split(/\s+/).filter(n => n);

    items.forEach((item, itemIndex) => {
      if (type === 'drums') {
        // Validate drum notation
        if (!['k', 's', 'h', '-'].includes(item.toLowerCase())) {
          errors.push(`Bar ${barIndex + 1}, item ${itemIndex + 1}: Invalid drum notation "${item}". Use k, s, h, or -`);
        }
      } else {
        // Validate note notation (e.g., c4, d#5, -)
        if (item !== '-' && !/^[a-g]#?\d+$/i.test(item)) {
          errors.push(`Bar ${barIndex + 1}, item ${itemIndex + 1}: Invalid note "${item}". Use format like c4, d#5, etc.`);
        }
      }
    });
  });

  return {
    valid: errors.length === 0,
    errors
  };
};
