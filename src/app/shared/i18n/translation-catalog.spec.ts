import { describe, expect, it } from 'vitest';
import de from '../../../../public/i18n/de.json';
import en from '../../../../public/i18n/en.json';

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

function flatten(value: JsonValue, prefix = ''): Record<string, string> {
  if (typeof value === 'string') {
    return { [prefix]: value };
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return Object.entries(value).reduce<Record<string, string>>((acc, [key, child]) => {
    const childPrefix = prefix ? `${prefix}.${key}` : key;
    return { ...acc, ...flatten(child, childPrefix) };
  }, {});
}

function placeholders(value: string): string[] {
  return Array.from(value.matchAll(/{{\s*([A-Za-z0-9_]+)\s*}}/g))
    .map((match) => match[1])
    .sort();
}

describe('translation catalogs', () => {
  const deEntries = flatten(de);
  const enEntries = flatten(en);

  it('keeps German and English key trees in sync', () => {
    expect(Object.keys(enEntries).sort()).toEqual(Object.keys(deEntries).sort());
  });

  it('does not contain empty translations', () => {
    for (const [key, value] of Object.entries(deEntries)) {
      expect(value.trim(), `${key} in de.json`).not.toBe('');
    }

    for (const [key, value] of Object.entries(enEntries)) {
      expect(value.trim(), `${key} in en.json`).not.toBe('');
    }
  });

  it('keeps interpolation placeholders aligned across languages', () => {
    for (const key of Object.keys(deEntries)) {
      expect(placeholders(enEntries[key]), key).toEqual(placeholders(deEntries[key]));
    }
  });
});
