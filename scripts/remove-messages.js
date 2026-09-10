const fs = require('fs');

function removeMessages(path, route) {
  let data = fs.readFileSync(path, 'utf8');
  // Match objects like: { href: "/customer/messages", label: "Messages", icon: MessageSquare },
  const regex = new RegExp(`\\{\\s*href:\\s*"${route}".*?\\},?\\s*`, 'g');
  data = data.replace(regex, '');
  fs.writeFileSync(path, data);
}

removeMessages('src/app/customer/layout.tsx', '/customer/messages');
removeMessages('src/app/worker/layout.tsx', '/worker/messages');
