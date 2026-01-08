import { expect, test } from 'vitest'
import { resolveTemplateCacheDir, toGigetSource } from '../src'

test('toGigetSource keeps explicit providers', () => {
  expect(toGigetSource('github:owner/repo')).toBe('github:owner/repo')
  expect(toGigetSource('https://example.com/owner/repo')).toBe('https://example.com/owner/repo')
})

test('toGigetSource prefixes github by default', () => {
  expect(toGigetSource('owner/repo')).toBe('github:owner/repo')
})

test('resolveTemplateCacheDir normalizes template name', () => {
  const resolved = resolveTemplateCacheDir('owner/repo')
  expect(resolved).toMatch(/\.picgo[\/\\]templates[\/\\]owner-repo$/)
})
