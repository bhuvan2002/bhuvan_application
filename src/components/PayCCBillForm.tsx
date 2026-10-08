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
    Input,
    InputGroup,
    InputLeftElement,
} from '@chakra-ui/react';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useData } from '../context/DataContext';
import type { Account, Expense } from '../types';
import { getCreditCardCycleDetails } from '../utils/creditCardUtils';

export default function PayCCBillForm({ account }: { account: Account }) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { accounts, expenses, addExpense } = useData();
    const toast = useToast();
    const ccDetails = getCreditCardCycleDetails(account, expenses);
    if (!ccDetails) return null;
    const amountDue = ccDetails.outstandingStatementAmount;
    
    const [selectedBankId, setSelectedBankId] = useState('');
    const [payAmount, setPayAmount] = useState<number | ''>(amountDue > 0 ? amountDue : account.balance);

    const bankAccounts = accounts.filter(a => a.type === 'BANK' || !a.type);
    
    const selectedBank = bankAccounts.find(a => a.id === selectedBankId);
    const validAmount = Number(payAmount) > 0;
    const canPay = selectedBank && validAmount && selectedBank.balance >= Number(payAmount);

    const handlePayBill = () => {
        if (!canPay) return;

        const newExpense: Expense = {
            id: uuidv4(),
            date: new Date().toISOString().split('T')[0],
            amount: Number(payAmount),
            type: 'TRANSFER',
            category: 'CC Bill Payment',
            description: `Payment for ${account.name}`,
            accountId: selectedBankId,
            toAccountId: account.id,
        };

        try {
            addExpense(newExpense);
            toast({
                title: 'Payment Successful ✓',
                description: `₹${Number(payAmount).toLocaleString()} has been deducted from ${selectedBank.name}.`,
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

    if (account.balance <= 0 && amountDue === 0 && ccDetails.previousStatementAmount > 0) {
        return (
            <VStack align="start" spacing={1} mt={4} p={3} bg="green.50" _dark={{ bg: 'green.900' }} borderRadius="md" borderWidth="1px" borderColor="green.200">
                <HStack>
                    <Badge colorScheme="green" fontSize="sm" px={2} py={1}>All Cleared ✓</Badge>
                </HStack>
                <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.300' }}>
                    No outstanding balance.
                </Text>
            </VStack>
        );
    }
    
    if (account.balance <= 0 && amountDue === 0) {
        return (
            <Box mt={4} onClick={e => e.stopPropagation()}>
                <Button colorScheme="cyan" size="sm" width="full" isDisabled>
                    No Balance Due
                </Button>
            </Box>
        );
    }

    return (
        <Box mt={4} onClick={e => e.stopPropagation()}>
            <Button colorScheme="cyan" size="sm" onClick={onOpen} width="full">
                Pay CC Bill
            </Button>

            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay backdropFilter="blur(4px)" />
                <ModalContent>
                    <ModalHeader borderBottomWidth="1px">Confirm CC Bill Payment</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody py={6}>
                        <VStack spacing={4} align="stretch">
                            <Box p={3} bg="gray.50" _dark={{ bg: 'gray.700' }} borderRadius="md">
                                <HStack justify="space-between">
                                    <Text color="gray.500">Credit Card:</Text>
                                    <Text fontWeight="bold">{account.name}</Text>
                                </HStack>
                                <HStack justify="space-between" mt={2}>
                                    <Text color="gray.500">Statement Due:</Text>
                                    <Text fontWeight="bold" color={amountDue > 0 ? "cyan.600" : "green.500"}>₹{amountDue.toLocaleString()}</Text>
                                </HStack>
                                <HStack justify="space-between" mt={2}>
                                    <Text color="gray.500">Total Owed:</Text>
                                    <Text fontWeight="bold" color="red.500">₹{account.balance.toLocaleString()}</Text>
                                </HStack>
                            </Box>

                            <FormControl isRequired>
                                <FormLabel>Amount to Pay</FormLabel>
                                <InputGroup>
                                    <InputLeftElement pointerEvents="none" color="gray.500" children="₹" />
                                    <Input 
                                        type="number" 
                                        value={payAmount} 
                                        onChange={(e) => setPayAmount(e.target.value === '' ? '' : Number(e.target.value))} 
                                        min={1}
                                        max={account.balance}
                                    />
                                </InputGroup>
                            </FormControl>

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
                        </VStack>
                    </ModalBody>
                    <ModalFooter borderTopWidth="1px">
                        <Button variant="ghost" mr={3} onClick={onClose}>
                            Cancel
                        </Button>
                        <Button 
                            colorScheme="cyan" 
                            onClick={handlePayBill} 
                            isDisabled={!selectedBankId || !canPay}
                        >
                            {selectedBank && !canPay ? 'Insufficient Balance' : 'Confirm Payment'}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}
