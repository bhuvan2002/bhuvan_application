import {
    Box,
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
import type { Account } from '../types';

const AddAccountForm = ({ children }: { children?: React.ReactNode }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { addAccount } = useData();
    const toast = useToast();
    const { register, handleSubmit, reset, watch } = useForm<Account>({
        defaultValues: { type: 'BANK' }
    });
    const accountType = watch('type');

    const onSubmit = (data: any) => {
        const newAccount: Account = {
            ...data,
            id: uuidv4(),
            balance: Number(data.balance),
            creditLimit: data.creditLimit ? Number(data.creditLimit) : null,
            dueDate: data.dueDate ? Number(data.dueDate) : null,
        };
        addAccount(newAccount);
        toast({
            title: 'Account created.',
            status: 'success',
            duration: 2000,
        });
        reset();
        onClose();
    };

    return (
        <>
            {children ? (
                <Box onClick={onOpen} display="inline-block" width="full">
                    {children}
                </Box>
            ) : (
                <Button colorScheme="blue" onClick={onOpen}>Add New Account</Button>
            )}

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Add Financial Account</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack as="form" spacing={4} id="add-account-form" onSubmit={handleSubmit(onSubmit)}>
                            <FormControl isRequired>
                                <FormLabel>Account Type</FormLabel>
                                <Select {...register('type', { required: true })}>
                                    <option value="BANK">Bank Account</option>
                                    <option value="CREDIT_CARD">Credit Card</option>
                                    <option value="LOAN">Loan</option>
                                </Select>
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>{accountType === 'LOAN' ? 'Loan Name' : 'Account Name'}</FormLabel>
                                <Input placeholder="e.g. Chase Checking" {...register('name', { required: true })} />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Bank Name</FormLabel>
                                <Input placeholder="e.g. Chase" {...register('bankName', { required: true })} />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Account Number</FormLabel>
                                <Input placeholder="Full account number" {...register('accountNumber', { required: true })} />
                            </FormControl>
                            <FormControl>
                                <FormLabel>IFSC Code</FormLabel>
                                <Input placeholder="e.g. SBIN0001234" {...register('ifsc')} />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Mobile App Key (Optional)</FormLabel>
                                <Input placeholder="App login key" {...register('mobileAppKey')} />
                            </FormControl>
                            <FormControl>
                                <FormLabel>ATM Pin / Key (Optional)</FormLabel>
                                <Input placeholder="ATM secret" {...register('atmKey')} />
                            </FormControl>
                            
                            {accountType === 'CREDIT_CARD' && (
                                <>
                                    <FormControl isRequired>
                                        <FormLabel>Credit Limit</FormLabel>
                                        <Input type="number" {...register('creditLimit', { required: true })} />
                                    </FormControl>
                                    <FormControl isRequired>
                                        <FormLabel>Due Date (Day of Month)</FormLabel>
                                        <Input type="number" min={1} max={31} {...register('dueDate', { required: true })} />
                                    </FormControl>
                                </>
                            )}

                            {accountType === 'LOAN' && (
                                <>
                                    <FormControl isRequired>
                                        <FormLabel>EMI Due Date (Day of Month)</FormLabel>
                                        <Input type="number" min={1} max={31} {...register('dueDate', { required: true })} />
                                    </FormControl>
                                    <FormControl isRequired>
                                        <FormLabel>Loan End Date</FormLabel>
                                        <Input type="date" {...register('loanEndDate', { required: true })} />
                                    </FormControl>
                                </>
                            )}

                            <FormControl isRequired>
                                <FormLabel>
                                    {accountType === 'BANK' ? 'Current Balance' : 'Amount Owed / Outstanding Balance'}
                                </FormLabel>
                                <Input type="number" step="0.01" {...register('balance', { required: true })} />
                            </FormControl>
                        </VStack>
                    </ModalBody>

                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
                        <Button colorScheme="blue" type="submit" form="add-account-form">Save Account</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default AddAccountForm;
