import {
    Heading,
    Box,
    VStack,
    HStack,
    Spacer,
    Button,
    useDisclosure,
    Drawer,
    DrawerBody,
    DrawerFooter,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    useColorModeValue,
    Select,
    Text
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { useData } from '../context/DataContext';
import TradeForm from '../components/TradeForm';
import TradeList from '../components/TradeList';
import TradeAnalytics from '../components/TradeAnalytics';
import TradingViewWidget from '../components/TradingViewWidget';

const SYMBOLS = [
    { label: 'Gold (XAUUSD)', value: 'OANDA:XAUUSD' },
    { label: 'Bitcoin (BTC)', value: 'BINANCE:BTCUSDT' },
    { label: 'Ethereum (ETH)', value: 'BINANCE:ETHUSDT' },
    { label: 'Silver (XAGUSD)', value: 'OANDA:XAGUSD' },
    { label: 'Solana (SOL)', value: 'BINANCE:SOLUSDT' },
    { label: 'GBP/USD', value: 'OANDA:GBPUSD' },
    { label: 'EUR/USD', value: 'OANDA:EURUSD' },
    { label: 'USD/JPY', value: 'OANDA:USDJPY' },
    { label: 'USD/CAD', value: 'OANDA:USDCAD' },
    { label: 'NZD/USD', value: 'OANDA:NZDUSD' },
];

const TradingJournal = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { fetchTrades } = useData();
    const [selectedSymbol, setSelectedSymbol] = useState('OANDA:XAUUSD');
    const bgColor = useColorModeValue('white', 'gray.800');

    const openGoldChart = () => {
        window.open('https://in.tradingview.com/chart/VYg04fD3/?symbol=OANDA%3AXAUUSD', '_blank');
    };

    useEffect(() => {
        fetchTrades();
    }, []);

    return (
        <Box h="calc(100vh - 100px)" overflow="hidden" p={4}>
            <VStack spacing={6} align="stretch" h="full">
                <HStack>
                    <Heading size="lg">Trading Journal</Heading>
                    <Spacer />
                    <Button
                        onClick={openGoldChart}
                        leftIcon={<ExternalLinkIcon />}
                        colorScheme="yellow"
                        variant="ghost"
                        mr={2}
                    >
                        Gold Chart
                    </Button>
                    <Button onClick={onOpen} variant="outline" mr={2}>
                        View Trade Log
                    </Button>
                    <TradeForm />
                </HStack>

                <Tabs variant="soft-rounded" colorScheme="blue" flex="1" display="flex" flexDirection="column">
                    <HStack justifyContent="space-between" mb={4}>
                        <TabList>
                            <Tab>Analytics</Tab>
                            <Tab>Live Market</Tab>
                        </TabList>

                        <HStack spacing={4}>
                            <Text fontSize="sm" fontWeight="bold" color="gray.500">Market Select:</Text>
                            <Select
                                size="sm"
                                width="200px"
                                value={selectedSymbol}
                                onChange={(e) => setSelectedSymbol(e.target.value)}
                                borderRadius="full"
                                bg={bgColor}
                            >
                                {SYMBOLS.map(s => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                            </Select>
                        </HStack>
                    </HStack>

                    <TabPanels flex="1" overflow="hidden">
                        <TabPanel p={0} h="full">
                            <Box h="full" overflowY="auto" pr={2}>
                                <TradeAnalytics />
                            </Box>
                        </TabPanel>
                        <TabPanel p={0} h="full">
                            <Box h="full" bg={bgColor} borderRadius="lg" p={2}>
                                <TradingViewWidget
                                    symbol={selectedSymbol}
                                    theme={useColorModeValue('light', 'dark') as 'light' | 'dark'}
                                />
                            </Box>
                        </TabPanel>
                    </TabPanels>
                </Tabs>

                {/* Drawer for Trade Log */}
                <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="xl">
                    <DrawerOverlay />
                    <DrawerContent>
                        <DrawerCloseButton />
                        <DrawerHeader>Trade Log</DrawerHeader>

                        <DrawerBody>
                            <TradeList />
                        </DrawerBody>

                        <DrawerFooter>
                            <Button variant="outline" mr={3} onClick={onClose}>
                                Close
                            </Button>
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>
            </VStack>
        </Box>
    );
};

export default TradingJournal;
