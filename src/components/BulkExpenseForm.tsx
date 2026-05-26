import { useState } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    useDisclosure,
    useToast,
    VStack,
    HStack,
    Input,
    Select,
    IconButton,
    Text,
    Box,
    Divider
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { useData } from '../context/DataContext';

export default function BulkExpenseForm() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { accounts, addBulkExpenses } = useData();
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(false);

    // Initial empty row
    const defaultRow = {
        type: 'DEBIT',
        amount: '',
        category: '',
        description: '',
        accountId: '',
        toAccountId: '',
        date: new Date().toISOString().split('T')[0]
    };

    const [rows, setRows] = useState([defaultRow]);

    const handleAddRow = () => {
        setRows([...rows, { ...defaultRow }]);
    };

    const handleRemoveRow = (index: number) => {
        if (rows.length === 1) return; // don't remove the last row
        const newRows = [...rows];
        newRows.splice(index, 1);
        setRows(newRows);
    };

    const handleChange = (index: number, field: string, value: string) => {
        const newRows = [...rows];
        newRows[index] = { ...newRows[index], [field]: value };
        // Reset toAccountId if type changes to something other than TRANSFER
        if (field === 'type' && value !== 'TRANSFER') {
            newRows[index].toAccountId = '';
        }
        setRows(newRows);
    };

    const handleSubmit = async () => {
        // Validation
        const validRows = rows.filter(r => r.amount && r.accountId && r.category && r.description);
        
        if (validRows.length === 0) {
            toast({ title: 'No valid rows', description: 'Please fill all required fields in at least one row.', status: 'error' });
            return;
        }

        const formattedRows = validRows.map(r => ({
            type: r.type as 'CREDIT' | 'DEBIT' | 'TRANSFER',
            amount: Number(r.amount),
            category: r.category,
            description: r.description,
            accountId: r.accountId,
            toAccountId: r.type === 'TRANSFER' ? r.toAccountId : undefined,
            date: new Date(r.date).toISOString()
        }));

        setIsLoading(true);
        try {
            await addBulkExpenses(formattedRows);
            toast({ title: 'Success', description: `Added ${formattedRows.length} transactions successfully.`, status: 'success' });
            setRows([{ ...defaultRow }]);
            onClose();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to add bulk transactions.', status: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Button colorScheme="purple" onClick={onOpen} leftIcon={<AddIcon />}>
                Bulk Entry
            </Button>

            <Modal isOpen={isOpen} onClose={onClose} size="6xl">
                <ModalOverlay backdropFilter="blur(4px)" />
                <ModalContent borderRadius="xl">
                    <ModalHeader borderBottomWidth="1px">Bulk Transaction Entry</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody py={6}>
                        <VStack spacing={4} align="stretch" maxH="60vh" overflowY="auto" pr={2}>
                            {rows.map((row, index) => (
                                <Box key={index} p={4} borderWidth="1px" borderRadius="md" bg="gray.50" _dark={{ bg: 'gray.800' }}>
                                    <HStack spacing={4} align="flex-end">
                                        <Box flex={1}>
                                            <Text fontSize="sm" mb={1} fontWeight="bold">Type</Text>
                                            <Select value={row.type} onChange={(e) => handleChange(index, 'type', e.target.value)}>
                                                <option value="DEBIT">Debit / Expense</option>
                                                <option value="CREDIT">Credit / Income</option>
                                                <option value="TRANSFER">Pay Bill / Transfer</option>
                                            </Select>
                                        </Box>

                                        <Box flex={1}>
                                            <Text fontSize="sm" mb={1} fontWeight="bold">Date</Text>
                                            <Input type="date" value={row.date} onChange={(e) => handleChange(index, 'date', e.target.value)} />
                                        </Box>

                                        <Box flex={2}>
                                            <Text fontSize="sm" mb={1} fontWeight="bold">From Account</Text>
                                            <Select placeholder="Select account" value={row.accountId} onChange={(e) => handleChange(index, 'accountId', e.target.value)}>
                                                {accounts.map(acc => (
                                                    <option key={acc.id} value={acc.id}>{acc.name} (₹{acc.balance})</option>
                                                ))}
                                            </Select>
                                        </Box>

                                        {row.type === 'TRANSFER' && (
                                            <Box flex={2}>
                                                <Text fontSize="sm" mb={1} fontWeight="bold">To Account</Text>
                                                <Select placeholder="Select debt account" value={row.toAccountId} onChange={(e) => handleChange(index, 'toAccountId', e.target.value)}>
                                                    {accounts.filter(a => a.id !== row.accountId).map(acc => (
                                                        <option key={acc.id} value={acc.id}>{acc.name} (₹{acc.balance})</option>
                                                    ))}
                                                </Select>
                                            </Box>
                                        )}

                                        <Box flex={1.5}>
                                            <Text fontSize="sm" mb={1} fontWeight="bold">Category</Text>
                                            <Select placeholder="Select category" value={row.category} onChange={(e) => handleChange(index, 'category', e.target.value)}>
                                                <option value="Bills">Bills</option>
                                                <option value="Food">Food</option>
                                                <option value="Groceries">Groceries</option>
                                                <option value="Entertainment">Entertainment</option>
                                                <option value="Transport">Transport</option>
                                                <option value="Loan">Loan</option>
                                                <option value="Vehical Service">Vehical Service</option>
                                                <option value="Petrol">Petrol</option>
                                                <option value="Shopping">Shopping</option>
                                                <option value="Other">Other</option>
                                            </Select>
                                        </Box>

                                        <Box flex={2}>
                                            <Text fontSize="sm" mb={1} fontWeight="bold">Description</Text>
                                            <Input placeholder="Description" value={row.description} onChange={(e) => handleChange(index, 'description', e.target.value)} />
                                        </Box>

                                        <Box flex={1.5}>
                                            <Text fontSize="sm" mb={1} fontWeight="bold">Amount (₹)</Text>
                                            <Input type="number" placeholder="0.00" value={row.amount} onChange={(e) => handleChange(index, 'amount', e.target.value)} />
                                        </Box>

                                        <IconButton 
                                            aria-label="Remove Row" 
                                            icon={<DeleteIcon />} 
                                            colorScheme="red" 
                                            variant="ghost" 
                                            isDisabled={rows.length === 1}
                                            onClick={() => handleRemoveRow(index)}
                                        />
                                    </HStack>
                                </Box>
                            ))}
                        </VStack>

                        <Divider my={6} />
                        <Button leftIcon={<AddIcon />} variant="outline" colorScheme="blue" onClick={handleAddRow} w="full" borderStyle="dashed">
                            Add Another Transaction
                        </Button>
                    </ModalBody>

                    <ModalFooter borderTopWidth="1px" bg="gray.50" _dark={{ bg: 'gray.900' }} borderBottomRadius="xl">
                        <Button variant="ghost" mr={3} onClick={onClose} isDisabled={isLoading}>Cancel</Button>
                        <Button colorScheme="purple" onClick={handleSubmit} isLoading={isLoading}>Save All {rows.length} Transactions</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}
