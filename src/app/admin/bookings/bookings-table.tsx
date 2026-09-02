"use client";

import React from 'react';
import { DataTable } from '@/components/shared/data-table';
import { Badge } from '@/components/ui/badge';
import { getStatusColor } from '@/lib/utils';

export function BookingsTable({ data }: { data: any[] }) {
  const columns = [
    {
      header: 'Booking ID',
      accessorKey: 'id',
      cell: (row: any) => <span className="font-mono text-xs font-semibold text-gray-700">#{row.id.slice(0, 10)}</span>,
    },
    {
      header: 'Customer',
      accessorKey: 'customer',
      cell: (row: any) => <span className="font-medium text-gray-900">{row.customer}</span>,
    },
    {
      header: 'Assigned Worker',
      accessorKey: 'worker',
      cell: (row: any) => <span className="text-gray-700">{row.worker}</span>,
    },
    {
      header: 'Service Category',
      accessorKey: 'category',
      cell: (row: any) => <Badge variant="outline" className="bg-gray-50">{row.category}</Badge>,
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row: any) => (
        <Badge className={getStatusColor(row.status)}>
          {row.status.replace(/_/g, ' ')}
        </Badge>
      ),
    },
    {
      header: 'Booking Date',
      accessorKey: 'date',
    },
    {
      header: 'Amount',
      accessorKey: 'amount',
      cell: (row: any) => <span className="font-bold text-gray-900">{row.amount}</span>,
    },
  ];

  return (
    <DataTable data={data} columns={columns} searchable={true} searchKey="id" filterable={true} />
  );
}
