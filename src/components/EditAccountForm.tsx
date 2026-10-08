import {
    IconButton,
    FormControl,
    FormLabel,
    Input,
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
    Button,
    Box,
} from '@chakra-ui/react';
import { EditIcon } from '@chakra-ui/icons';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useData } from '../context/DataContext';
import type { Account } from '../types';

interface EditAccountFormProps {
    account: Account;
    children?: React.ReactNode;
}

const EditAccountForm = ({ account, children }: EditAccountFormProps) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { updateAccount } = useData();
    const toast = useToast();
    const { register, handleSubmit, unregister } = useForm<Account>({
        values: {
            ...account,
            // Ensure loanEndDate is in YYYY-MM-DD format for the date input
            loanEndDate: account.loanEndDate ? account.loanEndDate.split('T')[0] : ''
        } as Account,
        shouldUnregister: true
    });

    useEffect(() => {
        if (account.type === 'LOAN') {
            unregister(['bankName', 'accountNumber', 'ifsc', 'mobileAppKey', 'atmKey', 'creditLimit']);
        }
    }, [account.type, unregister]);

    const onSubmit = (data: Account) => {
        updateAccount({
            ...account, // Include original properties like id and type
            ...data,
            balance: Number(data.balance),
            creditLimit: data.creditLimit ? Number(data.creditLimit) : null,
            dueDate: data.dueDate ? Number(data.dueDate) : null,
            billingCycle: data.billingCycle ? Number(data.billingCycle) : null,
            emiAmount: data.emiAmount ? Number(data.emiAmount) : undefined,
        });
        toast({
            title: 'Account updated.',
            status: 'success',
            duration: 2000,
        });
        onClose();
    };

    const onError = (errors: any) => {
        const errorFields = Object.keys(errors).join(', ');
        console.error("Form validation errors:", errors);
        toast({
            title: 'Validation Error',
            description: `Required fields missing or invalid: ${errorFields}`,
            status: 'error',
            duration: 5000,
        });
    };

    return (
        <>
            {children ? (
                <Box onClick={onOpen} cursor="pointer" display="inline-block">
                    {children}
                </Box>
            ) : (
                <IconButton
                    aria-label="Edit account"
                    icon={<EditIcon />}
                    size="sm"
                    variant="ghost"
                    colorScheme="blue"
                    onClick={onOpen}
                />
            )}

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Edit Financial Account</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack as="form" spacing={4} id={`edit-account-form-${account.id}`} onSubmit={handleSubmit(onSubmit, onError)}>
                            <FormControl isRequired>
                                <FormLabel>{account.type === 'LOAN' ? 'Loan Name' : 'Account Name'}</FormLabel>
                                <Input {...register('name', { required: true })} />
                            </FormControl>
                            {account.type !== 'LOAN' && (
                                <>
                                    <FormControl isRequired>
                                        <FormLabel>Bank Name</FormLabel>
                                        <Input {...register('bankName', { required: true })} />
                                    </FormControl>
                                    <FormControl isRequired>
                                        <FormLabel>Account Number</FormLabel>
                                        <Input {...register('accountNumber', { required: true })} />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>IFSC Code</FormLabel>
                                        <Input {...register('ifsc')} />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Mobile App Key (Optional)</FormLabel>
                                        <Input {...register('mobileAppKey')} />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>ATM Pin / Key (Optional)</FormLabel>
                                        <Input {...register('atmKey')} />
                                    </FormControl>
                                </>
                            )}

                            {account.type === 'CREDIT_CARD' && (
                                <>
                                    <FormControl isRequired>
                                        <FormLabel>Credit Limit</FormLabel>
                                        <Input type="number" {...register('creditLimit', { required: true })} />
                                    </FormControl>
                                    <FormControl isRequired>
                                        <FormLabel>Statement/Billing Cycle Date (Day of Month)</FormLabel>
                                        <Input type="number" min={1} max={31} {...register('billingCycle', { required: true })} />
                                    </FormControl>
                                    <FormControl isRequired>
                                        <FormLabel>Due Date (Day of Month)</FormLabel>
                                        <Input type="number" min={1} max={31} {...register('dueDate', { required: true })} />
                                    </FormControl>
                                </>
                            )}

                            {account.type === 'LOAN' && (
                                <>
                                    <FormControl isRequired>
                                        <FormLabel>Monthly EMI Amount (Amount Deducted)</FormLabel>
                                        <Input type="number" step="0.01" {...register('emiAmount', { required: true })} />
                                    </FormControl>
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
                                    {account.type === 'BANK' ? 'Current Balance' : 'Amount Owed / Outstanding Balance'}
                                </FormLabel>
                                <Input type="number" step="0.01" {...register('balance', { required: true })} />
                            </FormControl>
                        </VStack>
                    </ModalBody>

                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
                        <Button colorScheme="blue" type="submit" form={`edit-account-form-${account.id}`}>Update Account</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default EditAccountForm;
