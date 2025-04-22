import { extractItemsFromOcr } from '../ocrExtract';
import { describe, it, expect } from 'vitest';

describe('extractItemsFromOcr', () => {
  it('should extract items from a basic receipt', () => {
    const RAW_OCR_EXAMPLE = `2:08 7 NUR 67\nX Continue Shopping\nNo Frills\nNo Frills 4\nListerine Cool Mint\n#85 Mouthwash (1L) 1 +\n$7.99\nLay's Flavor Snacks\n Chips Mix Variety\n8 Pack (28 gx 16 ct) 1+\n$9.99\nAtaulfo Mango\n$3.98 - 2 +\nMassibec Strawberries\n$4.99\nRobin Hood Organic\n Coconut Flour (500g) 1+\nWW Saving CA$9.17 with DashPass + Deals\n`;
    const EXPECTED = [
      'Listerine Cool Mint #85 Mouthwash (1L)',
      "Lay's Flavor Snacks Chips Mix Variety 8 Pack (28 gx 16 ct)",
      'Ataulfo Mango (2x)',
      'Massibec Strawberries',
      'Robin Hood Organic Coconut Flour (500g)',
    ];
    expect(extractItemsFromOcr(RAW_OCR_EXAMPLE)).toEqual(EXPECTED);
  });

  it('should remove all 1+ and 1 + markers', () => {
    const RAW_WITH_ONES = `Foo Bar 1+\n$1.99\nBaz 1 +\n$2.99\nQux\n$3.99 - 1+\n`;
    const EXPECTED_ONES = ['Foo Bar', 'Baz', 'Qux'];
    expect(extractItemsFromOcr(RAW_WITH_ONES)).toEqual(EXPECTED_ONES);
  });

  it('should extract multi-quantity inline markers', () => {
    const RAW_MULTI = `Big Bag Chips 3+\n$10.99\n`;
    const EXPECTED_MULTI = ['Big Bag Chips (3x)'];
    expect(extractItemsFromOcr(RAW_MULTI)).toEqual(EXPECTED_MULTI);
  });

  it('should extract multi-quantity from price line', () => {
    const RAW_MULTI_PRICE = `Choco Bar\n$2.99 - 4 +\n`;
    const EXPECTED_MULTI_PRICE = ['Choco Bar (4x)'];
    expect(extractItemsFromOcr(RAW_MULTI_PRICE)).toEqual(EXPECTED_MULTI_PRICE);
  });
});
