import type { Result } from '@/repositories/common/Result';
import type { FinancialReportSummary } from '@/repositories/reports/types';

export interface ReportsRepository {
  loadFinancialSummary(): Result<FinancialReportSummary>;
}
