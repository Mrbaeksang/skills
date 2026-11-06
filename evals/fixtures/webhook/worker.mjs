export function deliver(state, event, { failAfterEffect = false, cancel = false, available = true } = {}) {
  if (cancel) return 'cancelled';
  if (!available) throw new Error('dependency unavailable');
  if (state.completed.includes(event.id)) return 'duplicate';
  state.credits += event.amount;
  if (failAfterEffect) throw new Error('interrupted');
  state.completed.push(event.id);
  return 'completed';
}
