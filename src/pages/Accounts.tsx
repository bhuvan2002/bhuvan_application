import { Heading, HStack, VStack, useToast, Tabs, TabList, TabPanels, Tab, TabPanel, Text, Button, CardBody, Card } from '@chakra-ui/react';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AIAnalyzeButton from '../components/ai/AIAnalyzeButton';
import LoadingInsights from '../components/ai/LoadingInsights';
import AIInsightsPanel from '../components/ai/AIInsightsPanel';
import { aiService, type AIAnalysisResponse } from '../services/aiService';
import AddAccountForm from '../components/AddAccountForm';
import AccountList from '../components/AccountList';

const Accounts = () => {
    const location = useLocation();
    const defaultIndex = location.state?.tabIndex || 0;
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

            <Tabs variant="enclosed" colorScheme="blue" defaultIndex={defaultIndex}>
                <TabList>
                    <Tab>Bank Accounts</Tab>
                    <Tab>Credit Cards</Tab>
                    <Tab>Loans</Tab>
                </TabList>

                <TabPanels>
                    <TabPanel>
                        <Card>
                            <CardBody>
                                <HStack justifyContent="space-between" alignItems="flex-start" mb={6}>
                                    <VStack align="start" spacing={1}>
                                        <Heading size="md">My Bank Accounts</Heading>
                                        <Text color="gray.500">Manage your bank balances, income, and expenses here.</Text>
                                    </VStack>
                                    {isTrader && (
                                        <AddAccountForm initialType="BANK">
                                            <Button colorScheme="blue" size="sm">Add Bank Account</Button>
                                        </AddAccountForm>
                                    )}
                                </HStack>
                                <AccountList type="BANK" />
                            </CardBody>
                        </Card>
                    </TabPanel>
                    <TabPanel>
                        <Card>
                            <CardBody>
                                <HStack justifyContent="space-between" alignItems="flex-start" mb={6}>
                                    <VStack align="start" spacing={1}>
                                        <Heading size="md">My Credit Cards</Heading>
                                        <Text color="gray.500">Track credit card spending and bill payments.</Text>
                                    </VStack>
                                    {isTrader && (
                                        <AddAccountForm initialType="CREDIT_CARD">
                                            <Button colorScheme="teal" size="sm">Add Credit Card</Button>
                                        </AddAccountForm>
                                    )}
                                </HStack>
                                <AccountList type="CREDIT_CARD" />
                            </CardBody>
                        </Card>
                    </TabPanel>
                    <TabPanel>
                        <Card>
                            <CardBody>
                                <HStack justifyContent="space-between" alignItems="flex-start" mb={6}>
                                    <VStack align="start" spacing={1}>
                                        <Heading size="md">My Loans</Heading>
                                        <Text color="gray.500">Manage EMI schedules and loan payments.</Text>
                                    </VStack>
                                    {isTrader && (
                                        <AddAccountForm initialType="LOAN">
                                            <Button colorScheme="purple" size="sm">Add Loan</Button>
                                        </AddAccountForm>
                                    )}
                                </HStack>
                                <AccountList type="LOAN" />
                            </CardBody>
                        </Card>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </VStack>
    );
};

export default Accounts;
