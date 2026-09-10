import { test } from 'node:test'
import assert from 'node:assert/strict'
import { launchZips, validateAddress, validLawnSize } from '../src/shared/lawn-estimation.mjs'
const address = { street: '123 Main Street', city: 'Stone Mountain', state: 'GA', zip: '30083' }
test('all launch ZIPs and ZIP+4 accepted', () => {
  for (const zip of launchZips) assert.equal(validateAddress({ ...address, zip }), '')
  assert.equal(validateAddress({ ...address, zip: '30083-1234', state: 'Georgia' }), '')
})
test('rejects incomplete, out-of-area and PO Box addresses', () => {
  for (const change of [{ city: ' ' }, { street: 'PO Box 12' }, { street: 'P.O. Box 12' }, { zip: '30015' }, { zip: '30086-1234' }, { zip: '30303' }, { state: 'TX' }, { zip: '30083oops' }]) assert.ok(validateAddress({ ...address, ...change }))
})
test('manual measurements must be positive finite values within supported limit', () => {
  for (const size of ['', ' ', 0, -1, Infinity, NaN, 'abc', 1000001]) assert.equal(validLawnSize(size), false)
  for (const size of [1, '2500', 43560, 1000000, 25.5]) assert.equal(validLawnSize(size), true)
})
