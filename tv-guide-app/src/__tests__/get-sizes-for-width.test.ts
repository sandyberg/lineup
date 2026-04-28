import { DESKTOP_SIZES, getSizesForWidth, TV_SIZES } from '@/lib/constants';

describe('getSizesForWidth', () => {
  it('returns mobile sizes for width < 600', () => {
    const sizes = getSizesForWidth(375);
    expect(sizes.cardWidth).toBe(260);
    expect(sizes.rowPadding).toBe(16);
    expect(sizes.sectionLabelSize).toBe(20);
  });

  it('returns mobile sizes at boundary (599)', () => {
    const sizes = getSizesForWidth(599);
    expect(sizes.cardWidth).toBe(260);
  });

  it('returns tablet sizes for width >= 600 and < 1024', () => {
    const sizes = getSizesForWidth(600);
    expect(sizes.cardWidth).toBe(300);
    expect(sizes.rowPadding).toBe(32);
    expect(sizes.sectionLabelSize).toBe(24);
  });

  it('returns tablet sizes at boundary (1023)', () => {
    const sizes = getSizesForWidth(1023);
    expect(sizes.cardWidth).toBe(300);
  });

  it('returns desktop sizes for width >= 1024 by default', () => {
    const sizes = getSizesForWidth(1024);
    expect(sizes).toEqual(DESKTOP_SIZES);
  });

  it('returns desktop sizes for typical desktop width (1920) by default', () => {
    const sizes = getSizesForWidth(1920);
    expect(sizes.cardWidth).toBe(340);
    expect(sizes.rowPadding).toBe(60);
    expect(sizes.sectionLabelSize).toBe(28);
  });

  it('returns TV sizes for typical TV width (1920) when TV layout is requested', () => {
    const sizes = getSizesForWidth(1920, true);
    expect(sizes.cardWidth).toBe(430);
    expect(sizes.rowPadding).toBe(72);
    expect(sizes.sectionLabelSize).toBe(38);
  });

  it('returns mobile sizes for very small width (320)', () => {
    const sizes = getSizesForWidth(320);
    expect(sizes.cardHeight).toBe(170);
    expect(sizes.cardGap).toBe(12);
  });

  it('returns desktop sizes for very large width by default', () => {
    const sizes = getSizesForWidth(3840);
    expect(sizes).toEqual(DESKTOP_SIZES);
  });

  it('returns TV sizes for very large width when TV layout is requested', () => {
    const sizes = getSizesForWidth(3840, true);
    expect(sizes).toEqual(TV_SIZES);
  });
});
