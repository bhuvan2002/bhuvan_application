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
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    InputGroup,
    InputLeftElement,
    Input,
    Select,
} from '@chakra-ui/react';
import { DeleteIcon, InfoIcon, EditIcon, ViewIcon, SearchIcon } from '@chakra-ui/icons';
import { useData } from '../context/DataContext';
import EditAccountForm from './EditAccountForm';
import PayEmiForm from './PayEmiForm';
import ForecloseLoanForm from './ForecloseLoanForm';
import PayCCBillForm from './PayCCBillForm';
import { useState, useMemo } from 'react';
import type { Account } from '../types';
import { format, parseISO } from 'date-fns';
import { getLoanDetails } from '../utils/loanUtils';
import { getCreditCardCycleDetails, getExpenseCycleLabel } from '../utils/creditCardUtils';

const AccountList = ({ type }: { type?: 'BANK' | 'CREDIT_CARD' | 'LOAN' }) => {
    const { accounts, deleteAccount, expenses } = useData();
    const { isOpen: isInfoOpen, onOpen: onInfoOpen, onClose: onInfoClose } = useDisclosure();
    const { isOpen: isTransOpen, onOpen: onTransOpen, onClose: onTransClose } = useDisclosure();
    const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('');

    const activeAccount = accounts.find(a => a.id === selectedAccountId) || null;

    const handleCardClick = (account: Account) => {
        setSelectedAccountId(account.id);
        onInfoOpen();
    };

    const handleViewTransactions = (account: Account) => {
        setSelectedAccountId(account.id);
        setSearchQuery('');
        setFilterCategory('');
        onTransOpen();
    };

    const accountTransactions = useMemo(() => {
        return expenses.filter(e => e.accountId === selectedAccountId);
    }, [expenses, selectedAccountId]);

    const filteredTransactions = useMemo(() => {
        return accountTransactions.filter(item => {
            const matchesSearch = item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.category.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = filterCategory === '' || item.category === filterCategory;
            return matchesSearch && matchesCategory;
        });
    }, [accountTransactions, searchQuery, filterCategory]);

    const transCategories = useMemo(() => {
        const cats = new Set(accountTransactions.map(item => item.category));
        return Array.from(cats);
    }, [accountTransactions]);

    const bankAccounts = accounts.filter(a => a.type === 'BANK' || !a.type);
    const creditCards = accounts.filter(a => a.type === 'CREDIT_CARD');
    const loans = accounts.filter(a => a.type === 'LOAN');

    const isLoanCleared = (loan: Account) => {
        const details = getLoanDetails(loan, expenses);
        if (details && details.remainingBalance <= 0) return true;
        return false;
    };

    const activeLoans = loans.filter(l => !isLoanCleared(l));
    const clearedLoans = loans.filter(l => isLoanCleared(l));

    const filteredAccounts = type === 'BANK' ? bankAccounts : type === 'CREDIT_CARD' ? creditCards : type === 'LOAN' ? loans : accounts;

    if (filteredAccounts.length === 0) {
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

    const renderAccountCards = (accList: Account[], title: string, color: string) => {
        if (accList.length === 0) return null;
        return (
            <Box mb={6}>
                <Heading size="sm" mb={3} color="gray.600" textTransform="uppercase">{title}</Heading>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                    {accList.map((account) => (
                        <Card
                            key={account.id}
                            borderTop="4px"
                            borderColor={`${color}.500`}
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
                                        <IconButton
                                            aria-label="View Transactions"
                                            icon={<ViewIcon />}
                                            size="sm"
                                            variant="ghost"
                                            colorScheme="blue"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleViewTransactions(account);
                                            }}
                                            title="View Transactions"
                                        />
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
                                    <StatLabel>
                                        {account.type === 'CREDIT_CARD'
                                            ? 'Outstanding Balance'
                                            : account.type === 'LOAN'
                                                ? 'Original Amount Borrowed'
                                                : 'Available Balance'}
                                    </StatLabel>
                                    <StatNumber color={account.type === 'CREDIT_CARD' ? 'red.500' : 'inherit'}>
                                        ₹{account.balance.toLocaleString()}
                                    </StatNumber>
                                    {account.type === 'CREDIT_CARD' && (
                                        <Box mt={2} p={2} bg="gray.50" _dark={{ bg: 'gray.700' }} borderRadius="md" borderWidth="1px">
                                            {(() => {
                                                const ccDetails = getCreditCardCycleDetails(account, expenses);
                                                if (!ccDetails) return null;
                                                return (
                                                    <>
                                                        <HStack justify="space-between" mb={1}>
                                                            <Text fontSize="xs" color="gray.500">Billing Cycle:</Text>
                                                            <Text fontSize="xs" fontWeight="bold">
                                                                {format(ccDetails.currentCycleStart, 'dd MMM')} → {format(ccDetails.currentCycleEnd, 'dd MMM')}
                                                            </Text>
                                                        </HStack>
                                                        <HStack justify="space-between" mb={1}>
                                                            <Text fontSize="xs" color="gray.500">Current Spent:</Text>
                                                            <Text fontSize="xs" fontWeight="bold">
                                                                ₹{account.balance.toLocaleString()}
                                                            </Text>
                                                        </HStack>
                                                        <HStack justify="space-between" mb={1}>
                                                            <Text fontSize="xs" color="gray.500">Prev Statement:</Text>
                                                            <Text fontSize="xs" fontWeight="bold" color="red.500">
                                                                ₹{ccDetails.previousStatementAmount.toLocaleString()}
                                                            </Text>
                                                        </HStack>
                                                        <HStack justify="space-between" mb={1}>
                                                            <Text fontSize="xs" color="gray.500">Amount Due:</Text>
                                                            <Text fontSize="sm" fontWeight="bold" color="red.500">
                                                                ₹{ccDetails.outstandingStatementAmount.toLocaleString()}
                                                            </Text>
                                                        </HStack>
                                                        <HStack justify="space-between">
                                                            <Text fontSize="xs" color="gray.500">Limit Avail:</Text>
                                                            <Text fontSize="xs" fontWeight="bold">
                                                                ₹{((account.creditLimit || 0) - account.balance).toLocaleString()}
                                                            </Text>
                                                        </HStack>
                                                    </>
                                                );
                                            })()}
                                        </Box>
                                    )}
                                    {account.type === 'LOAN' && (
                                        <Box mt={2} p={2} bg="gray.50" _dark={{ bg: 'gray.700' }} borderRadius="md" borderWidth="1px">
                                            <HStack justify="space-between" mb={1}>
                                                <Text fontSize="xs" color="gray.500">Remaining Balance:</Text>
                                                <Text fontSize="sm" fontWeight="bold" color="red.500">
                                                    ₹{getLoanDetails(account, expenses)!.remainingBalance.toLocaleString()}
                                                </Text>
                                            </HStack>
                                            <HStack justify="space-between" mb={1}>
                                                <Text fontSize="xs" color="gray.500">Remaining EMIs:</Text>
                                                <Text fontSize="xs" fontWeight="bold">
                                                    {getLoanDetails(account, expenses)!.remainingEMIs}
                                                </Text>
                                            </HStack>
                                            {account.emiAmount !== undefined && (
                                                <HStack justify="space-between" mb={1}>
                                                    <Text fontSize="xs" color="gray.500">EMI:</Text>
                                                    <Text fontSize="xs" fontWeight="bold">₹{account.emiAmount.toLocaleString()} / month</Text>
                                                </HStack>
                                            )}
                                            {account.loanEndDate && (
                                                <HStack justify="space-between">
                                                    <Text fontSize="xs" color="gray.500">Ends:</Text>
                                                    <Text fontSize="xs" fontWeight="bold">{format(parseISO(account.loanEndDate), 'MMM yyyy')}</Text>
                                                </HStack>
                                            )}
                                        </Box>
                                    )}
                                </Stat>
                                <HStack mt={2} justifyContent="space-between">
                                    <Badge colorScheme={account.type === 'LOAN' && isLoanCleared(account) ? "gray" : "green"}>
                                        {account.type === 'LOAN' && isLoanCleared(account) ? "Cleared" : "Active"}
                                    </Badge>
                                    {account.dueDate && (
                                        <Text fontSize="xs" color="gray.500">Due: {account.dueDate}th</Text>
                                    )}
                                    <InfoIcon color="gray.400" />
                                </HStack>
                                {account.type === 'LOAN' && !isLoanCleared(account) && (
                                    <>
                                        <PayEmiForm loan={account} />
                                        <ForecloseLoanForm loan={account} />
                                    </>
                                )}
                                {account.type === 'CREDIT_CARD' && (
                                    <PayCCBillForm account={account} />
                                )}
                            </CardBody>
                        </Card>
                    ))}
                </SimpleGrid>
            </Box>
        );
    };

    return (
        <Box>
            {(!type || type === 'BANK') && renderAccountCards(bankAccounts, 'Bank Accounts', 'blue')}
            {(!type || type === 'CREDIT_CARD') && renderAccountCards(creditCards, 'Credit Cards', 'orange')}
            {(!type || type === 'LOAN') && (
                <>
                    {renderAccountCards(activeLoans, 'Active Loans', 'purple')}
                    {renderAccountCards(clearedLoans, 'Cleared / History Loans', 'gray')}
                </>
            )}

            {/* Account Info Modal */}
            <Modal isOpen={isInfoOpen} onClose={onInfoClose} isCentered>
                <ModalOverlay backdropFilter="blur(4px)" />
                <ModalContent shadow="2xl">
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

            {/* Account Transactions Modal */}
            <Modal isOpen={isTransOpen} onClose={onTransClose} size="4xl">
                <ModalOverlay backdropFilter="blur(4px)" />
                <ModalContent borderRadius="xl" shadow="2xl">
                    <ModalHeader borderBottomWidth="1px">
                        Transactions: {activeAccount?.bankName} ({activeAccount?.name})
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody py={6}>
                        <HStack mb={4} spacing={4}>
                            <InputGroup flex={2}>
                                <InputLeftElement pointerEvents="none">
                                    <SearchIcon color="gray.300" />
                                </InputLeftElement>
                                <Input
                                    placeholder="Search details..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </InputGroup>
                            <Select
                                flex={1}
                                placeholder="All Categories"
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                            >
                                {transCategories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </Select>
                        </HStack>

                        <Table variant="simple" size="sm">
                            <Thead>
                                <Tr>
                                    <Th>Date</Th>
                                    <Th>Description</Th>
                                    <Th>Category</Th>
                                    <Th isNumeric>Amount</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {filteredTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(e => (
                                    <Tr key={e.id}>
                                        <Td>
                                            {format(parseISO(e.date), 'MMM dd, yyyy')}
                                            {activeAccount?.type === 'CREDIT_CARD' && (
                                                <Box fontSize="xs" color="gray.500" mt={1}>
                                                    {getExpenseCycleLabel(activeAccount, e.date)}
                                                </Box>
                                            )}
                                        </Td>
                                        <Td>{e.description}</Td>
                                        <Td><Badge>{e.category}</Badge></Td>
                                        <Td isNumeric fontWeight="bold" color={e.type === 'CREDIT' ? 'green.500' : 'red.500'}>
                                            {e.type === 'CREDIT' ? '+' : '-'}₹{e.amount.toLocaleString()}
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                        {filteredTransactions.length === 0 && (
                            <Text textAlign="center" py={10} color="gray.500">
                                {accountTransactions.length === 0 ? 'No transactions for this account.' : 'No results matching your filters.'}
                            </Text>
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default AccountList;
