// Source evidence only; this fixture does not render a browser viewer.
export function openViewer(fileId) {
  return { route: `/viewer/${encodeURIComponent(fileId)}`, policyOwner: 'viewer' };
}
