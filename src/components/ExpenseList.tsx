import {
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Tfoot,
    TableContainer,
    Box,
    Badge,
    Text,
    Input,
    HStack,
    Button,
} from '@chakra-ui/react';
import { useData } from '../context/DataContext';
import { format } from 'date-fns';
import { useState, useMemo } from 'react';

const ExpenseList = () => {
    const { expenses, accounts } = useData();
    const [filterDate, setFilterDate] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredExpenses = useMemo(() => {
        return expenses.filter(e => {
            // Date Filter
            let matchesDate = true;
            if (filterDate) {
                const expenseDateLocal = format(new Date(e.date), 'yyyy-MM-dd');
                matchesDate = expenseDateLocal === filterDate;
            }

            // Search Filter
            let matchesSearch = true;
            if (searchQuery) {
                const searchTerms = searchQuery.toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
                matchesSearch = searchTerms.length === 0 || searchTerms.every(term => 
                    (e.description && e.description.toLowerCase().includes(term)) || 
                    (e.category && e.category.toLowerCase().includes(term))
                );
            }

            return matchesDate && matchesSearch;
        });
    }, [expenses, filterDate, searchQuery]);

    const totals = useMemo(() => {
        let spent = 0;
        let earned = 0;
        filteredExpenses.forEach(e => {
            const amount = Number(e.amount) || 0;
            if (e.type === 'CREDIT') {
                earned += amount;
            } else {
                spent += amount;
            }
        });
        return { spent, earned };
    }, [filteredExpenses]);

    if (expenses.length === 0) {
        return (
            <Box p={8} textAlign="center" color="gray.500" bg="white" _dark={{ bg: 'gray.800' }} borderRadius="lg" shadow="sm">
                <Text fontSize="md">No transactions recorded yet.</Text>
            </Box>
        );
    }

    const getAccountName = (id: string) => {
        const account = accounts.find(a => a.id === id);
        return account ? `${account.bankName} (${account.name})` : 'Unknown Account';
    };

    return (
        <Box>
            <HStack mb={4} spacing={4} bg="white" _dark={{ bg: 'gray.800' }} p={4} borderRadius="lg" shadow="sm" borderWidth="1px" flexWrap="wrap">
                <Text fontWeight="bold" fontSize="sm" whiteSpace="nowrap">Filters:</Text>
                <Input
                    type="date"
                    size="sm"
                    borderRadius="md"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    width="auto"
                />
                <Input
                    placeholder="Search by tags (e.g. chennai, food)"
                    size="sm"
                    borderRadius="md"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    maxW="300px"
                />
                {(filterDate || searchQuery) && (
                    <Button size="sm" variant="ghost" colorScheme="red" onClick={() => { setFilterDate(''); setSearchQuery(''); }}>
                        Clear All
                    </Button>
                )}
            </HStack>

            <TableContainer
                bg="white"
                _dark={{ bg: 'gray.800' }}
                borderRadius="lg"
                boxShadow="sm"
                borderWidth="1px"
            >
                <Table variant="simple">
                    <Thead bg="gray.50" _dark={{ bg: 'gray.700' }}>
                        <Tr>
                            <Th fontSize="xs" py={4}>Date</Th>
                            <Th fontSize="xs" py={4}>Description / Source</Th>
                            <Th fontSize="xs" py={4}>Category</Th>
                            <Th fontSize="xs" py={4}>Account</Th>
                            <Th isNumeric fontSize="xs" py={4}>Amount</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {filteredExpenses.map((expense) => {
                            const isCredit = expense.type === 'CREDIT';
                            return (
                                <Tr key={expense.id} _hover={{ bg: 'gray.50', _dark: { bg: 'gray.700' } }} transition="background 0.2s">
                                    <Td fontSize="sm">{format(new Date(expense.date), 'MMM dd, yyyy')}</Td>
                                    <Td fontSize="sm" fontWeight="medium">
                                        {expense.description || (isCredit ? 'Credit Transaction' : 'Debit Transaction')}
                                    </Td>
                                    <Td>
                                        <Badge
                                            colorScheme={isCredit ? 'green' : 'blue'}
                                            variant="subtle"
                                            px={2}
                                            borderRadius="full"
                                            textTransform="capitalize"
                                        >
                                            {expense.category}
                                        </Badge>
                                    </Td>
                                    <Td fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                                        {getAccountName(expense.accountId)}
                                    </Td>
                                    <Td isNumeric>
                                        <Text
                                            fontWeight="bold"
                                            color={isCredit ? 'green.500' : 'red.500'}
                                        >
                                            {isCredit ? '+' : '-'}₹{Number(expense.amount).toLocaleString()}
                                        </Text>
                                    </Td>
                                </Tr>
                            );
                        })}
                    </Tbody>
                    {filteredExpenses.length > 0 && (
                        <Tfoot bg="gray.50" _dark={{ bg: 'gray.700' }}>
                            <Tr>
                                <Th colSpan={4} fontSize="sm" py={3} textAlign="right" textTransform="none">Total Income:</Th>
                                <Th isNumeric fontSize="sm" py={3} color="green.500">+₹{totals.earned.toLocaleString()}</Th>
                            </Tr>
                            <Tr>
                                <Th colSpan={4} fontSize="sm" py={3} textAlign="right" textTransform="none">Total Spent:</Th>
                                <Th isNumeric fontSize="sm" py={3} color="red.500">-₹{totals.spent.toLocaleString()}</Th>
                            </Tr>
                        </Tfoot>
                    )}
                </Table>
                {filteredExpenses.length === 0 && (
                    <Box p={8} textAlign="center" color="gray.500">
                        <Text>No transactions found for this date.</Text>
                    </Box>
                )}
            </TableContainer>
        </Box>
    );
};

export default ExpenseList;
