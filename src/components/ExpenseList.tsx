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
} from '@chakra-ui/react';
import { useData } from '../context/DataContext';
import { format } from 'date-fns';

const ExpenseList = () => {
    const { expenses, accounts } = useData();

    if (expenses.length === 0) {
        return (
            <Box p={4} textAlign="center" color="gray.500">
                No transactions recorded.
            </Box>
        );
    }

    const getAccountName = (id: string) => {
        return accounts.find(a => a.id === id)?.name || 'Unknown';
    };

    return (
        <TableContainer bg="white" _dark={{ bg: 'gray.800' }} borderRadius="md" boxShadow="sm">
            <Table variant="simple">
                <Thead>
                    <Tr>
                        <Th>Date</Th>
                        <Th>Description</Th>
                        <Th>Category</Th>
                        <Th>Account</Th>
                        <Th isNumeric>Amount</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {expenses.map((expense) => (
                        <Tr key={expense.id}>
                            <Td>{format(new Date(expense.date), 'MMM dd, yyyy')}</Td>
                            <Td>{expense.description}</Td>
                            <Td><Badge>{expense.category}</Badge></Td>
                            <Td>{getAccountName(expense.accountId)}</Td>
                            <Td isNumeric color="red.500">-${expense.amount.toLocaleString()}</Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>
        </TableContainer>
    );
};

export default ExpenseList;
