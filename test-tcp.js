const net = require('net');
const dns = require('dns');

const host = 'aws-0-ap-northeast-1.pooler.supabase.com';
const ports = [6543, 5432];

console.log('Testing DNS...');
dns.lookup(host, (err, address, family) => {
  if (err) {
    console.error('DNS Lookup failed:', err.message);
    return;
  }
  console.log(`DNS Resolved: ${address} (IPv${family})`);

  ports.forEach(port => {
    console.log(`Testing TCP connection to ${host}:${port}...`);
    const socket = new net.Socket();
    socket.setTimeout(5000);

    const start = Date.now();
    socket.connect(port, host, () => {
      console.log(`TCP Port ${port}: SUCCESS (${Date.now() - start}ms)`);
      socket.destroy();
    });

    socket.on('timeout', () => {
      console.log(`TCP Port ${port}: TIMEOUT`);
      socket.destroy();
    });

    socket.on('error', (err) => {
      console.log(`TCP Port ${port}: ERROR - ${err.message}`);
    });
  });
});
