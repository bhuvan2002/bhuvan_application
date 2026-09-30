import { Heading, Box, HStack, VStack, useToast, Tabs, TabList, TabPanels, Tab, TabPanel, Text, Button } from '@chakra-ui/react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AIAnalyzeButton from '../components/ai/AIAnalyzeButton';
import LoadingInsights from '../components/ai/LoadingInsights';
import AIInsightsPanel from '../components/ai/AIInsightsPanel';
import { aiService, type AIAnalysisResponse } from '../services/aiService';
import AddAccountForm from '../components/AddAccountForm';
import AccountList from '../components/AccountList';

const Accounts = () => {
    const { user } = useAuth();
    const isTrader = user?.role === 'TRADER';
    const toast = useToast();

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiData, setAiData] = useState<AIAnalysisResponse['data'] | null>(null);

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        setAiData(null);
        try {
            const result = await aiService.analyzeFinance();
            if (result.success) {
                setAiData(result.data);
                toast({ title: 'Analysis Complete', status: 'success', duration: 3000 });
            } else {
                throw new Error(result.error || 'Failed to analyze');
            }
        } catch (error: any) {
            toast({ title: 'Analysis Failed', description: error.message, status: 'error', duration: 5000 });
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <VStack spacing={6} align="stretch" w="100%">
            <HStack justifyContent="space-between">
                <Heading size="lg">Accounts & Finance</Heading>
                {isTrader && (
                    <AIAnalyzeButton onClick={handleAnalyze} isLoading={isAnalyzing} />
                )}
            </HStack>

            {isAnalyzing && <LoadingInsights />}
            {aiData && <AIInsightsPanel data={aiData} />}

            <Tabs variant="enclosed" colorScheme="blue">
                <TabList>
                    <Tab>Bank Accounts</Tab>
                    <Tab>Credit Cards</Tab>
                    <Tab>Loans</Tab>
                </TabList>

                <TabPanels>
                    <TabPanel>
                        <Box p={4} borderWidth={1} borderRadius="md" shadow="sm">
                            <Heading size="md" mb={4}>My Bank Accounts</Heading>
                            <Text color="gray.500" mb={4}>Manage your bank balances, income, and expenses here.</Text>
                            <AccountList type="BANK" />
                            {isTrader && (
                                <AddAccountForm initialType="BANK">
                                    <Button colorScheme="blue" size="sm">Add Bank Account</Button>
                                </AddAccountForm>
                            )}
                        </Box>
                    </TabPanel>
                    <TabPanel>
                        <Box p={4} borderWidth={1} borderRadius="md" shadow="sm">
                            <Heading size="md" mb={4}>My Credit Cards</Heading>
                            <Text color="gray.500" mb={4}>Track credit card spending and bill payments.</Text>
                            <AccountList type="CREDIT_CARD" />
                            {isTrader && (
                                <AddAccountForm initialType="CREDIT_CARD">
                                    <Button colorScheme="teal" size="sm">Add Credit Card</Button>
                                </AddAccountForm>
                            )}
                        </Box>
                    </TabPanel>
                    <TabPanel>
                        <Box p={4} borderWidth={1} borderRadius="md" shadow="sm">
                            <Heading size="md" mb={4}>My Loans</Heading>
                            <Text color="gray.500" mb={4}>Manage EMI schedules and loan payments.</Text>
                            <AccountList type="LOAN" />
                            {isTrader && (
                                <AddAccountForm initialType="LOAN">
                                    <Button colorScheme="purple" size="sm">Add Loan</Button>
                                </AddAccountForm>
                            )}
                        </Box>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </VStack>
    );
};

export default Accounts;
