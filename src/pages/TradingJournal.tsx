import { Heading, Box, VStack, HStack, Spacer } from '@chakra-ui/react';
import TradeForm from '../components/TradeForm';
import TradeList from '../components/TradeList';
import TradeAnalytics from '../components/TradeAnalytics';

const TradingJournal = () => {
    return (
        <VStack spacing={6} align="stretch">
            <HStack>
                <Heading size="lg">Trading Journal</Heading>
                <Spacer />
                <TradeForm />
            </HStack>

            <TradeAnalytics />

            <Box>
                <Heading size="md" mb={4}>Trade Log</Heading>
                <TradeList />
            </Box>
        </VStack>
    );
};

export default TradingJournal;
