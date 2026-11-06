export function createStore(serverVersion, config) {
  const rows = new Map();
  return {
    put(key, value, options, now) {
      const duration = options.leaseMs ?? (serverVersion >= 2 ? options.leaseSeconds * 1000 : undefined);
      const deadline = config.leaseEnabled && Number.isFinite(duration) ? now + duration : null;
      rows.set(key, { value, deadline });
      return { ok: true };
    },
    read(key, now) {
      const row = rows.get(key);
      if (row && row.deadline !== null && now >= row.deadline) rows.delete(key);
      return rows.get(key) ?? null;
    }
  };
}
export function storeTemporaryItem(store, now) {
  return store.put('temporary', 'payload', { leaseSeconds: 2 }, now);
}
