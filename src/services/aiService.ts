import { apiService } from './apiService';

export interface AIInsight {
    type: 'warning' | 'positive' | 'suggestion';
    title: string;
    message: string;
}

export interface FinancialSummaryData {
    totalExpenses: number;
    totalIncome: number;
    savingsRate: number;
    highestSpendingCategory: string;
    highestSpendingAmount: number;
    monthOverMonthChangePercentage: number;
    unusualSpikes: string[];
    potentialRecurringExpenses: string[];
    categoryTotals: Record<string, number>;
}

export interface AIAnalysisResponse {
    success: boolean;
    data: {
        summary: FinancialSummaryData;
        insights: AIInsight[];
    };
    error?: string;
}

export const aiService = {
    analyzeFinance: async (): Promise<AIAnalysisResponse> => {
        const response = await apiService.post('/ai/analyze-finance');
        return response.data;
    }
};
