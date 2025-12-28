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
    HStack,
    IconButton,
    Spacer,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    VStack,
    Divider,
    Icon,
    Button,
} from '@chakra-ui/react';
import { DeleteIcon, InfoIcon, EditIcon } from '@chakra-ui/icons';
import { useData } from '../context/DataContext';
import EditAccountForm from './EditAccountForm';
import { useState } from 'react';
import type { Account } from '../types';

const AccountList = () => {
    const { accounts, deleteAccount } = useData();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

    const activeAccount = accounts.find(a => a.id === selectedAccountId) || null;

    const handleCardClick = (account: Account) => {
        setSelectedAccountId(account.id);
        onOpen();
    };

    if (accounts.length === 0) {
        return (
            <Box p={4} textAlign="center" color="gray.500">
                No accounts added yet.
            </Box>
        );
    }

    const DetailItem = ({ label, value }: { label: string, value: string | number | undefined }) => (
        <Box>
            <HStack justifyContent="space-between">
                <Text fontSize="xs" color="gray.500" textTransform="uppercase" fontWeight="bold">{label}</Text>
                {activeAccount && (
                    <EditAccountForm account={activeAccount}>
                        <Icon as={EditIcon} w={3} h={3} color="blue.500" _hover={{ color: 'blue.700' }} />
                    </EditAccountForm>
                )}
            </HStack>
            <Text fontSize="md" fontWeight="medium">{value || 'Not provided'}</Text>
        </Box>
    );

    return (
        <Box>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                {accounts.map((account) => (
                    <Card
                        key={account.id}
                        borderTop="4px"
                        borderColor="blue.500"
                        cursor="pointer"
                        _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
                        transition="all 0.2s"
                        onClick={() => handleCardClick(account)}
                    >
                        <CardHeader pb={0}>
                            <HStack>
                                <Box>
                                    <Heading size="md">{account.name}</Heading>
                                    <Text fontSize="sm" color="gray.500">{account.bankName}</Text>
                                </Box>
                                <Spacer />
                                <HStack spacing={1} onClick={(e) => e.stopPropagation()}>
                                    <EditAccountForm account={account} />
                                    <IconButton
                                        aria-label="Delete account"
                                        icon={<DeleteIcon />}
                                        size="sm"
                                        variant="ghost"
                                        colorScheme="red"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (window.confirm('Are you sure you want to delete this account?')) {
                                                deleteAccount(account.id);
                                            }
                                        }}
                                    />
                                </HStack>
                            </HStack>
                        </CardHeader>
                        <CardBody>
                            <Stat>
                                <StatLabel>Balance</StatLabel>
                                <StatNumber>₹{account.balance.toLocaleString()}</StatNumber>
                            </Stat>
                            <HStack mt={2} justifyContent="space-between">
                                <Badge colorScheme="green">Active</Badge>
                                <InfoIcon color="gray.400" />
                            </HStack>
                        </CardBody>
                    </Card>
                ))}
            </SimpleGrid>

            {/* Account Detail Modal */}
            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay backdropFilter="blur(4px)" />
                <ModalContent>
                    <ModalHeader borderBottomWidth="1px">
                        <HStack justifyContent="space-between">
                            <VStack align="start" spacing={0}>
                                <Text fontSize="lg">{activeAccount?.name}</Text>
                                <Text fontSize="sm" color="gray.500" fontWeight="normal">{activeAccount?.bankName}</Text>
                            </VStack>
                            <Box mr={8}>
                                {activeAccount && <EditAccountForm account={activeAccount} />}
                            </Box>
                        </HStack>
                    </ModalHeader>
                    <ModalCloseButton title="Close" />
                    <ModalBody py={6}>
                        <VStack spacing={4} align="stretch">
                            <DetailItem label="Account Number" value={activeAccount?.accountNumber} />
                            <Divider />
                            <DetailItem label="IFSC Code" value={activeAccount?.ifsc} />
                            <Divider />
                            <DetailItem label="Mobile App Key" value={activeAccount?.mobileAppKey} />
                            <Divider />
                            <DetailItem label="ATM Pin / Key" value={activeAccount?.atmKey} />
                            <Divider />
                            <Box pt={2}>
                                <HStack justifyContent="space-between" align="end">
                                    <Stat>
                                        <StatLabel fontSize="xs" color="gray.500" textTransform="uppercase" fontWeight="bold">Current Balance</StatLabel>
                                        <StatNumber fontSize="2xl" color="blue.600">₹{activeAccount?.balance.toLocaleString()}</StatNumber>
                                    </Stat>
                                    {activeAccount && (
                                        <EditAccountForm account={activeAccount}>
                                            <Button size="xs" colorScheme="blue" variant="link">Update Balance</Button>
                                        </EditAccountForm>
                                    )}
                                </HStack>
                            </Box>
                        </VStack>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default AccountList;
