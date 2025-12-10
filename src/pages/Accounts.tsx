import { Heading, Box, HStack, Divider, VStack } from '@chakra-ui/react';
import AccountList from '../components/AccountList';
import ExpenseList from '../components/ExpenseList';
import AddAccountForm from '../components/AddAccountForm';
import AddExpenseForm from '../components/AddExpenseForm';
import { useAuth } from '../context/AuthContext';

const Accounts = () => {
    const { user } = useAuth();
    const isTrader = user?.role === 'TRADER';

    return (
        <VStack spacing={6} align="stretch">
            <HStack justifyContent="space-between">
                <Heading size="lg">Accounts & Finance</Heading>
                {isTrader && (
                    <HStack>
                        <AddAccountForm />
                        <AddExpenseForm />
                    </HStack>
                )}
            </HStack>

            <Box>
                <Heading size="md" mb={4}>My Accounts</Heading>
                <AccountList />
            </Box>

            <Divider />

            <Box>
                <Heading size="md" mb={4}>Recent Transactions</Heading>
                <ExpenseList />
            </Box>
        </VStack>
    );
};

export default Accounts;
