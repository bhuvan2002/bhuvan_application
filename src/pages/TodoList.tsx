import {
    Box,
    Heading,
    HStack,
    Input,
    VStack,
    Checkbox,
    Text,
    Badge,
    IconButton,
    Select,
    useToast,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Progress,
    Card,
    CardBody,
    Flex,
    Tag,
    TagLabel,
    Button
} from '@chakra-ui/react';
import { DeleteIcon, AddIcon, CalendarIcon, CheckCircleIcon } from '@chakra-ui/icons';
import { useState } from 'react';
import { useData } from '../context/DataContext';
import { v4 as uuidv4 } from 'uuid';
import type { Todo } from '../types';
import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns';

const TodoList = () => {
    const { todos, addTodo, toggleTodo, deleteTodo } = useData();
    const [task, setTask] = useState('');
    const [priority, setPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
    const [dueDate, setDueDate] = useState('');
    const toast = useToast();

    const handleAdd = () => {
        if (!task.trim()) return;
        const newTodo: Todo = {
            id: uuidv4(),
            title: task,
            isComplete: false,
            priority,
            dueDate: dueDate ? new Date(dueDate).toISOString() : new Date().toISOString(),
        };
        addTodo(newTodo);
        setTask('');
        setDueDate('');
        toast({ title: 'Task added', status: 'success', duration: 1000 });
    };

    const activeTodos = todos.filter(t => !t.isComplete);
    const completedTodos = todos.filter(t => t.isComplete);
    const progress = todos.length > 0 ? (completedTodos.length / todos.length) * 100 : 0;

    const getPriorityColor = (p: string) => {
        if (p === 'HIGH') return 'red';
        if (p === 'MEDIUM') return 'orange';
        return 'green';
    };

    const getDueDateLabel = (dateStr: string) => {
        const date = parseISO(dateStr);
        if (isToday(date)) return 'Today';
        if (isTomorrow(date)) return 'Tomorrow';
        if (isPast(date) && !isToday(date)) return 'Overdue';
        return format(date, 'MMM dd');
    };

    const TaskItem = ({ todo }: { todo: Todo }) => (
        <Card
            variant="outline"
            borderColor={todo.isComplete ? 'gray.200' : 'gray.300'}
            borderLeftWidth="4px"
            borderLeftColor={todo.isComplete ? 'gray.400' : `${getPriorityColor(todo.priority)}.400`}
            shadow="sm"
            _hover={{ shadow: 'md' }}
            transition="all 0.2s"
            opacity={todo.isComplete ? 0.7 : 1}
        >
            <CardBody p={3}>
                <Flex align="center">
                    <Checkbox
                        isChecked={todo.isComplete}
                        onChange={() => toggleTodo(todo.id)}
                        size="lg"
                        colorScheme="green"
                        mr={4}
                    />
                    <Box flex="1">
                        <Text
                            fontSize="md"
                            fontWeight="medium"
                            textDecoration={todo.isComplete ? 'line-through' : 'none'}
                            color={todo.isComplete ? 'gray.500' : 'inherit'}
                        >
                            {todo.title}
                        </Text>
                        <HStack mt={1} spacing={2} fontSize="xs">
                            <Tag size="sm" colorScheme={getPriorityColor(todo.priority)} variant="subtle">
                                <TagLabel>{todo.priority}</TagLabel>
                            </Tag>

                            <HStack color={isPast(parseISO(todo.dueDate)) && !isToday(parseISO(todo.dueDate)) && !todo.isComplete ? "red.500" : "gray.500"}>
                                <CalendarIcon />
                                <Text>{getDueDateLabel(todo.dueDate)}</Text>
                            </HStack>
                        </HStack>
                    </Box>
                    <IconButton
                        aria-label="Delete"
                        icon={<DeleteIcon />}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        opacity={0}
                        _groupHover={{ opacity: 1 }} // Needs role=group on parent usually, but simplifying
                        _hover={{ opacity: 1 }}
                        onClick={() => deleteTodo(todo.id)}
                    />
                </Flex>
            </CardBody>
        </Card>
    );

    return (
        <Box maxW="900px" mx="auto" p={4} pb={20}>
            <VStack spacing={6} align="stretch">
                <Box>
                    <Heading size="lg" mb={2}>My Tasks</Heading>
                    <HStack spacing={4}>
                        <Text fontSize="sm" color="gray.600">
                            {activeTodos.length} Active / {todos.length} Total
                        </Text>
                        <Box flex="1">
                            <Progress value={progress} size="sm" colorScheme="green" borderRadius="full" />
                        </Box>
                        <Text fontSize="sm" fontWeight="bold" color="green.600">{Math.round(progress)}% Done</Text>
                    </HStack>
                </Box>

                {/* Add Task Input Area */}
                <Card variant="filled" bg="blue.50" _dark={{ bg: 'blue.900' }}>
                    <CardBody p={4}>
                        <Flex direction={{ base: 'column', md: 'row' }} gap={3}>
                            <Input
                                placeholder="What needs to be done?"
                                value={task}
                                onChange={(e) => setTask(e.target.value)}
                                bg="white"
                                _dark={{ bg: 'gray.800' }}
                                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                            />
                            <Select
                                w={{ base: 'full', md: '140px' }}
                                value={priority}
                                onChange={(e) => setPriority(e.target.value as any)}
                                bg="white"
                                _dark={{ bg: 'gray.800' }}
                            >
                                <option value="HIGH">High Prio</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="LOW">Low Prio</option>
                            </Select>
                            <Input
                                type="date"
                                w={{ base: 'full', md: '160px' }}
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                bg="white"
                                _dark={{ bg: 'gray.800' }}
                            />
                            <Button
                                leftIcon={<AddIcon />}
                                colorScheme="blue"
                                onClick={handleAdd}
                                px={6}
                            >
                                Add
                            </Button>
                        </Flex>
                    </CardBody>
                </Card>

                <Tabs colorScheme="blue" variant="enclosed" isLazy>
                    <TabList>
                        <Tab fontWeight="bold">Active Tasks <Badge ml={2} colorScheme="blue" variant="solid" borderRadius="full">{activeTodos.length}</Badge></Tab>
                        <Tab fontWeight="bold">Completed <Badge ml={2} colorScheme="green" variant="solid" borderRadius="full">{completedTodos.length}</Badge></Tab>
                    </TabList>

                    <TabPanels>
                        <TabPanel px={0}>
                            {activeTodos.length > 0 ? (
                                <VStack spacing={3} align="stretch">
                                    {/* Sort active: High prio first, then date */}
                                    {activeTodos
                                        .sort((a, b) => {
                                            const p = { HIGH: 3, MEDIUM: 2, LOW: 1 };
                                            if (p[a.priority] !== p[b.priority]) return p[b.priority] - p[a.priority];
                                            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                                        })
                                        .map(todo => <TaskItem key={todo.id} todo={todo} />)
                                    }
                                </VStack>
                            ) : (
                                <Flex direction="column" align="center" justify="center" p={10} bg="gray.50" borderRadius="md" borderStyle="dashed" borderWidth="2px">
                                    <CheckCircleIcon boxSize={8} color="green.400" mb={3} />
                                    <Text color="gray.500">All caught up! No active tasks.</Text>
                                </Flex>
                            )}
                        </TabPanel>

                        <TabPanel px={0}>
                            {completedTodos.length > 0 ? (
                                <VStack spacing={3} align="stretch">
                                    {completedTodos
                                        .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
                                        .map(todo => <TaskItem key={todo.id} todo={todo} />)
                                    }
                                </VStack>
                            ) : (
                                <Text textAlign="center" color="gray.500" mt={4}>No completed tasks yet.</Text>
                            )}
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </VStack>
        </Box>
    );
};

export default TodoList;
