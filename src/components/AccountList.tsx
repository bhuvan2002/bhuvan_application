import {
    Box,
    SimpleGrid,
    Text,
    Card,
    CardHeader,
    CardBody,
    Heading,
    Stat,
    StatLabel,
    StatNumber,
    Badge,
} from '@chakra-ui/react';
import { useData } from '../context/DataContext';

const AccountList = () => {
    const { accounts } = useData();

    if (accounts.length === 0) {
        return (
            <Box p={4} textAlign="center" color="gray.500">
                No accounts added yet.
            </Box>
        );
    }

    return (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
            {accounts.map((account) => (
                <Card key={account.id} borderTop="4px" borderColor="blue.500">
                    <CardHeader pb={0}>
                        <Heading size="md">{account.name}</Heading>
                        <Text fontSize="sm" color="gray.500">{account.bankName}</Text>
                    </CardHeader>
                    <CardBody>
                        <Stat>
                            <StatLabel>Balance</StatLabel>
                            <StatNumber>${account.balance.toLocaleString()}</StatNumber>
                        </Stat>
                        <Badge mt={2} colorScheme="green">Active</Badge>
                    </CardBody>
                </Card>
            ))}
        </SimpleGrid>
    );
};

export default AccountList;
