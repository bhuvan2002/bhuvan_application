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
    Text,
} from '@chakra-ui/react';
import { useData } from '../context/DataContext';
import { format } from 'date-fns';

const ExpenseList = () => {
    const { expenses, accounts } = useData();

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
                    {expenses.map((expense) => {
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
                                        {isCredit ? '+' : '-'}₹{expense.amount.toLocaleString()}
                                    </Text>
                                </Td>
                            </Tr>
                        );
                    })}
                </Tbody>
            </Table>
        </TableContainer>
    );
};

export default ExpenseList;
