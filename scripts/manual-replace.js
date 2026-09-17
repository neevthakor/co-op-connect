const fs = require('fs');

const replacements = [
  {
    file: 'src/app/admin/bookings/bookings-table.tsx',
    rules: [
      { from: '{ data: any[] }', to: '{ data: Record<string, string | number | boolean>[] }' },
      { from: '(row: any)', to: '(row: Record<string, string | number | boolean>)' },
      { from: 'row.id.slice(0, 10)', to: 'String(row.id).slice(0, 10)' },
      { from: 'row.status.replace', to: 'String(row.status).replace' },
      { from: 'getStatusColor(row.status)', to: 'getStatusColor(String(row.status))' }
    ]
  },
  {
    file: 'src/app/admin/capacity/page.tsx',
    rules: [
      { from: 'useState<any>(null)', to: 'useState<Record<string, any>>(null)' }, // Wait, still uses any
      { from: '[trade, stats]: [string, any]', to: '[trade, stats]: [string, Record<string, number>]' }
    ]
  }
];

// wait, replacing with Record<string, any> triggers eslint.
