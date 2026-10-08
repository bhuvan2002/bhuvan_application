import {
    Button,
    FormControl,
    FormLabel,
    Select,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    useToast,
    VStack,
    HStack,
    Text,
    Badge,
    Box,
} from '@chakra-ui/react';
import { useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useData } from '../context/DataContext';
import type { Account, Expense } from '../types';
import { format, isSameMonth, isSameYear, parseISO, addMonths, setDate } from 'date-fns';

export default function PayEmiForm({ loan }: { loan: Account }) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { accounts, expenses, addExpense } = useData();
    const toast = useToast();
    const [selectedBankId, setSelectedBankId] = useState('');

    const bankAccounts = accounts.filter(a => a.type === 'BANK' || !a.type);

    // Calculate if EMI is already paid this month
    const emiPaidThisMonth = useMemo(() => {
        let paid = 0;
        expenses.forEach(e => {
            const isCurrentMonth = isSameMonth(parseISO(e.date), new Date()) && isSameYear(parseISO(e.date), new Date());
            if (isCurrentMonth) {
                // If it's a transfer to the loan account or a direct credit
                if ((e.toAccountId === loan.id && e.type === 'TRANSFER') || (e.accountId === loan.id && e.type === 'CREDIT')) {
                    paid += e.amount;
                }
            }
        });
        return paid >= (loan.emiAmount || 0);
    }, [expenses, loan.id, loan.emiAmount]);

    // Calculate next due date
    const nextDueDate = useMemo(() => {
        const today = new Date();
        const dueDay = loan.dueDate || 1;
        let nextDate = setDate(today, dueDay);
        
        if (emiPaidThisMonth || today.getDate() > dueDay) {
            nextDate = addMonths(nextDate, 1);
        }
        return nextDate;
    }, [loan.dueDate, emiPaidThisMonth]);

    const selectedBank = bankAccounts.find(a => a.id === selectedBankId);
    const emiAmount = loan.emiAmount || 0;
    const canPay = selectedBank && selectedBank.balance >= emiAmount;

    const handlePayEmi = () => {
        if (!canPay) return;

        const newExpense: Expense = {
            id: uuidv4(),
            date: new Date().toISOString().split('T')[0],
            amount: emiAmount,
            type: 'TRANSFER',
            category: 'EMI Payment',
            description: `EMI Payment for ${loan.name}`,
            accountId: selectedBankId,
            toAccountId: loan.id,
        };

        try {
            addExpense(newExpense);
            toast({
                title: 'EMI Paid Successfully ✓',
                description: `₹${emiAmount.toLocaleString()} has been deducted from ${selectedBank.name}.`,
                status: 'success',
                duration: 4000,
            });
            onClose();
        } catch (error: any) {
            toast({
                title: 'Payment Failed',
                description: error.message || 'Could not record payment.',
                status: 'error',
                duration: 4000,
            });
        }
    };

    if (!loan.emiAmount) return null;

    if (emiPaidThisMonth) {
        return (
            <VStack align="start" spacing={1} mt={4} p={3} bg="green.50" _dark={{ bg: 'green.900' }} borderRadius="md" borderWidth="1px" borderColor="green.200">
                <HStack>
                    <Badge colorScheme="green" fontSize="sm" px={2} py={1}>EMI Paid ✓</Badge>
                </HStack>
                <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.300' }}>
                    Next EMI Due: {format(nextDueDate, 'MMM dd, yyyy')}
                </Text>
            </VStack>
        );
    }

    return (
        <Box mt={4} onClick={e => e.stopPropagation()}>
            <Button colorScheme="blue" size="sm" onClick={onOpen} width="full">
                Pay EMI
            </Button>

            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay backdropFilter="blur(4px)" />
                <ModalContent>
                    <ModalHeader borderBottomWidth="1px">Confirm EMI Payment</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody py={6}>
                        <VStack spacing={4} align="stretch">
                            <Box p={3} bg="gray.50" _dark={{ bg: 'gray.700' }} borderRadius="md">
                                <HStack justify="space-between">
                                    <Text color="gray.500">Loan:</Text>
                                    <Text fontWeight="bold">{loan.name}</Text>
                                </HStack>
                                <HStack justify="space-between" mt={2}>
                                    <Text color="gray.500">This Month's EMI:</Text>
                                    <Text fontWeight="bold" color="blue.500">₹{emiAmount.toLocaleString()}</Text>
                                </HStack>
                                <HStack justify="space-between" mt={2}>
                                    <Text color="gray.500">Due Date:</Text>
                                    <Text fontWeight="bold">{format(nextDueDate, 'MMMM dd, yyyy')}</Text>
                                </HStack>
                            </Box>

                            <FormControl isRequired>
                                <FormLabel>Pay From (Select Bank Account)</FormLabel>
                                <Select
                                    placeholder="Select account"
                                    value={selectedBankId}
                                    onChange={(e) => setSelectedBankId(e.target.value)}
                                >
                                    {bankAccounts.map(bank => (
                                        <option key={bank.id} value={bank.id}>
                                            {bank.name} (Bal: ₹{bank.balance.toLocaleString()})
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>

                            {selectedBankId && (
                                <Box p={3} borderWidth="1px" borderRadius="md" borderColor={canPay ? 'green.300' : 'red.300'} bg={canPay ? 'green.50' : 'red.50'} _dark={{ bg: canPay ? 'green.900' : 'red.900' }}>
                                    <VStack align="stretch" spacing={1}>
                                        <HStack justify="space-between">
                                            <Text fontSize="sm">Available Balance:</Text>
                                            <Text fontSize="sm" fontWeight="bold">₹{selectedBank?.balance.toLocaleString()}</Text>
                                        </HStack>
                                        
                                        {!canPay ? (
                                            <Text color="red.500" fontSize="sm" mt={2} fontWeight="bold">
                                                Insufficient balance. Your selected account has ₹{selectedBank?.balance.toLocaleString()}, but this EMI requires ₹{emiAmount.toLocaleString()}.
                                            </Text>
                                        ) : (
                                            <HStack justify="space-between">
                                                <Text fontSize="sm">Remaining After Payment:</Text>
                                                <Text fontSize="sm" fontWeight="bold" color="green.600" _dark={{ color: 'green.300' }}>
                                                    ₹{(selectedBank!.balance - emiAmount).toLocaleString()}
                                                </Text>
                                            </HStack>
                                        )}
                                    </VStack>
                                </Box>
                            )}
                        </VStack>
                    </ModalBody>
                    <ModalFooter borderTopWidth="1px">
                        <Button variant="ghost" mr={3} onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            colorScheme="blue"
                            onClick={handlePayEmi}
                            isDisabled={!selectedBankId || !canPay}
                        >
                            Pay EMI
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}
