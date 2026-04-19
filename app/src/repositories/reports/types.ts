export interface MonthlyFinancialDataPoint {
  month: string;
  revenue: number;
  expenses: number;
}

export interface FinancialReportSummary {
  totalRevenue: number;
  pendingPayments: number;
  totalRooms: number;
  occupiedRooms: number;
  vacantRooms: number;
  monthlyData: MonthlyFinancialDataPoint[];
}
