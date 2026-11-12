import test from 'node:test';
import assert from 'node:assert/strict';
import { summary } from './summary.mjs';
test('repeated identifiers appear once and order is stable', () => {
  assert.deepEqual(summary([
    { id: 'a', name: 'Apple', quantity: 1 },
    { id: 'a', name: 'Apple', quantity: 1 },
    { id: 'b', name: 'Banana', quantity: 1 }
  ]), { labels: ['Apple', 'Banana'], total: 2 });
});
