import fs from 'node:fs';
import { createStore, storeTemporaryItem } from './runtime.mjs';
const versions = JSON.parse(fs.readFileSync(new URL('./versions.json', import.meta.url)));
const profile = versions.profiles[process.argv[2]];
if (!profile) throw new Error('Choose supported, legacy, override or unavailable');
if (profile.deployedServer === null) {
  console.log(JSON.stringify({ error: 'service unavailable', observedServer: null, effect: 'unobserved' }));
  process.exitCode = 2;
} else {
  const config = { ...versions.defaults, ...profile.override };
  const store = createStore(profile.deployedServer, config);
  const ack = storeTemporaryItem(store, 0);
  console.log(JSON.stringify({ declaredClient: versions.declaredClient, resolvedClient: versions.resolvedClient,
    configuredServer: config.serverVersion, observedServer: profile.deployedServer,
    effectiveLeaseEnabled: config.leaseEnabled, ack,
    beforeDeadline: store.read('temporary', 1000), afterDeadline: store.read('temporary', 3000) }));
}
