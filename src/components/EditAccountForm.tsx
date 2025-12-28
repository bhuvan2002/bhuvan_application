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
    const { register, handleSubmit } = useForm<Account>({
        values: account // Use 'values' to keep it synced with state updates
    });

    const onSubmit = (data: Account) => {
        updateAccount({
            ...data,
            balance: Number(data.balance),
        });
        toast({
            title: 'Account updated.',
            status: 'success',
            duration: 2000,
        });
        onClose();
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
                        <VStack as="form" spacing={4} id={`edit-account-form-${account.id}`} onSubmit={handleSubmit(onSubmit)}>
                            <FormControl isRequired>
                                <FormLabel>Account Name</FormLabel>
                                <Input {...register('name', { required: true })} />
                            </FormControl>
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
                            <FormControl isRequired>
                                <FormLabel>Current Balance</FormLabel>
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
