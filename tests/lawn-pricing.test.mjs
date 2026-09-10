import { test } from 'node:test'
import assert from 'node:assert/strict'
import { lawnSizes, estimateRange, formatRange } from '../src/shared/lawn-sizes.mjs'
test('mowing tiers preserve requested price ranges', () => {
  for (const size of lawnSizes) assert.deepEqual(estimateRange([{ id: 'mowing', price: 35 }], size), { min: size.min, max: size.max, openEnded: !!size.openEnded })
})
test('mixed services, frequency discount and fee apply to both endpoints', () => {
  const range = estimateRange([{ id: 'mowing', price: 35 }, { id: 'trimming', price: 25 }], lawnSizes[1], 0.9)
  assert.equal(range.min, 81)
  assert.equal(range.max, 108)
  assert.equal(formatRange(range, 1.2), '$97.20–$129.60')
})
test('XL remains open ended and other services are unaffected', () => {
  assert.equal(formatRange(estimateRange([{ id: 'mowing', price: 35 }], lawnSizes[3])), '$150.00–$300.00+')
  assert.equal(formatRange(estimateRange([{ id: 'trimming', price: 25 }], lawnSizes[3])), '$25.00')
  assert.equal(formatRange(estimateRange([], lawnSizes[3])), '$0.00')
})
