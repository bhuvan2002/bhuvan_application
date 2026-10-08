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
    Box,
} from '@chakra-ui/react';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useData } from '../context/DataContext';
import type { Account, Expense } from '../types';
import { getLoanDetails } from '../utils/loanUtils';

export default function ForecloseLoanForm({ loan }: { loan: Account }) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { accounts, expenses, addExpense } = useData();
    const toast = useToast();
    const [selectedBankId, setSelectedBankId] = useState('');

    const bankAccounts = accounts.filter(a => a.type === 'BANK' || !a.type);
    const selectedBank = bankAccounts.find(a => a.id === selectedBankId);
    
    const forecloseAmount = getLoanDetails(loan, expenses)!.remainingBalance || 0;
    const canPay = selectedBank && selectedBank.balance >= forecloseAmount;

    const handleForeclose = () => {
        if (!canPay) return;

        const newExpense: Expense = {
            id: uuidv4(),
            date: new Date().toISOString().split('T')[0],
            amount: forecloseAmount,
            type: 'TRANSFER',
            category: 'Loan Foreclosure',
            description: `Foreclosure payment for ${loan.name}`,
            accountId: selectedBankId,
            toAccountId: loan.id,
        };

        try {
            addExpense(newExpense);
            toast({
                title: 'Loan Foreclosed Successfully ✓',
                description: `₹${forecloseAmount.toLocaleString()} has been paid from ${selectedBank.name}. The loan is now cleared.`,
                status: 'success',
                duration: 5000,
            });
            onClose();
        } catch (error: any) {
            toast({
                title: 'Foreclosure Failed',
                description: error.message || 'Could not record foreclosure payment.',
                status: 'error',
                duration: 4000,
            });
        }
    };

    if (forecloseAmount <= 0) return null;

    return (
        <Box mt={2} onClick={e => e.stopPropagation()}>
            <Button colorScheme="red" variant="outline" size="sm" onClick={onOpen} width="full">
                Foreclose Loan
            </Button>

            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay backdropFilter="blur(4px)" />
                <ModalContent>
                    <ModalHeader borderBottomWidth="1px" color="red.500">Confirm Loan Foreclosure</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody py={6}>
                        <VStack spacing={4} align="stretch">
                            <Box p={3} bg="red.50" _dark={{ bg: 'red.900' }} borderRadius="md" borderWidth="1px" borderColor="red.200">
                                <Text fontSize="sm" mb={2}>
                                    Foreclosing this loan will pay off the entire outstanding balance immediately and move it to your history.
                                </Text>
                                <HStack justify="space-between">
                                    <Text color="gray.600" _dark={{ color: 'gray.300' }}>Loan:</Text>
                                    <Text fontWeight="bold">{loan.name}</Text>
                                </HStack>
                                <HStack justify="space-between" mt={2}>
                                    <Text color="gray.600" _dark={{ color: 'gray.300' }}>Outstanding Balance (To Pay):</Text>
                                    <Text fontWeight="bold" color="red.500">₹{forecloseAmount.toLocaleString()}</Text>
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
                                                Insufficient funds to foreclose. You need ₹{forecloseAmount.toLocaleString()} but only have ₹{selectedBank?.balance.toLocaleString()}.
                                            </Text>
                                        ) : (
                                            <HStack justify="space-between">
                                                <Text fontSize="sm">Remaining After Foreclosure:</Text>
                                                <Text fontSize="sm" fontWeight="bold" color="green.600" _dark={{ color: 'green.300' }}>
                                                    ₹{(selectedBank!.balance - forecloseAmount).toLocaleString()}
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
                            colorScheme="red"
                            onClick={handleForeclose}
                            isDisabled={!selectedBankId || !canPay}
                        >
                            Confirm Foreclosure
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}
