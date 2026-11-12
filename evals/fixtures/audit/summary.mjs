import { pathToFileURL } from 'node:url';
export function render(items) {
  return { labels: items.map(item => item.name), total: items.length };
}
export function summary(items) {
  const unique = [...new Map(items.map(item => [item.id, item])).values()];
  return render(unique);
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(JSON.stringify(summary([{ id: 'a', name: 'Apple', quantity: 3 }])));
}
