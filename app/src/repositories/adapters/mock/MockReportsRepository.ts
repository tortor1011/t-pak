import { err, ok, type Result } from '@/repositories/common/Result';
import type { ReportsRepository } from '@/repositories/reports/ReportsRepository';
import type { FinancialReportSummary } from '@/repositories/reports/types';
import { MOCK_FINANCIAL } from '@/services/mockData';

export class MockReportsRepository implements ReportsRepository {
  loadFinancialSummary(): Result<FinancialReportSummary> {
    try {
      return ok({
        ...MOCK_FINANCIAL,
        monthlyData: MOCK_FINANCIAL.monthlyData.map((item) => ({ ...item })),
      });
    } catch (error) {
      return err({
        code: 'UNKNOWN_ERROR',
        message: 'Failed to load financial summary.',
        details: error,
      });
    }
  }
}
