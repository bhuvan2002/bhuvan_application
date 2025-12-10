import {
    Box,
    Heading,
    SimpleGrid,
    Text,
    Card,
    CardBody,
} from '@chakra-ui/react';
import {
    AreaChart,
    Area,
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
} from 'recharts';
import { useData } from '../context/DataContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

const TradeAnalytics = () => {
    const { trades } = useData();

    if (trades.length === 0) return null;

    // 1. Win Rate
    const totalTrades = trades.length;
    const wins = trades.filter(t => t.pnl > 0).length;
    const winRate = ((wins / totalTrades) * 100).toFixed(1);

    // 2. Equity Curve
    const sortedTrades = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let cumulative = 0;
    const equityData = sortedTrades.map(t => {
        cumulative += t.pnl;
        return {
            date: new Date(t.date).toLocaleDateString(),
            equity: cumulative,
        };
    });

    // 3. P&L by Strategy
    const strategyPnl: Record<string, number> = {};
    trades.forEach(t => {
        strategyPnl[t.strategy] = (strategyPnl[t.strategy] || 0) + t.pnl;
    });
    const strategyData = Object.keys(strategyPnl).map(k => ({
        name: k,
        value: strategyPnl[k]
    }));

    // 4. Pie Chart: Trades by Strategy
    const strategyCount: Record<string, number> = {};
    trades.forEach(t => { strategyCount[t.strategy] = (strategyCount[t.strategy] || 0) + 1; });
    const pieData = Object.keys(strategyCount).map(k => ({ name: k, value: strategyCount[k] }));

    return (
        <Box mt={8}>
            <Heading size="md" mb={6}>Analytics</Heading>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={8}>
                <Card>
                    <CardBody textAlign="center">
                        <Text color="gray.500">Win Rate</Text>
                        <Heading size="xl" color={Number(winRate) > 50 ? 'green.500' : 'orange.500'}>
                            {winRate}%
                        </Heading>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody textAlign="center">
                        <Text color="gray.500">Total Trades</Text>
                        <Heading size="xl">{totalTrades}</Heading>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody textAlign="center">
                        <Text color="gray.500">Net P&L</Text>
                        <Heading size="xl" color={cumulative >= 0 ? 'green.500' : 'red.500'}>
                            ${cumulative.toFixed(2)}
                        </Heading>
                    </CardBody>
                </Card>
            </SimpleGrid>

            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
                <Box h="300px" bg="white" _dark={{ bg: 'gray.800' }} p={4} borderRadius="md" boxShadow="sm">
                    <Text mb={4} fontWeight="bold">Equity Curve</Text>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={equityData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Area type="monotone" dataKey="equity" stroke="#3182ce" fill="#3182ce" fillOpacity={0.3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </Box>

                <Box h="300px" bg="white" _dark={{ bg: 'gray.800' }} p={4} borderRadius="md" boxShadow="sm">
                    <Text mb={4} fontWeight="bold">P&L by Strategy</Text>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={strategyData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#8884d8">
                                {strategyData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.value >= 0 ? '#48BB78' : '#F56565'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </Box>

                <Box h="300px" bg="white" _dark={{ bg: 'gray.800' }} p={4} borderRadius="md" boxShadow="sm">
                    <Text mb={4} fontWeight="bold">Trades by Strategy</Text>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                            >
                                {pieData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </Box>
            </SimpleGrid>
        </Box>
    );
};

export default TradeAnalytics;
