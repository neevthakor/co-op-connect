import "server-only";

// Force IPv4 resolution to prevent Supabase IPv6 timeout issues (P1001)
// We apply this exclusively in the Node.js server environment.
if (typeof process !== 'undefined') {
  try {
    // We use a dynamic require or standard import based on environment,
    // but since this file is marked "server-only", Node `dns` is safe here.
    const dns = require('dns');
    if (typeof dns.setDefaultResultOrder === 'function') {
      dns.setDefaultResultOrder('ipv4first');
    }
  } catch (e) {
    // Ignore if running in an edge environment without Node APIs
  }
}
