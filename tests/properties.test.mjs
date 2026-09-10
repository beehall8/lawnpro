import { test } from 'node:test'
import assert from 'node:assert/strict'
import express from '../src/backend/node_modules/express/index.js'
import properties from '../src/backend/src/routes/properties.js'

test('property API rejects fabricated AI estimates and preserves manual provenance', async () => {
  const app = express()
  app.use(express.json())
  app.use('/properties', properties)
  const server = app.listen(0, '127.0.0.1')
  await new Promise(resolve => server.once('listening', resolve))
  const url = `http://127.0.0.1:${server.address().port}/properties`
  const address = { street: '123 Main St', city: 'Stone Mountain', state: 'GA', zip: '30083' }
  const post = (path, data) => fetch(url + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
  try {
    for (const path of ['', '/estimate']) {
      const response = await post(path, { ...address, requestEstimate: true })
      assert.equal(response.status, 503)
      const body = await response.json()
      assert.equal(body.code, 'ESTIMATION_UNAVAILABLE')
      assert.equal(body.data, undefined)
    }
    const manual = await post('', { ...address, lawnSqFt: 2500 })
    assert.equal(manual.status, 201)
    const { data } = await manual.json()
    assert.equal(data.lawnSqFt, 2500)
    assert.equal(data.estimatedLawnSqFt, null)
    assert.equal(data.latitude, null)
    assert.equal(data.measurementSource, 'customer')
    assert.equal(data.verificationStatus, 'unverified')
    const unknown = await post('', address)
    assert.equal((await unknown.json()).data.measurementSource, 'unknown')
    for (const change of [{ zip: '30015' }, { zip: '30303' }, { state: 'TX' }, { lawnSqFt: -1 }]) assert.equal((await post('', { ...address, ...change })).status, 400)
    assert.equal((await post('/estimate', { ...address, zip: '30086' })).status, 400)
  } finally {
    await new Promise(resolve => server.close(resolve))
  }
})
