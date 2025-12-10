import {
    Box,
    SimpleGrid,
    Heading,
    Text,
    Card,
    CardBody,
    Stack,
} from '@chakra-ui/react';
import { useData } from '../context/DataContext';
import { format, isToday, isTomorrow } from 'date-fns';

const Dashboard = () => {
    const { trades, accounts, expenses, todos } = useData();

    // Metrics
    const totalPnL = trades.reduce((acc, t) => acc + t.pnl, 0);
    const totalWins = trades.filter(t => t.pnl > 0).length;
    const winRate = trades.length > 0 ? ((totalWins / trades.length) * 100).toFixed(1) : '0';
    const totalBalance = accounts.reduce((acc, a) => acc + a.balance, 0);

    // Recent Activity
    const recentTrades = [...trades]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3)
        .map(t => ({
            type: 'TRADE',
            date: t.date,
            desc: `${t.type} ${t.symbol}`,
            amt: t.pnl,
            isPos: t.pnl >= 0
        }));

    const recentExpenses = [...expenses]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3)
        .map(e => ({
            type: 'EXPENSE',
            date: e.date,
            desc: e.description,
            amt: -e.amount,
            isPos: false
        }));

    const activity = [...recentTrades, ...recentExpenses]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

    // Notifications
    const upcomingTodos = todos.filter(t => !t.isComplete && (isToday(new Date(t.dueDate)) || isTomorrow(new Date(t.dueDate))));

    return (
        <Box>
            <Heading mb={6}>Dashboard</Heading>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
                <Card borderLeft="4px" borderColor="green.400">
                    <CardBody>
                        <Text color="gray.500">Total Net P&L</Text>
                        <Heading size="xl" color={totalPnL >= 0 ? 'green.500' : 'red.500'}>
                            ${totalPnL.toFixed(2)}
                        </Heading>
                    </CardBody>
                </Card>
                <Card borderLeft="4px" borderColor="blue.400">
                    <CardBody>
                        <Text color="gray.500">Win Rate</Text>
                        <Heading size="xl">{winRate}%</Heading>
                    </CardBody>
                </Card>
                <Card borderLeft="4px" borderColor="purple.400">
                    <CardBody>
                        <Text color="gray.500">Total Balance</Text>
                        <Heading size="xl">${totalBalance.toLocaleString()}</Heading>
                    </CardBody>
                </Card>
            </SimpleGrid>

            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
                <Card flex={1}>
                    <CardBody>
                        <Heading size="md" mb={4}>Recent Activity</Heading>
                        <Stack spacing={4}>
                            {activity.length === 0 ? (
                                <Text color="gray.500">No activity yet.</Text>
                            ) : (
                                activity.map((item, idx) => (
                                    <Box key={idx} p={3} borderWidth="1px" borderRadius="md">
                                        <SimpleGrid columns={3} alignItems="center">
                                            <Box>
                                                <Text fontWeight="bold" fontSize="sm">{item.type}</Text>
                                                <Text fontSize="xs" color="gray.500">
                                                    {format(new Date(item.date), 'MMM dd')}
                                                </Text>
                                            </Box>
                                            <Text fontWeight="medium">{item.desc}</Text>
                                            <Text
                                                textAlign="right"
                                                fontWeight="bold"
                                                color={item.isPos ? 'green.500' : 'red.500'}
                                            >
                                                {item.amt > 0 ? '+' : ''}{item.amt.toFixed(2)}
                                            </Text>
                                        </SimpleGrid>
                                    </Box>
                                ))
                            )}
                        </Stack>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody>
                        <Heading size="md" mb={4}>Notifications</Heading>
                        <Stack spacing={2}>
                            {upcomingTodos.length > 0 ? (
                                upcomingTodos.map(todo => (
                                    <Box key={todo.id} p={2} bg="yellow.100" _dark={{ bg: 'yellow.900' }} borderRadius="md">
                                        <Text fontSize="sm">
                                            Task <b>"{todo.title}"</b> is due {new Date(todo.dueDate).toLocaleDateString()}
                                        </Text>
                                    </Box>
                                ))
                            ) : (
                                <Text color="gray.500">No urgent tasks.</Text>
                            )}
                        </Stack>
                    </CardBody>
                </Card>
            </SimpleGrid>
        </Box>
    );
};

export default Dashboard;
