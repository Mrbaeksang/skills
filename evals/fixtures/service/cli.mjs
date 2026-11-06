import { items, find } from './catalog.mjs';
import { errorResponse } from './errors.mjs';
try {
  const [action, id] = process.argv.slice(2);
  if (action === 'list') console.log(JSON.stringify(items));
  else if (action === 'get') console.log(JSON.stringify(find(id)));
  else throw Object.assign(new Error('Unknown command'), { code: 'BAD_INPUT' });
} catch (error) {
  console.error(JSON.stringify(errorResponse(error)));
  process.exitCode = 2;
}
