export const items = [{ id: 'a', name: 'Apple' }, { id: 'b', name: 'Banana' }];
export function find(id) {
  const item = items.find(item => item.id === id);
  if (!item) throw Object.assign(new Error('Item not found'), { code: 'NOT_FOUND' });
  return item;
}
