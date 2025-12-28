import {
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    Box,
    Badge,
    IconButton,
    HStack,
    Input,
    Select,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { useData } from '../context/DataContext';
import { format } from 'date-fns';
import { useState } from 'react';

const TradeList = () => {
    const { trades, deleteTrade } = useData();
    const [filterSymbol, setFilterSymbol] = useState('');
    const [filterStrategy, setFilterStrategy] = useState('');

    const filteredTrades = trades.filter(t => {
        const matchSymbol = t.symbol.toLowerCase().includes(filterSymbol.toLowerCase());
        const matchStrategy = filterStrategy ? t.strategy === filterStrategy : true;
        return matchSymbol && matchStrategy;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (trades.length === 0) {
        return (
            <Box p={4} textAlign="center" color="gray.500">
                No trades logged yet. Start utilizing your journal!
            </Box>
        );
    }

    return (
        <Box>
            <HStack mb={4} spacing={4}>
                <Input
                    placeholder="Filter by Symbol..."
                    value={filterSymbol}
                    onChange={(e) => setFilterSymbol(e.target.value)}
                    maxW="200px"
                />
                <Select
                    placeholder="All Strategies"
                    value={filterStrategy}
                    onChange={(e) => setFilterStrategy(e.target.value)}
                    maxW="200px"
                >
                    <option value="Breakout">Breakout</option>
                    <option value="Reversal">Reversal</option>
                    <option value="Trend Following">Trend Following</option>
                    <option value="Scalping">Scalping</option>
                    <option value="Swing">Swing</option>
                </Select>
            </HStack>

            <TableContainer bg="white" _dark={{ bg: 'gray.800' }} borderRadius="md" boxShadow="sm">
                <Table variant="simple" size="sm">
                    <Thead>
                        <Tr>
                            <Th>Date</Th>
                            <Th>Symbol</Th>
                            <Th>Type</Th>
                            <Th>Strategy</Th>
                            <Th isNumeric>Size</Th>
                            <Th isNumeric>Entry</Th>
                            <Th isNumeric>Exit</Th>
                            <Th isNumeric>P&L</Th>
                            <Th>Actions</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {filteredTrades.map((trade) => (
                            <Tr key={trade.id}>
                                <Td>{format(new Date(trade.date), 'MMM dd HH:mm')}</Td>
                                <Td fontWeight="bold">{trade.symbol}</Td>
                                <Td><Badge colorScheme={trade.type === 'BUY' ? 'green' : 'red'}>{trade.type}</Badge></Td>
                                <Td>{trade.strategy}</Td>
                                <Td isNumeric>{trade.lotSize}</Td>
                                <Td isNumeric>{trade.entryPrice}</Td>
                                <Td isNumeric>{trade.exitPrice}</Td>
                                <Td isNumeric color={trade.pnl >= 0 ? 'green.500' : 'red.500'} fontWeight="bold">
                                    {trade.pnl >= 0 ? '+₹' : '-₹'}{Math.abs(trade.pnl)}
                                </Td>
                                <Td>
                                    <IconButton
                                        aria-label="Delete trade"
                                        icon={<DeleteIcon />}
                                        size="xs"
                                        colorScheme="red"
                                        variant="ghost"
                                        onClick={() => deleteTrade(trade.id)}
                                    />
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default TradeList;
