import { deliver } from './worker.mjs';
const mode = process.argv[2];
if (!['happy', 'duplicate', 'partial', 'cancel', 'dependency'].includes(mode)) {
  console.error('Use happy|duplicate|partial|cancel|dependency'); process.exit(2);
}
const state = { credits: 0, completed: [] };
const event = { id: 'event-1', amount: 10 };
const outcomes = [];
function attempt(options) {
  try { outcomes.push(deliver(state, event, options)); }
  catch (error) { outcomes.push(error.message); }
}
attempt({ failAfterEffect: mode === 'partial', cancel: mode === 'cancel', available: mode !== 'dependency' });
if (['duplicate', 'partial'].includes(mode)) attempt({});
console.log(JSON.stringify({ mode, outcomes, state }));
