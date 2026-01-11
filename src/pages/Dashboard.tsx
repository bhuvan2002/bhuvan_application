import {
    Box,
    SimpleGrid,
    Heading,
    Text,
    Card,
    CardBody,
    Stack,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Badge,
    StatArrow,
    GridItem,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    useDisclosure,
    StatLabel,
    StatNumber,
    StatHelpText,
    Stat,
    Input,
    Select,
    InputGroup,
    InputLeftElement,
    HStack,
} from '@chakra-ui/react';
import { useData } from '../context/DataContext';
import { useEffect } from 'react';

import { format, isToday, isTomorrow, parseISO, isSameMonth, isSameYear } from 'date-fns';
import { useState, useMemo } from 'react';
import type { Expense } from '../types';
import { SearchIcon } from '@chakra-ui/icons';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    Legend
} from 'recharts';

const Dashboard = () => {
    const {
        trades, accounts, expenses, todos,
        fetchTrades, fetchAccounts, fetchExpenses, fetchTodos
    } = useData();

    const { isOpen, onOpen, onClose } = useDisclosure();
    const [detailData, setDetailData] = useState<{ title: string; data: Expense[] }>({ title: '', data: [] });
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('');

    useEffect(() => {
        fetchTrades();
        fetchAccounts();
        fetchExpenses();
        fetchTodos();
    }, []);


    // --- Trading Metrics ---
    const totalPnL = trades.reduce((acc, t) => acc + t.pnl, 0);
    const totalWins = trades.filter(t => t.pnl > 0).length;
    const winRate = trades.length > 0 ? ((totalWins / trades.length) * 100).toFixed(1) : '0';
    const profitFactor = (() => {
        const grossProfit = trades.filter(t => t.pnl > 0).reduce((acc, t) => acc + t.pnl, 0);
        const grossLoss = Math.abs(trades.filter(t => t.pnl < 0).reduce((acc, t) => acc + t.pnl, 0));
        return grossLoss === 0 ? grossProfit : (grossProfit / grossLoss).toFixed(2);
    })();

    // Cumulative PnL Chart Data
    const sortedTrades = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let runningPnL = 0;
    const pnlChartData = sortedTrades.map(t => {
        runningPnL += t.pnl;
        return {
            date: format(parseISO(t.date), 'MM/dd'),
            pnl: runningPnL,
            tradePnl: t.pnl
        };
    });

    // --- Finance Metrics ---
    const totalBalance = accounts.reduce((acc, a) => acc + a.balance, 0);
    const totalCredit = expenses.filter(e => e.type === 'CREDIT').reduce((acc, e) => acc + e.amount, 0);
    const totalDebit = expenses.filter(e => e.type === 'DEBIT' || !e.type).reduce((acc, e) => acc + e.amount, 0);

    const todaySpent = expenses
        .filter(e => (e.type === 'DEBIT' || !e.type) && isToday(parseISO(e.date)))
        .reduce((acc, e) => acc + e.amount, 0);

    const monthlySpent = expenses
        .filter(e => (e.type === 'DEBIT' || !e.type) && isSameMonth(parseISO(e.date), new Date()) && isSameYear(parseISO(e.date), new Date()))
        .reduce((acc, e) => acc + e.amount, 0);

    // Expenses by Category
    const expensesByCategory = expenses.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
    }, {} as Record<string, number>);

    const expensePieData = Object.entries(expensesByCategory).map(([name, value]) => ({ name, value }));
    const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    const handleMetricClick = (type: 'CREDIT' | 'DEBIT' | 'TODAY' | 'MONTHLY') => {
        let filtered: Expense[] = [];
        let title = '';

        switch (type) {
            case 'CREDIT':
                filtered = expenses.filter(e => e.type === 'CREDIT');
                title = 'Credit / Income Details';
                break;
            case 'DEBIT':
                filtered = expenses.filter(e => e.type === 'DEBIT' || !e.type);
                title = 'Debit / Expense Details';
                break;
            case 'TODAY':
                filtered = expenses.filter(e => (e.type === 'DEBIT' || !e.type) && isToday(parseISO(e.date)));
                title = "Today's Spent Details";
                break;
            case 'MONTHLY':
                filtered = expenses.filter(e => (e.type === 'DEBIT' || !e.type) && isSameMonth(parseISO(e.date), new Date()) && isSameYear(parseISO(e.date), new Date()));
                title = `Monthly Expenses - ${format(new Date(), 'MMMM yyyy')}`;
                break;
        }

        setDetailData({ title, data: filtered });
        setSearchQuery('');
        setFilterCategory('');
        onOpen();
    };

    const filteredModalData = useMemo(() => {
        return detailData.data.filter(item => {
            const matchesSearch = item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.category.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = filterCategory === '' || item.category === filterCategory;
            return matchesSearch && matchesCategory;
        });
    }, [detailData.data, searchQuery, filterCategory]);

    const modalCategories = useMemo(() => {
        const cats = new Set(detailData.data.map(item => item.category));
        return Array.from(cats);
    }, [detailData.data]);

    // --- Productivity Metrics ---
    const upcomingTodos = todos.filter(t => !t.isComplete && (isToday(new Date(t.dueDate)) || isTomorrow(new Date(t.dueDate))));
    const highPriorityTodos = todos.filter(t => !t.isComplete && t.priority === 'HIGH');

    return (
        <Box>
            <Heading mb={6}>Dashboard</Heading>

            <Tabs variant="enclosed" colorScheme="blue" isLazy>
                <TabList>
                    <Tab>Overview</Tab>
                    <Tab>Trading</Tab>
                    <Tab>Finance</Tab>
                    <Tab>Productivity</Tab>
                </TabList>

                <TabPanels>
                    {/* --- OVERVIEW TAB --- */}
                    <TabPanel px={0}>
                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
                            <Card borderTop="4px" borderColor="green.400">
                                <CardBody>
                                    <Stat>
                                        <StatLabel>Total Net P&L</StatLabel>
                                        <StatNumber color={totalPnL >= 0 ? 'green.500' : 'red.500'}>
                                            ₹{totalPnL.toFixed(2)}
                                        </StatNumber>
                                        <StatHelpText>
                                            <StatArrow type={totalPnL >= 0 ? 'increase' : 'decrease'} />
                                            {trades.length} Trades
                                        </StatHelpText>
                                    </Stat>
                                </CardBody>
                            </Card>
                            <Card borderTop="4px" borderColor="blue.400">
                                <CardBody>
                                    <Stat>
                                        <StatLabel>Total Balance</StatLabel>
                                        <StatNumber>₹{totalBalance.toLocaleString()}</StatNumber>
                                        <StatHelpText>{accounts.length} Accounts</StatHelpText>
                                    </Stat>
                                </CardBody>
                            </Card>
                            <Card borderTop="4px" borderColor="purple.400">
                                <CardBody>
                                    <Stat>
                                        <StatLabel>Urgent Tasks</StatLabel>
                                        <StatNumber>{upcomingTodos.length}</StatNumber>
                                        <StatHelpText>Due Today/Tomorrow</StatHelpText>
                                    </Stat>
                                </CardBody>
                            </Card>
                        </SimpleGrid>

                        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
                            <Card>
                                <CardBody>
                                    <Heading size="md" mb={4}>Financial Overview</Heading>
                                    <Box height="300px">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={[
                                                { name: 'Income/P&L', amount: totalPnL }, // Simplified
                                                { name: 'Expenses', amount: totalDebit }
                                            ]}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="name" />
                                                <YAxis />
                                                <Tooltip />
                                                <Bar dataKey="amount" fill="#8884d8" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </Box>
                                </CardBody>
                            </Card>

                            <Card>
                                <CardBody>
                                    <Heading size="md" mb={4}>Quick Actions / Notifications</Heading>
                                    <Stack spacing={2}>
                                        {upcomingTodos.slice(0, 5).map(todo => (
                                            <Box key={todo.id} p={2} bg="yellow.50" _dark={{ bg: 'yellow.900' }} borderRadius="md" borderLeft="4px solid orange">
                                                <Text fontSize="sm" fontWeight="bold">{todo.title}</Text>
                                                <Text fontSize="xs">Due: {new Date(todo.dueDate).toLocaleDateString()}</Text>
                                            </Box>
                                        ))}
                                        {upcomingTodos.length === 0 && <Text color="gray.500">No urgent tasks.</Text>}
                                    </Stack>
                                </CardBody>
                            </Card>
                        </SimpleGrid>
                    </TabPanel>

                    {/* --- TRADING TAB --- */}
                    <TabPanel px={0}>
                        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6} mb={8}>
                            <Card>
                                <CardBody>
                                    <Stat>
                                        <StatLabel>Net P&L</StatLabel>
                                        <StatNumber color={totalPnL >= 0 ? 'green.500' : 'red.500'}>₹{totalPnL.toFixed(2)}</StatNumber>
                                    </Stat>
                                </CardBody>
                            </Card>
                            <Card>
                                <CardBody>
                                    <Stat>
                                        <StatLabel>Win Rate</StatLabel>
                                        <StatNumber>{winRate}%</StatNumber>
                                    </Stat>
                                </CardBody>
                            </Card>
                            <Card>
                                <CardBody>
                                    <Stat>
                                        <StatLabel>Profit Factor</StatLabel>
                                        <StatNumber>{profitFactor}</StatNumber>
                                    </Stat>
                                </CardBody>
                            </Card>
                            <Card>
                                <CardBody>
                                    <Stat>
                                        <StatLabel>Total Trades</StatLabel>
                                        <StatNumber>{trades.length}</StatNumber>
                                    </Stat>
                                </CardBody>
                            </Card>
                        </SimpleGrid>

                        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
                            <GridItem colSpan={{ base: 1, lg: 2 }}>
                                <Card height="400px">
                                    <CardBody>
                                        <Heading size="md" mb={4}>Cumulative P&L</Heading>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={pnlChartData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="date" />
                                                <YAxis />
                                                <Tooltip />
                                                <Line type="monotone" dataKey="pnl" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </CardBody>
                                </Card>
                            </GridItem>
                            <GridItem colSpan={1}>
                                <Card height="400px" overflowY="auto">
                                    <CardBody>
                                        <Heading size="md" mb={4}>Recent Trades</Heading>
                                        <Stack spacing={2}>
                                            {[...trades].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10).map(trade => (
                                                <Box key={trade.id} p={3} borderWidth="1px" borderRadius="md" display="flex" justifyContent="space-between" alignItems="center">
                                                    <Box>
                                                        <Text fontWeight="bold">{trade.symbol} <Badge colorScheme={trade.type === 'BUY' ? 'green' : 'red'}>{trade.type}</Badge></Text>
                                                        <Text fontSize="xs" color="gray.500">{format(parseISO(trade.date), 'MMM dd')}</Text>
                                                    </Box>
                                                    <Text fontWeight="bold" color={trade.pnl >= 0 ? 'green.500' : 'red.500'}>
                                                        {trade.pnl >= 0 ? '+' : ''}{trade.pnl}
                                                    </Text>
                                                </Box>
                                            ))}
                                        </Stack>
                                    </CardBody>
                                </Card>
                            </GridItem>
                        </SimpleGrid>
                    </TabPanel>

                    {/* --- FINANCE TAB --- */}
                    <TabPanel px={0}>
                        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6} mb={8}>
                            <Card
                                borderTop="4px"
                                borderColor="green.400"
                                cursor="pointer"
                                onClick={() => handleMetricClick('CREDIT')}
                                _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
                                transition="all 0.2s"
                            >
                                <CardBody>
                                    <Stat>
                                        <StatLabel>Total Credit</StatLabel>
                                        <StatNumber color="green.500">₹{totalCredit.toLocaleString()}</StatNumber>
                                    </Stat>
                                </CardBody>
                            </Card>
                            <Card
                                borderTop="4px"
                                borderColor="red.400"
                                cursor="pointer"
                                onClick={() => handleMetricClick('DEBIT')}
                                _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
                                transition="all 0.2s"
                            >
                                <CardBody>
                                    <Stat>
                                        <StatLabel>Total Debit</StatLabel>
                                        <StatNumber color="red.500">₹{totalDebit.toLocaleString()}</StatNumber>
                                    </Stat>
                                </CardBody>
                            </Card>
                            <Card
                                borderTop="4px"
                                borderColor="orange.400"
                                cursor="pointer"
                                onClick={() => handleMetricClick('TODAY')}
                                _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
                                transition="all 0.2s"
                            >
                                <CardBody>
                                    <Stat>
                                        <StatLabel>Today's Spent</StatLabel>
                                        <StatNumber color="orange.500">₹{todaySpent.toLocaleString()}</StatNumber>
                                    </Stat>
                                </CardBody>
                            </Card>
                            <Card
                                borderTop="4px"
                                borderColor="purple.400"
                                cursor="pointer"
                                onClick={() => handleMetricClick('MONTHLY')}
                                _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
                                transition="all 0.2s"
                            >
                                <CardBody>
                                    <Stat>
                                        <StatLabel>Monthly Expenses</StatLabel>
                                        <StatNumber color="purple.500">₹{monthlySpent.toLocaleString()}</StatNumber>
                                        <StatHelpText>{format(new Date(), 'MMMM yyyy')}</StatHelpText>
                                    </Stat>
                                </CardBody>
                            </Card>
                        </SimpleGrid>

                        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
                            <Card minH="400px">
                                <CardBody>
                                    <Heading size="md" mb={4}>Expenses by Category</Heading>
                                    <Box height="300px">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={expensePieData}
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={100}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                >
                                                    {expensePieData.map((_entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </Box>
                                </CardBody>
                            </Card>

                            <Card minH="400px">
                                <CardBody>
                                    <Heading size="md" mb={4}>Account Balances</Heading>
                                    <Table variant="simple" size="sm">
                                        <Thead>
                                            <Tr>
                                                <Th>Account</Th>
                                                <Th>Bank</Th>
                                                <Th isNumeric>Balance</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {accounts.map(acc => (
                                                <Tr key={acc.id}>
                                                    <Td>{acc.name}</Td>
                                                    <Td>{acc.bankName}</Td>
                                                    <Td isNumeric fontWeight="bold">₹{acc.balance.toLocaleString()}</Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                    {accounts.length === 0 && <Text color="gray.500" mt={4}>No accounts found.</Text>}
                                </CardBody>
                            </Card>
                        </SimpleGrid>
                    </TabPanel>

                    {/* --- PRODUCTIVITY TAB --- */}
                    <TabPanel px={0}>
                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
                            <Card>
                                <CardBody>
                                    <Stat>
                                        <StatLabel>High Priority</StatLabel>
                                        <StatNumber color="red.500">{highPriorityTodos.length}</StatNumber>
                                    </Stat>
                                </CardBody>
                            </Card>
                            <Card>
                                <CardBody>
                                    <Stat>
                                        <StatLabel>All Open Tasks</StatLabel>
                                        <StatNumber>{todos.filter(t => !t.isComplete).length}</StatNumber>
                                    </Stat>
                                </CardBody>
                            </Card>
                        </SimpleGrid>

                        <Card>
                            <CardBody>
                                <Heading size="md" mb={4}>Priority Tasks</Heading>
                                <Stack spacing={3}>
                                    {highPriorityTodos.length > 0 ? (
                                        highPriorityTodos.map(todo => (
                                            <Box key={todo.id} p={4} borderWidth="1px" borderColor="red.300" bg="red.50" _dark={{ bg: 'red.900' }} borderRadius="md">
                                                <Text fontWeight="bold">{todo.title}</Text>
                                                <Text fontSize="sm">Due: {new Date(todo.dueDate).toLocaleDateString()}</Text>
                                            </Box>
                                        ))
                                    ) : (
                                        <Text>No high priority tasks pending.</Text>
                                    )}
                                </Stack>
                            </CardBody>
                        </Card>
                    </TabPanel>
                </TabPanels>
            </Tabs>

            <Modal isOpen={isOpen} onClose={onClose} size="3xl">
                <ModalOverlay backdropFilter="blur(4px)" />
                <ModalContent borderRadius="xl">
                    <ModalHeader borderBottomWidth="1px">{detailData.title}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody py={6}>
                        <HStack mb={4} spacing={4}>
                            <InputGroup flex={2}>
                                <InputLeftElement pointerEvents="none">
                                    <SearchIcon color="gray.300" />
                                </InputLeftElement>
                                <Input
                                    placeholder="Search by description or category..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </InputGroup>
                            <Select
                                flex={1}
                                placeholder="All Categories"
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                            >
                                {modalCategories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </Select>
                        </HStack>

                        <Table variant="simple" size="sm">
                            <Thead>
                                <Tr>
                                    <Th>Date</Th>
                                    <Th>Description</Th>
                                    <Th>Category</Th>
                                    <Th isNumeric>Amount</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {filteredModalData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(e => (
                                    <Tr key={e.id}>
                                        <Td>{format(parseISO(e.date), 'MMM dd, yyyy')}</Td>
                                        <Td>{e.description}</Td>
                                        <Td><Badge>{e.category}</Badge></Td>
                                        <Td isNumeric fontWeight="bold" color={e.type === 'CREDIT' ? 'green.500' : 'red.500'}>
                                            {e.type === 'CREDIT' ? '+' : '-'}₹{e.amount.toLocaleString()}
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                        {filteredModalData.length === 0 && (
                            <Text textAlign="center" py={10} color="gray.500">
                                {detailData.data.length === 0 ? 'No transactions found for this period.' : 'No results matching your filters.'}
                            </Text>
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default Dashboard;
