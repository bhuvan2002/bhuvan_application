import {
    Button,
    FormControl,
    FormLabel,
    Input,
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
    useColorModeValue,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import { useData } from '../context/DataContext';
import type { Expense } from '../types';
import { useState } from 'react';

const AddExpenseForm = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { addExpense, accounts } = useData();
    const toast = useToast();
    const [transactionType, setTransactionType] = useState<'DEBIT' | 'CREDIT'>('DEBIT');

    const { register, handleSubmit, reset, watch } = useForm<Expense>({
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            type: 'DEBIT'
        }
    });

    const onSubmit = (data: any) => {
        const newExpense: Expense = {
            ...data,
            id: uuidv4(),
            amount: Number(data.amount),
            type: transactionType,
            // For credit, if description is empty, use 'Credit to ' + bank name
            description: transactionType === 'CREDIT' && !data.description
                ? `Credit to ${accounts.find(a => a.id === data.accountId)?.bankName}`
                : data.description
        };
        addExpense(newExpense);
        toast({
            title: `${transactionType === 'CREDIT' ? 'Credit' : 'Expense'} recorded.`,
            status: 'success',
            duration: 2000,
        });
        reset();
        setTransactionType('DEBIT');
        onClose();
    };

    const activeBg = useColorModeValue('gray.100', 'gray.700');

    if (accounts.length === 0) {
        return <Button isDisabled title="Add an account first">Log Transaction</Button>;
    }

    return (
        <>
            <Button
                colorScheme="blue"
                variant="solid"
                onClick={onOpen}
                leftIcon={<span>+</span>}
                _hover={{ transform: 'translateY(-1px)', shadow: 'md' }}
            >
                Log Transaction
            </Button>

            <Modal isOpen={isOpen} onClose={onClose} size="md">
                <ModalOverlay backdropFilter="blur(4px)" />
                <ModalContent borderRadius="xl" shadow="2xl">
                    <ModalHeader borderBottomWidth="1px" py={4}>
                        <VStack align="start" spacing={1}>
                            <Text fontSize="xl" fontWeight="bold">Record Transaction</Text>
                            <Text fontSize="sm" color="gray.500" fontWeight="normal">Track your credits and debits</Text>
                        </VStack>
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody py={6}>
                        <VStack as="form" spacing={5} id="add-transaction-form" onSubmit={handleSubmit(onSubmit)}>
                            {/* Type Toggle */}
                            <FormControl>
                                <FormLabel fontSize="sm" fontWeight="bold" color="gray.600">Transaction Type</FormLabel>
                                <HStack
                                    bg={activeBg}
                                    p={1}
                                    borderRadius="lg"
                                    width="full"
                                    spacing={0}
                                >
                                    <Button
                                        flex={1}
                                        size="sm"
                                        variant={transactionType === 'DEBIT' ? 'solid' : 'ghost'}
                                        colorScheme={transactionType === 'DEBIT' ? 'red' : 'gray'}
                                        onClick={() => setTransactionType('DEBIT')}
                                        borderRadius="md"
                                    >
                                        Debit / Expense
                                    </Button>
                                    <Button
                                        flex={1}
                                        size="sm"
                                        variant={transactionType === 'CREDIT' ? 'solid' : 'ghost'}
                                        colorScheme={transactionType === 'CREDIT' ? 'green' : 'gray'}
                                        onClick={() => setTransactionType('CREDIT')}
                                        borderRadius="md"
                                    >
                                        Credit / Income
                                    </Button>
                                </HStack>
                            </FormControl>

                            <HStack width="full" spacing={4}>
                                <FormControl isRequired flex={1}>
                                    <FormLabel fontSize="sm">Date</FormLabel>
                                    <Input
                                        type="date"
                                        size="md"
                                        borderRadius="md"
                                        {...register('date', { required: true })}
                                    />
                                </FormControl>
                                <FormControl isRequired flex={1}>
                                    <FormLabel fontSize="sm">
                                        {transactionType === 'DEBIT' ? 'Amount' : 'Amount Credit'}
                                    </FormLabel>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        size="md"
                                        borderRadius="md"
                                        focusBorderColor={transactionType === 'DEBIT' ? 'red.400' : 'green.400'}
                                        {...register('amount', { required: true })}
                                    />
                                </FormControl>
                            </HStack>

                            <FormControl isRequired>
                                <FormLabel fontSize="sm">
                                    {transactionType === 'DEBIT' ? 'Paid From' : 'Bank Name'}
                                </FormLabel>
                                <Select
                                    borderRadius="md"
                                    {...register('accountId', { required: true })}
                                >
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.id}>
                                            {acc.bankName} - {acc.name} (₹{acc.balance.toLocaleString()})
                                        </option>
                                    ))}
                                </Select>
                            </FormControl>

                            {transactionType === 'DEBIT' ? (
                                <>
                                    <FormControl isRequired>
                                        <FormLabel fontSize="sm">Category</FormLabel>
                                        <Select borderRadius="md" {...register('category', { required: true })}>
                                            <option value="Bills">Bills</option>
                                            <option value="Food">Food</option>
                                            <option value="Entertainment">Entertainment</option>
                                            <option value="Transport">Transport</option>
                                            <option value="Transport">Loan</option>
                                            <option value="Shopping">Shopping</option>
                                            <option value="Other">Other</option>
                                        </Select>
                                    </FormControl>
                                    <FormControl isRequired>
                                        <FormLabel fontSize="sm">Description</FormLabel>
                                        <Input
                                            placeholder="e.g. Grocery Run"
                                            borderRadius="md"
                                            {...register('description', { required: true })}
                                        />
                                    </FormControl>
                                </>
                            ) : (
                                <VStack width="full" spacing={4}>
                                    <FormControl isRequired>
                                        <FormLabel fontSize="sm">Source of Credit</FormLabel>
                                        <Select
                                            borderRadius="md"
                                            focusBorderColor="green.400"
                                            {...register('category', { required: true })}
                                        >
                                            <option value="Salary">Salary</option>
                                            <option value="Trade">Trade</option>
                                            <option value="Interest Amount">Interest Amount</option>
                                            <option value="Loan">Loan</option>
                                            <option value="Other">Other</option>
                                        </Select>
                                    </FormControl>

                                    {watch('category') === 'Other' && (
                                        <FormControl isRequired>
                                            <FormLabel fontSize="sm">Please specify Source</FormLabel>
                                            <Input
                                                placeholder="Enter custom source"
                                                borderRadius="md"
                                                focusBorderColor="green.400"
                                                {...register('description', { required: true })}
                                            />
                                        </FormControl>
                                    )}
                                </VStack>
                            )}
                        </VStack>
                    </ModalBody>

                    <ModalFooter borderTopWidth="1px" py={4}>
                        <Button variant="ghost" mr={3} onClick={onClose} borderRadius="md">
                            Cancel
                        </Button>
                        <Button
                            colorScheme={transactionType === 'DEBIT' ? 'red' : 'green'}
                            type="submit"
                            form="add-transaction-form"
                            borderRadius="md"
                            px={8}
                        >
                            {transactionType === 'DEBIT' ? 'Record Expense' : 'Record Credit'}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default AddExpenseForm;
