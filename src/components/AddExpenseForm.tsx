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
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import { useData } from '../context/DataContext';
import type { Expense } from '../types';

const AddExpenseForm = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { addExpense, accounts } = useData();
    const toast = useToast();
    const { register, handleSubmit, reset } = useForm<Expense>();

    const onSubmit = (data: any) => {
        const newExpense: Expense = {
            ...data,
            id: uuidv4(),
            amount: Number(data.amount),
        };
        addExpense(newExpense);
        toast({
            title: 'Expense recorded.',
            status: 'success',
            duration: 2000,
        });
        reset();
        onClose();
    };

    if (accounts.length === 0) {
        return <Button isDisabled title="Add an account first">Log Expense</Button>;
    }

    return (
        <>
            <Button colorScheme="red" variant="outline" onClick={onOpen}>Log Expense</Button>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Record Expense</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack as="form" spacing={4} id="add-expense-form" onSubmit={handleSubmit(onSubmit)}>
                            <FormControl isRequired>
                                <FormLabel>Date</FormLabel>
                                <Input type="date" {...register('date', { required: true })} />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Description</FormLabel>
                                <Input placeholder="e.g. Grocery Run" {...register('description', { required: true })} />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Category</FormLabel>
                                <Select {...register('category', { required: true })}>
                                    <option value="Bills">Bills</option>
                                    <option value="Food">Food</option>
                                    <option value="Entertainment">Entertainment</option>
                                    <option value="Transport">Transport</option>
                                    <option value="Shopping">Shopping</option>
                                    <option value="Other">Other</option>
                                </Select>
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Amount</FormLabel>
                                <Input type="number" step="0.01" {...register('amount', { required: true })} />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Paid From</FormLabel>
                                <Select {...register('accountId', { required: true })}>
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.id}>{acc.name} (₹{acc.balance})</option>
                                    ))}
                                </Select>
                            </FormControl>
                        </VStack>
                    </ModalBody>

                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
                        <Button colorScheme="red" type="submit" form="add-expense-form">Record</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default AddExpenseForm;
