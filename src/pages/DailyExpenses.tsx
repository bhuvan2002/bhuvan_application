import {
    Box,
    Flex,
    Heading,
    Text,
    Button,
    SimpleGrid,
    Card,
    CardBody,
    Stat,
    StatLabel,
    StatNumber,
    HStack,
    VStack,
    Input,
    Select,
    InputGroup,
    InputLeftElement,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Badge,
    IconButton,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    FormControl,
    FormLabel,
    useToast,
    useColorModeValue,
    Tooltip
} from '@chakra-ui/react';
import { SearchIcon, DeleteIcon, EditIcon, AddIcon } from '@chakra-ui/icons';
import { useData } from '../context/DataContext';
import { useState, useMemo } from 'react';
import { format, isToday, isSameWeek, isSameMonth, parseISO } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import type { Expense } from '../types';

export default function DailyExpenses() {
    const { expenses, accounts, addExpense, updateExpense, deleteExpense } = useData();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterAccountId, setFilterAccountId] = useState('');

    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

    // Form state
    const [formDate, setFormDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [formCategory, setFormCategory] = useState('');
    const [formAmount, setFormAmount] = useState('');
    const [formAccountId, setFormAccountId] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formType, setFormType] = useState<'DEBIT' | 'CREDIT' | 'TRANSFER'>('DEBIT');
    const [formToAccountId, setFormToAccountId] = useState('');

    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const hoverBg = useColorModeValue('gray.50', 'gray.700');

    // Totals
    const { todayTotal, weekTotal, monthTotal } = useMemo(() => {
        const now = new Date();
        let today = 0, week = 0, month = 0, debit = 0;

        expenses.forEach(e => {
            const isLiabilityPayment = e.type === 'TRANSFER' && (e.category === 'CC Bill Payment' || e.category === 'EMI Payment');
            if (e.type === 'DEBIT' || !e.type || isLiabilityPayment) {
                const amt = Number(e.amount);
                const d = parseISO(e.date);
                debit += amt;
                if (isToday(d)) today += amt;
                if (isSameWeek(d, now)) week += amt;
                if (isSameMonth(d, now)) month += amt;
            }
        });
        return { todayTotal: today, weekTotal: week, monthTotal: month, debitTotal: debit };
    }, [expenses]);

    const filteredExpenses = useMemo(() => {
        return expenses.filter(e => {
            let match = true;
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                match = match && Boolean((e.description && e.description.toLowerCase().includes(q)) || (e.category && e.category.toLowerCase().includes(q)));
            }
            if (filterDate) {
                match = match && format(parseISO(e.date), 'yyyy-MM-dd') === filterDate;
            }
            if (filterCategory) {
                match = match && e.category === filterCategory;
            }
            if (filterAccountId) {
                match = match && (e.accountId === filterAccountId || e.toAccountId === filterAccountId);
            }
            return match;
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [expenses, searchQuery, filterDate, filterCategory, filterAccountId]);

    const groupedByDate = useMemo(() => {
        const groups: Record<string, Expense[]> = {};
        filteredExpenses.forEach(e => {
            const d = format(parseISO(e.date), 'MMMM dd, yyyy');
            if (!groups[d]) groups[d] = [];
            groups[d].push(e);
        });
        return groups;
    }, [filteredExpenses]);

    const categories = useMemo(() => {
        return Array.from(new Set(expenses.map(e => e.category))).filter(Boolean);
    }, [expenses]);

    const defaultCategories = [
        "Food & Dining", "Groceries", "Transportation", "Shopping", "Bills & Utilities", 
        "Entertainment", "Health", "Education", "Travel", "Rent / Housing", "Personal", "Subscriptions", "Other"
    ];

    const bankAccounts = accounts.filter(a => a.type === 'BANK' || !a.type);
    const creditCards = accounts.filter(a => a.type === 'CREDIT_CARD');

    const handleAddClick = () => {
        setEditingExpense(null);
        setFormDate(format(new Date(), 'yyyy-MM-dd'));
        setFormCategory(defaultCategories[0]);
        setFormAmount('');
        setFormAccountId('');
        setFormDescription('');
        setFormType('DEBIT');
        setFormToAccountId('');
        onOpen();
    };

    const handleEditClick = (e: Expense) => {
        setEditingExpense(e);
        setFormDate(format(parseISO(e.date), 'yyyy-MM-dd'));
        setFormCategory(e.category);
        setFormAmount(e.amount.toString());
        setFormAccountId(e.accountId);
        setFormDescription(e.description);
        setFormType(e.type || 'DEBIT');
        setFormToAccountId(e.toAccountId || '');
        onOpen();
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this expense? This will reverse the transaction.')) {
            await deleteExpense(id);
            toast({ title: 'Expense deleted', status: 'success', duration: 2000 });
        }
    };

    const handleSave = async () => {
        const finalCategory = formType === 'TRANSFER' ? (formCategory || 'Bank Transfer') : formCategory;
        if (!formAmount || !formAccountId || !finalCategory || !formDate) {
            toast({ title: 'Please fill all required fields', status: 'warning', duration: 2000 });
            return;
        }
        if (formType === 'TRANSFER' && !formToAccountId) {
            toast({ title: 'Please select a transfer destination', status: 'warning', duration: 2000 });
            return;
        }

        const data: any = {
            date: new Date(formDate).toISOString(),
            category: finalCategory,
            amount: Number(formAmount),
            accountId: formAccountId,
            description: formDescription,
            type: formType,
            toAccountId: formToAccountId || null
        };

        if (editingExpense) {
            await updateExpense({ ...editingExpense, ...data });
            toast({ title: 'Expense updated', status: 'success', duration: 2000 });
        } else {
            await addExpense({ ...data, id: uuidv4() });
            toast({ title: 'Expense added', status: 'success', duration: 2000 });
        }
        onClose();
    };

    const getAccountName = (id: string) => {
        const acc = accounts.find(a => a.id === id);
        return acc ? `${acc.bankName || acc.name}` : 'Unknown';
    };

    return (
        <Box w="full" mx="auto" py={6}>
            <Flex justify="space-between" align="center" mb={6}>
                <Box>
                    <Heading size="lg" mb={1} bgGradient="linear(to-r, blue.400, purple.500)" bgClip="text">
                        Daily Expenses
                    </Heading>
                    <Text color="gray.500" fontSize="sm">Track and manage your everyday spending seamlessly.</Text>
                </Box>
                <Button 
                    leftIcon={<AddIcon />} 
                    colorScheme="purple" 
                    bgGradient="linear(to-r, purple.500, blue.500)"
                    _hover={{ bgGradient: "linear(to-r, purple.600, blue.600)", shadow: "lg", transform: "translateY(-2px)" }}
                    transition="all 0.2s"
                    onClick={handleAddClick}
                    size="lg"
                    rounded="full"
                >
                    Add Expense
                </Button>
            </Flex>

            {/* Summary Cards */}
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
                <Card borderTop="4px solid" borderColor="orange.400">
                    <CardBody>
                        <Stat>
                            <StatLabel fontSize="sm" color="gray.500" textTransform="uppercase">Today's Total</StatLabel>
                            <StatNumber fontSize="3xl" color="orange.500">₹{todayTotal.toLocaleString()}</StatNumber>
                        </Stat>
                    </CardBody>
                </Card>
                <Card borderTop="4px solid" borderColor="blue.400">
                    <CardBody>
                        <Stat>
                            <StatLabel fontSize="sm" color="gray.500" textTransform="uppercase">This Week's Total</StatLabel>
                            <StatNumber fontSize="3xl" color="blue.500">₹{weekTotal.toLocaleString()}</StatNumber>
                        </Stat>
                    </CardBody>
                </Card>
                <Card borderTop="4px solid" borderColor="purple.400">
                    <CardBody>
                        <Stat>
                            <StatLabel fontSize="sm" color="gray.500" textTransform="uppercase">This Month's Total</StatLabel>
                            <StatNumber fontSize="3xl" color="purple.500">₹{monthTotal.toLocaleString()}</StatNumber>
                        </Stat>
                    </CardBody>
                </Card>
            </SimpleGrid>

            {/* Filters */}
            <Card mb={8}>
                <CardBody>
                    <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
                        <InputGroup>
                            <InputLeftElement pointerEvents="none"><SearchIcon color="gray.400" /></InputLeftElement>
                            <Input placeholder="Search expenses..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        </InputGroup>
                        <Input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
                        <Select placeholder="All Categories" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </Select>
                        <Select placeholder="All Payment Accounts" value={filterAccountId} onChange={e => setFilterAccountId(e.target.value)}>
                            <optgroup label="Bank Accounts">
                                {bankAccounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </optgroup>
                            <optgroup label="Credit Cards">
                                {creditCards.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </optgroup>
                        </Select>
                    </SimpleGrid>
                </CardBody>
            </Card>

            {/* Expense List Grouped by Date */}
            {Object.keys(groupedByDate).length === 0 ? (
                <Box textAlign="center" py={10} color="gray.500">
                    <Text fontSize="lg">No expenses found.</Text>
                </Box>
            ) : (
                <VStack spacing={8} align="stretch">
                    {Object.entries(groupedByDate).map(([dateLabel, groupExpenses]) => (
                        <Box key={dateLabel}>
                            <Heading size="sm" mb={4} color="gray.600" borderBottomWidth="2px" pb={2} borderColor="purple.200">
                                {dateLabel} 
                                <Badge ml={3} colorScheme="purple" rounded="md" px={2}>
                                    Total: ₹{groupExpenses.reduce((acc, e) => acc + (e.type === 'CREDIT' ? -Number(e.amount) : Number(e.amount)), 0).toLocaleString()}
                                </Badge>
                            </Heading>
                            <Card overflow="hidden">
                                <Table variant="simple" size="md">
                                    <Thead bg={hoverBg}>
                                        <Tr>
                                            <Th>Description</Th>
                                            <Th>Category</Th>
                                            <Th>Paid From</Th>
                                            <Th isNumeric>Amount</Th>
                                            <Th width="100px"></Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {groupExpenses.map(expense => (
                                            <Tr key={expense.id} _hover={{ bg: hoverBg }} transition="background 0.2s">
                                                <Td fontWeight="medium">{expense.description || (expense.type === 'TRANSFER' ? 'Transfer' : 'Expense')}</Td>
                                                <Td><Badge colorScheme={expense.type === 'CREDIT' ? 'green' : 'red'} rounded="full" px={2}>{expense.category}</Badge></Td>
                                                <Td color="gray.500">
                                                    {getAccountName(expense.accountId)}
                                                    {expense.type === 'TRANSFER' && ` → ${getAccountName(expense.toAccountId || '')}`}
                                                </Td>
                                                <Td isNumeric fontWeight="bold" color={expense.type === 'CREDIT' ? 'green.500' : 'red.500'}>
                                                    {expense.type === 'CREDIT' ? '+' : '-'}₹{Number(expense.amount).toLocaleString()}
                                                </Td>
                                                <Td>
                                                    <HStack spacing={2} justify="flex-end">
                                                        <Tooltip label="Edit Expense">
                                                            <IconButton aria-label="Edit" icon={<EditIcon />} size="sm" variant="ghost" colorScheme="blue" onClick={() => handleEditClick(expense)} />
                                                        </Tooltip>
                                                        <Tooltip label="Delete Expense">
                                                            <IconButton aria-label="Delete" icon={<DeleteIcon />} size="sm" variant="ghost" colorScheme="red" onClick={() => handleDelete(expense.id)} />
                                                        </Tooltip>
                                                    </HStack>
                                                </Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            </Card>
                        </Box>
                    ))}
                </VStack>
            )}

            {/* Add / Edit Expense Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="lg">
                <ModalOverlay backdropFilter="blur(4px)" />
                <ModalContent borderRadius="2xl" overflow="hidden">
                    <ModalHeader bgGradient="linear(to-r, purple.500, blue.500)" color="white" borderBottomWidth="0">
                        {editingExpense ? 'Edit Transaction' : 'Record Transaction'}
                    </ModalHeader>
                    <ModalCloseButton color="white" />
                    <ModalBody py={6}>
                        <VStack spacing={5}>
                            <FormControl>
                                <FormLabel fontSize="sm" fontWeight="bold">Transaction Type</FormLabel>
                                <HStack bg={useColorModeValue('gray.100', 'gray.700')} p={1} borderRadius="lg" width="full" spacing={1}>
                                    <Button flex={1} size="sm" variant={formType === 'DEBIT' ? 'solid' : 'ghost'} colorScheme={formType === 'DEBIT' ? 'red' : 'gray'} onClick={() => setFormType('DEBIT')}>Expense</Button>
                                    <Button flex={1} size="sm" variant={formType === 'CREDIT' ? 'solid' : 'ghost'} colorScheme={formType === 'CREDIT' ? 'green' : 'gray'} onClick={() => setFormType('CREDIT')}>Income</Button>
                                    <Button flex={1} size="sm" variant={formType === 'TRANSFER' ? 'solid' : 'ghost'} colorScheme={formType === 'TRANSFER' ? 'purple' : 'gray'} onClick={() => setFormType('TRANSFER')}>Transfer</Button>
                                </HStack>
                            </FormControl>

                            <HStack w="full" spacing={4}>
                                <FormControl isRequired>
                                    <FormLabel>Date</FormLabel>
                                    <Input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel>Amount</FormLabel>
                                    <Input type="number" step="0.01" value={formAmount} onChange={e => setFormAmount(e.target.value)} placeholder="0.00" />
                                </FormControl>
                            </HStack>

                            {formType !== 'TRANSFER' && (
                                <FormControl isRequired>
                                    <FormLabel>{formType === 'DEBIT' ? 'Category' : 'Income Source'}</FormLabel>
                                    <Select value={formCategory} onChange={e => setFormCategory(e.target.value)}>
                                        <option value="">Select Category</option>
                                        {defaultCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                        {!defaultCategories.includes(formCategory) && formCategory && (
                                            <option value={formCategory}>{formCategory}</option>
                                        )}
                                    </Select>
                                </FormControl>
                            )}

                            <FormControl isRequired>
                                <FormLabel>{formType === 'DEBIT' ? 'Paid From' : formType === 'TRANSFER' ? 'Transfer From' : 'Received Into'}</FormLabel>
                                <Select value={formAccountId} onChange={e => setFormAccountId(e.target.value)}>
                                    <option value="">Select Account</option>
                                    <optgroup label="Bank Accounts">
                                        {bankAccounts.map(a => <option key={a.id} value={a.id}>{a.name} (Bal: ₹{a.balance.toLocaleString()})</option>)}
                                    </optgroup>
                                    {formType === 'DEBIT' && (
                                        <optgroup label="Credit Cards">
                                            {creditCards.map(a => <option key={a.id} value={a.id}>{a.name} (Owed: ₹{a.balance.toLocaleString()})</option>)}
                                        </optgroup>
                                    )}
                                </Select>
                            </FormControl>

                            {formType === 'TRANSFER' && (
                                <FormControl isRequired>
                                    <FormLabel>Transfer To</FormLabel>
                                    <Select value={formToAccountId} onChange={e => setFormToAccountId(e.target.value)}>
                                        <option value="">Select Account</option>
                                        {bankAccounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                    </Select>
                                </FormControl>
                            )}

                            <FormControl>
                                <FormLabel>Description / Note</FormLabel>
                                <Input value={formDescription} onChange={e => setFormDescription(e.target.value)} placeholder="E.g. Lunch at restaurant" />
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter bg={hoverBg} borderTopWidth="1px" borderColor={borderColor}>
                        <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
                        <Button colorScheme="purple" onClick={handleSave} px={8}>Save Transaction</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}
