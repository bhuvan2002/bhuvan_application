import { Box, Heading, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, StatArrow, VStack, Divider } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import AIInsightCard from './AIInsightCard';
import type { AIAnalysisResponse } from '../../services/aiService';

const MotionBox = motion(Box);

interface AIInsightsPanelProps {
    data: AIAnalysisResponse['data'];
}

const AIInsightsPanel = ({ data }: AIInsightsPanelProps) => {
    const { summary, insights } = data;

    return (
        <MotionBox
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            p={6}
            boxShadow="xl"
            bg="white"
            borderRadius="xl"
            border="1px solid"
            borderColor="gray.100"
            w="full"
        >
            <VStack align="stretch" spacing={6}>
                <Heading size="md" color="purple.600">Financial Summary</Heading>
                
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                    <Box p={4} bg="gray.50" borderRadius="md">
                        <Stat>
                            <StatLabel color="gray.600">Total Income</StatLabel>
                            <StatNumber color="gray.800">₹{summary.totalIncome.toLocaleString()}</StatNumber>
                        </Stat>
                    </Box>
                    <Box p={4} bg="gray.50" borderRadius="md">
                        <Stat>
                            <StatLabel color="gray.600">Total Expenses</StatLabel>
                            <StatNumber color="gray.800">₹{summary.totalExpenses.toLocaleString()}</StatNumber>
                            <StatHelpText color="gray.600">
                                <StatArrow type={summary.monthOverMonthChangePercentage > 0 ? 'increase' : 'decrease'} />
                                {Math.abs(summary.monthOverMonthChangePercentage)}%
                            </StatHelpText>
                        </Stat>
                    </Box>
                    <Box p={4} bg="gray.50" borderRadius="md">
                        <Stat>
                            <StatLabel color="gray.600">Savings Rate</StatLabel>
                            <StatNumber color="gray.800">{summary.savingsRate}%</StatNumber>
                        </Stat>
                    </Box>
                </SimpleGrid>

                <Divider />

                <Heading size="md" color="purple.600">AI Insights</Heading>
                
                <VStack align="stretch" spacing={4}>
                    {insights.map((insight, index) => (
                        <AIInsightCard key={index} insight={insight} index={index} />
                    ))}
                </VStack>
            </VStack>
        </MotionBox>
    );
};

export default AIInsightsPanel;
