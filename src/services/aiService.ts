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
        // Step 1: Get aggregated data and prompt from the backend
        const response = await apiService.post('/ai/analyze-finance');
        const payload = response.data;
        
        if (!payload.success || !payload.data.prompt) {
            throw new Error('Failed to fetch prompt from backend');
        }

        const { summary, prompt } = payload.data;

        // Step 2: Send prompt directly to local Ollama from the browser
        let ollamaRes;
        try {
            ollamaRes = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'mistral',
                    prompt: prompt,
                    stream: false,
                    options: {
                        temperature: 0.1,
                        num_ctx: 4096
                    }
                })
            });
        } catch (error) {
            throw new Error(`Failed to contact local Ollama. Ensure Ollama is running and you started it with: OLLAMA_ORIGINS="*" ollama serve`);
        }

        if (!ollamaRes.ok) {
            throw new Error(`Ollama returned an error: ${ollamaRes.statusText}`);
        }

        const ollamaData = await ollamaRes.json();
        const aiResponseText = ollamaData.response;

        // Step 3: Parse AI response
        let insightsJson = { insights: [] };
        try {
            const cleanedResponse = aiResponseText.replace(/```json/g, '').replace(/```/g, '').trim();
            insightsJson = JSON.parse(cleanedResponse);
        } catch (error) {
            console.error("Failed to parse AI insights", error);
            throw new Error('Failed to parse JSON insights from local AI.');
        }

        return {
            success: true,
            data: {
                summary: summary,
                insights: insightsJson.insights
            }
        };
    }
};
