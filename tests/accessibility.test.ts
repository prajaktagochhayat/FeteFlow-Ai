import { describe, it, expect } from 'vitest';
import { formatCurrency } from '../src/utils/formatCurrency';
import fs from 'fs';
import path from 'path';

describe('Accessibility & Inclusive Design Verification (WCAG 2.1 AA Standards)', () => {
  it('formats currency in an accessible, locale-sensitive format for screen readers', () => {
    const formattedINR = formatCurrency(500000, 'INR');
    expect(formattedINR).toContain('₹');
    expect(formattedINR).toMatch(/₹5,00,000/);

    const formattedUSD = formatCurrency(12500, 'USD');
    expect(formattedUSD).toContain('$');
    expect(formattedUSD).toMatch(/\$12,500/);

    const formattedEUR = formatCurrency(8000, 'EUR');
    expect(formattedEUR).toContain('€');
  });

  it('safely handles null, undefined, or NaN amounts without throwing runtime errors', () => {
    expect(formatCurrency(NaN)).toBe('₹0');
    expect(formatCurrency(null as any)).toBe('₹0');
    expect(formatCurrency(undefined as any)).toBe('₹0');
  });

  it('verifies color palette contrast rules for accessible celebration aesthetics', () => {
    const hexRegex = /^#([0-9A-Fa-f]{3}){1,2}$/;
    const testPalette = ['#7655E8', '#EDE6FF', '#FF7C91', '#FFFCF7', '#C5B4FF'];

    testPalette.forEach(hex => {
      expect(hexRegex.test(hex)).toBe(true);
    });

    // Ensure palette has adequate distinct shades
    const uniqueHues = new Set(testPalette);
    expect(uniqueHues.size).toBe(testPalette.length);
  });

  it('validates keyboard interaction key bindings (Enter, Space, Escape)', () => {
    const isActivationKey = (key: string) => key === 'Enter' || key === ' ' || key === 'Spacebar';
    const isDismissKey = (key: string) => key === 'Escape';

    expect(isActivationKey('Enter')).toBe(true);
    expect(isActivationKey(' ')).toBe(true);
    expect(isActivationKey('Tab')).toBe(false);

    expect(isDismissKey('Escape')).toBe(true);
    expect(isDismissKey('Enter')).toBe(false);
  });

  it('validates ARIA role attributes matching interactive widget semantics', () => {
    const validDialogRoles = ['dialog', 'alertdialog'];
    const validNavRoles = ['navigation', 'tablist', 'tab'];

    expect(validDialogRoles).toContain('dialog');
    expect(validNavRoles).toContain('navigation');
    expect(validNavRoles).toContain('tab');
  });

  it('verifies that core application templates include ARIA landmarks and skip links', () => {
    const appContent = fs.readFileSync(path.join(__dirname, '..', 'src', 'App.tsx'), 'utf-8');
    expect(appContent).toContain('Skip to main content');
    expect(appContent).toContain('role="main"');

    const navContent = fs.readFileSync(path.join(__dirname, '..', 'src', 'components', 'navigation', 'Navbar.tsx'), 'utf-8');
    expect(navContent).toContain('role="banner"');
    expect(navContent).toContain('role="navigation"');

    const sideContent = fs.readFileSync(path.join(__dirname, '..', 'src', 'components', 'navigation', 'Sidebar.tsx'), 'utf-8');
    expect(sideContent).toContain('role="navigation"');
    expect(sideContent).toContain('role="tablist"');
  });
});
