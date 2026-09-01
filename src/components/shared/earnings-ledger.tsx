import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, TrendingUp, IndianRupee } from "lucide-react";

interface Earning {
  id: string;
  date: string | Date;
  description: string;
  gross: number;
  deductions: {
    cooperative: number;
    welfare: number;
  };
  net: number;
}

interface EarningsLedgerProps {
  earnings: Earning[];
  period: string;
  totals: {
    gross: number;
    cooperative: number;
    welfare: number;
    net: number;
  };
  className?: string;
}

export function EarningsLedger({ earnings, period, totals, className }: EarningsLedgerProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <span className="text-sm font-medium text-muted-foreground mb-1">Gross Earnings</span>
            <span className="text-2xl font-bold">{formatCurrency(totals.gross)}</span>
          </CardContent>
        </Card>
        <Card className="bg-muted/30">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <span className="text-sm font-medium text-muted-foreground flex items-center gap-1 mb-1">
              Co-op Fee (5%)
            </span>
            <span className="text-lg font-semibold text-destructive">-{formatCurrency(totals.cooperative)}</span>
          </CardContent>
        </Card>
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <span className="text-sm font-medium text-muted-foreground flex items-center gap-1 mb-1">
              <Shield className="h-3 w-3 text-primary" /> Welfare Fund (2%)
            </span>
            <span className="text-lg font-semibold text-primary">-{formatCurrency(totals.welfare)}</span>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <span className="text-sm font-medium text-green-700 dark:text-green-400 mb-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Net Take-Home
            </span>
            <span className="text-2xl font-bold text-green-700 dark:text-green-400">{formatCurrency(totals.net)}</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Transaction Ledger</span>
            <span className="text-sm font-normal text-muted-foreground">{period}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Gross</TableHead>
                  <TableHead className="text-right hidden sm:table-cell">Deductions</TableHead>
                  <TableHead className="text-right font-bold">Net</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {earnings.map((earning) => (
                  <TableRow key={earning.id}>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(new Date(earning.date))}
                    </TableCell>
                    <TableCell className="font-medium text-sm">
                      {earning.description}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(earning.gross)}</TableCell>
                    <TableCell className="text-right hidden sm:table-cell text-xs text-muted-foreground">
                      - {formatCurrency(earning.deductions.cooperative + earning.deductions.welfare)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(earning.net)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
