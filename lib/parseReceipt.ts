import { BillScanResult } from './api';

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Snack and Drinks': [
    'coffee', 'cafe', 'café', 'juice', 'tea', 'starbucks', 'costa', 'smoothie',
    'beverage', 'snack', 'biscuit', 'cookie', 'cappuccino', 'latte', 'espresso',
    'milkshake', 'frappe', 'cold brew', 'bubble tea',
  ],
  'Food': [
    'restaurant', 'kitchen', 'burger', 'pizza', 'shawarma', 'biryani', 'chicken',
    'grill', 'grills', 'dining', 'bakery', 'meal', 'rice', 'noodle', 'sushi',
    'kfc', 'mcdonalds', "mcdonald's", 'subway', 'diner', 'buffet', 'supermarket',
    'grocery', 'hypermarket', 'carrefour', 'lulu', 'spinneys', 'waitrose',
    'al baik', 'hardees', 'popeyes', 'dominos', 'pizza hut', 'food',
  ],
  'Transportation': [
    'taxi', 'uber', 'careem', 'cab', 'fuel', 'petrol', 'gas station',
    'parking', 'metro', 'bus', 'transport', 'toll', 'ride', 'adnoc',
  ],
  'Healthcare': [
    'pharmacy', 'hospital', 'clinic', 'doctor', 'medical', 'health',
    'medicine', 'drug', 'dental', 'optical', 'lab', 'chemist', 'aster',
  ],
  'Shopping': [
    'mall', 'boutique', 'fashion', 'clothes', 'clothing', 'electronics',
    'h&m', 'zara', 'ikea', 'apple store', 'retail', 'department store',
  ],
  'Utilities': [
    'electricity', 'water', 'dewa', 'telecom', 'internet', 'mobile',
    'etisalat', 'du telecom', 'utility', 'broadband', 'telecom',
  ],
  'Entertainment': [
    'cinema', 'movie', 'theatre', 'concert', 'game', 'vox cinema',
    'bowling', 'theme park', 'entertainment', 'netflix',
  ],
  'Education': [
    'school', 'university', 'college', 'course', 'books', 'stationery',
    'library', 'tuition', 'academy',
  ],
};

function extractTotal(lines: string[]): number {
  // Search from bottom up for a "total" keyword line with a number after it
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    if (/(?:grand\s*total|total\s*amount|net\s*total|amount\s*due|total\s*payable|total)/i.test(line)) {
      const nums = line.match(/([\d,]+\.?\d*)/g);
      if (nums) {
        const values = nums
          .map((n) => parseFloat(n.replace(/,/g, '')))
          .filter((n) => n > 0 && n < 999999);
        if (values.length > 0) return Math.max(...values);
      }
    }
  }

  // Fallback: largest decimal number (e.g. 42.50) in the entire receipt
  let max = 0;
  lines.forEach((line) => {
    const matches = line.match(/([\d,]+\.\d{2})/g);
    if (matches) {
      matches.forEach((m) => {
        const n = parseFloat(m.replace(/,/g, ''));
        if (n > max && n < 99999) max = n;
      });
    }
  });
  return max;
}

function extractDate(text: string): string | null {
  const patterns = [
    /(\d{4}[-\/]\d{2}[-\/]\d{2})/,
    /(\d{2}[-\/]\d{2}[-\/]\d{4})/,
    /(\d{1,2}[-\/]\d{1,2}[-\/]\d{2})(?!\d)/,
    /(\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{4})/i,
    /(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{1,2},?\s+\d{4}/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const parsed = new Date(match[0].replace(/[-\/]/g, '/'));
      if (!isNaN(parsed.getTime()) && parsed.getFullYear() > 2000) {
        return parsed.toISOString().split('T')[0];
      }
    }
  }
  return null;
}

function extractMerchant(lines: string[]): string {
  const candidates = lines
    .map((l) => l.trim())
    .filter(
      (l) =>
        l.length > 2 &&
        !/^[\d\s\-\/\.\,\:]+$/.test(l) &&
        !/(?:receipt|invoice|tax invoice|bill|thank you|welcome|cashier|order|table|vat|reg no)/i.test(l)
    );
  return candidates[0] || 'Unknown';
}

function extractItems(lines: string[]): string[] {
  const items: string[] = [];
  // Match lines ending with a price: "Burger  12.50" or "2x Fries   8.00"
  const pricePattern = /^(.+?)\s+([\d,]+\.\d{2})\s*$/;

  for (const line of lines) {
    const match = line.match(pricePattern);
    if (match) {
      const name = match[1].trim();
      if (
        name.length > 1 &&
        !/(?:total|tax|vat|subtotal|sub-total|discount|service\s*charge|delivery|tip|gratuity|balance|charges)/i.test(name)
      ) {
        items.push(name);
      }
    }
  }

  return items.slice(0, 10);
}

function detectCategory(text: string): string {
  const lower = text.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return category;
    }
  }
  return 'Other';
}

export function parseReceiptText(text: string): BillScanResult {
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);

  const merchant = extractMerchant(lines);
  const items = extractItems(lines);
  const totalAmount = extractTotal(lines);
  const category = detectCategory(text);
  const date = extractDate(text);
  const notes = items.length > 0 ? `${merchant} — ${items.join(', ')}` : merchant;

  return { merchant, items, totalAmount, category, date, notes };
}
