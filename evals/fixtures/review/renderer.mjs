export function render(status) {
  switch (status) {
    case 'pending': return 'Pending';
    case 'complete': return 'Complete';
    default: return 'Unknown';
  }
}
