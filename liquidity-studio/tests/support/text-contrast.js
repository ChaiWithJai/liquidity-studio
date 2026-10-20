import {expect} from '@playwright/test';

// Measure rendered text against its actual opaque ancestor background, not token literals.
export async function expectSmallTextContrast(locator) {
  const ratios = await locator.evaluateAll(elements => {
    const rgb = value => value.match(/[\d.]+/g).map(Number);
    const luminance = channels => channels.slice(0, 3).map(c => c / 255).map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4).reduce((sum, c, i) => sum + c * [.2126, .7152, .0722][i], 0);
    return elements.map(element => {
      const foreground = rgb(getComputedStyle(element).color);
      if (foreground.length > 3 && foreground[3] !== 1) throw new Error('Translucent text requires explicit compositing');
      for (let ancestor = element; ancestor; ancestor = ancestor.parentElement) {
        if (Number(getComputedStyle(ancestor).opacity) !== 1) throw new Error('Ancestor opacity requires explicit compositing');
      }
      let background;
      for (let ancestor = element; ancestor; ancestor = ancestor.parentElement) {
        const candidate = rgb(getComputedStyle(ancestor).backgroundColor);
        if (candidate.length === 3 || candidate[3] === 1) { background = candidate; break; }
        if (candidate[3] !== 0) throw new Error('Translucent background requires explicit compositing');
      }
      if (!background) throw new Error('No opaque background found');
      const values = [luminance(foreground), luminance(background)].sort((a, b) => a - b);
      return (values[1] + .05) / (values[0] + .05);
    });
  });
  expect(ratios.length).toBeGreaterThan(0);
  for (const ratio of ratios) expect(ratio).toBeGreaterThanOrEqual(4.5);
}
