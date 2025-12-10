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
} from '@chakra-ui/react';
import { DeleteIcon, AddIcon } from '@chakra-ui/icons';
import { useState } from 'react';
import { useData } from '../context/DataContext';
import { v4 as uuidv4 } from 'uuid';
import type { Todo } from '../types';
import { format, isToday, isTomorrow } from 'date-fns';

const TodoList = () => {
    const { todos, addTodo, toggleTodo, deleteTodo } = useData();
    const [task, setTask] = useState('');
    const [priority, setPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
    const [dueDate, setDueDate] = useState('');
    const toast = useToast();

    const handleAdd = () => {
        if (!task) return;
        const newTodo: Todo = {
            id: uuidv4(),
            title: task,
            isComplete: false,
            priority,
            dueDate: dueDate || new Date().toISOString(),
        };
        addTodo(newTodo);
        setTask('');
        setDueDate('');
        toast({ title: 'Task added', status: 'success', duration: 1000 });
    };

    const getPriorityColor = (p: string) => {
        if (p === 'HIGH') return 'red';
        if (p === 'MEDIUM') return 'orange';
        return 'green';
    };

    const sortedTodos = [...todos].sort((a, b) => {
        // Sort by complete (bottom), then priority (High > Medium > Low)
        if (a.isComplete !== b.isComplete) return a.isComplete ? 1 : -1;
        const pResult = getPrioVal(b.priority) - getPrioVal(a.priority);
        if (pResult !== 0) return pResult;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

    function getPrioVal(p: string) {
        if (p === 'HIGH') return 3;
        if (p === 'MEDIUM') return 2;
        return 1;
    }

    return (
        <Box maxW="800px" mx="auto">
            <Heading mb={6}>To-Do List</Heading>

            <HStack mb={8} as="form" onSubmit={(e) => { e.preventDefault(); handleAdd(); }}>
                <Input
                    placeholder="New Task..."
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                />
                <Select w="150px" value={priority} onChange={(e) => setPriority(e.target.value as any)}>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                </Select>
                <Input
                    w="200px"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                />
                <IconButton
                    aria-label="Add task"
                    icon={<AddIcon />}
                    colorScheme="blue"
                    type="submit"
                    onClick={handleAdd}
                />
            </HStack>

            <VStack spacing={4} align="stretch">
                {sortedTodos.map(todo => {
                    const isDueSoon = !todo.isComplete && (isToday(new Date(todo.dueDate)) || isTomorrow(new Date(todo.dueDate)));

                    return (
                        <Box
                            key={todo.id}
                            p={4}
                            bg="white"
                            _dark={{ bg: 'gray.800' }}
                            borderRadius="md"
                            boxShadow="sm"
                            opacity={todo.isComplete ? 0.6 : 1}
                            borderLeft="4px"
                            borderColor={`${getPriorityColor(todo.priority)}.400`}
                        >
                            <HStack justifyContent="space-between">
                                <HStack spacing={4}>
                                    <Checkbox
                                        isChecked={todo.isComplete}
                                        onChange={() => toggleTodo(todo.id)}
                                        size="lg"
                                    />
                                    <Box>
                                        <Text
                                            textDecoration={todo.isComplete ? 'line-through' : 'none'}
                                            fontWeight="medium"
                                        >
                                            {todo.title}
                                        </Text>
                                        <HStack mt={1} spacing={2}>
                                            <Badge colorScheme={getPriorityColor(todo.priority)} fontSize="xs">
                                                {todo.priority}
                                            </Badge>
                                            <Text fontSize="xs" color="gray.500">
                                                Due: {format(new Date(todo.dueDate), 'MMM dd')}
                                            </Text>
                                            {isDueSoon && (
                                                <Badge colorScheme="red" variant="solid" fontSize="xs">Due Soon</Badge>
                                            )}
                                        </HStack>
                                    </Box>
                                </HStack>
                                <IconButton
                                    aria-label="Delete"
                                    icon={<DeleteIcon />}
                                    size="sm"
                                    variant="ghost"
                                    colorScheme="red"
                                    onClick={() => deleteTodo(todo.id)}
                                />
                            </HStack>
                        </Box>
                    );
                })}
                {todos.length === 0 && <Text textAlign="center" color="gray.500">No tasks. Great job!</Text>}
            </VStack>
        </Box>
    );
};

export default TodoList;
