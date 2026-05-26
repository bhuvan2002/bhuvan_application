import { Heading, Box, HStack, Divider, VStack, useToast } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import AccountList from '../components/AccountList';
import ExpenseList from '../components/ExpenseList';
import AddAccountForm from '../components/AddAccountForm';
import AddExpenseForm from '../components/AddExpenseForm';
import BulkExpenseForm from '../components/BulkExpenseForm';
import AIAnalyzeButton from '../components/ai/AIAnalyzeButton';
import LoadingInsights from '../components/ai/LoadingInsights';
import AIInsightsPanel from '../components/ai/AIInsightsPanel';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { aiService, type AIAnalysisResponse } from '../services/aiService';

const Accounts = () => {
    const { user } = useAuth();
    const { fetchAccounts, fetchExpenses } = useData();
    const isTrader = user?.role === 'TRADER';
    const toast = useToast();

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiData, setAiData] = useState<AIAnalysisResponse['data'] | null>(null);

    useEffect(() => {
        fetchAccounts();
        fetchExpenses();
    }, []);

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        setAiData(null);
        try {
            const result = await aiService.analyzeFinance();
            if (result.success) {
                setAiData(result.data);
                toast({
                    title: 'Analysis Complete',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });
            } else {
                throw new Error(result.error || 'Failed to analyze');
            }
        } catch (error: any) {
            toast({
                title: 'Analysis Failed',
                description: error.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <VStack spacing={6} align="stretch">
            <HStack justifyContent="space-between">
                <Heading size="lg">Accounts & Finance</Heading>
                {isTrader && (
                    <HStack>
                        <AIAnalyzeButton onClick={handleAnalyze} isLoading={isAnalyzing} />
                        <AddAccountForm />
                        <AddExpenseForm />
                        <BulkExpenseForm />
                    </HStack>
                )}
            </HStack>

            {isAnalyzing && <LoadingInsights />}
            {aiData && <AIInsightsPanel data={aiData} />}

            <Box>
                <Heading size="md" mb={4}>My Accounts</Heading>
                <AccountList />
            </Box>

            {isTrader && (
                <>
                    <Divider />
                    <Box>
                        <Heading size="md" mb={4}>Recent Transactions</Heading>
                        <ExpenseList />
                    </Box>
                </>
            )}
        </VStack>
    );
};

export default Accounts;
