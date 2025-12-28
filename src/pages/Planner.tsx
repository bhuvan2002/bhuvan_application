import {
    Box,
    Flex,
    Heading,
    VStack,
    HStack,
    Text,
    Button,
    useColorModeValue,
    FormControl,
    FormLabel,
    Input,
    Select,
    Textarea,
    useToast,
    IconButton,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
} from '@chakra-ui/react';
import { useState, useEffect, useRef } from 'react';
import { AddIcon, DeleteIcon, ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { v4 as uuidv4 } from 'uuid';
import { format, addDays, isSameDay, parseISO } from 'date-fns';
import apiService from '../services/apiService';


interface PlanItem {
    id: string;
    title: string;
    type: 'Trading' | 'Learning' | 'Exercise' | 'Personal' | 'Other';
    startTime: string; // HH:mm
    endTime: string; // HH:mm
    notes: string;
}

// Data structure: { "2023-10-27": [PlanItem, ...] }


const HOURS = Array.from({ length: 24 }, (_, i) => i);

const PLAN_TYPES = {
    Trading: 'blue.400',
    Learning: 'green.400',
    Exercise: 'orange.400',
    Personal: 'purple.400',
    Other: 'gray.400',
};

export default function Planner() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentDayPlans, setCurrentDayPlans] = useState<PlanItem[]>([]);
    const dateKey = format(selectedDate, 'yyyy-MM-dd');

    const fetchPlans = async () => {
        try {
            const res = await apiService.get('/plans', { date: dateKey });
            if (res.status === 200) {
                setCurrentDayPlans(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch plans', error);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, [dateKey]);

    const [currentPlan, setCurrentPlan] = useState<Partial<PlanItem>>({});
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();
    const scrollRef = useRef<HTMLDivElement>(null);

    const bgColor = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    // Auto-scroll to current time on open/today
    useEffect(() => {
        if (isSameDay(selectedDate, new Date()) && scrollRef.current) {
            const now = new Date();
            const minutes = now.getHours() * 60 + now.getMinutes();
            // Scroll to show slightly before current time for context
            scrollRef.current.scrollTop = Math.max(0, minutes - 100);
        }
    }, [selectedDate]);

    const handleSave = () => {
        if (!currentPlan.title || !currentPlan.startTime || !currentPlan.endTime || !currentPlan.type) {
            toast({
                title: 'Error',
                description: 'Please fill in all required fields',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        if (currentPlan.startTime >= currentPlan.endTime) {
            toast({
                title: 'Invalid Time',
                description: 'End time must be after start time',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        const newPlan = { ...currentPlan, date: dateKey } as PlanItem;
        if (!newPlan.id) newPlan.id = uuidv4();

        if (currentPlan.id) {
            // Update
            apiService.put(`/plans/${currentPlan.id}`, newPlan).then(() => {
                fetchPlans();
                onClose();
                setCurrentPlan({});
                toast({
                    title: 'Success',
                    description: 'Plan updated successfully',
                    status: 'success',
                    duration: 3000,
                });
            }).catch(() => {
                toast({ title: 'Error', description: 'Failed to update plan', status: 'error' });
            });
        } else {
            // Create
            apiService.post('/plans', newPlan).then(() => {
                fetchPlans();
                onClose();
                setCurrentPlan({});
                toast({
                    title: 'Success',
                    description: 'Plan saved successfully',
                    status: 'success',
                    duration: 3000,
                });
            }).catch(() => {
                toast({ title: 'Error', description: 'Failed to save plan', status: 'error' });
            });
        }

        onClose();
        setCurrentPlan({});
        toast({
            title: 'Success',
            description: 'Plan saved successfully',
            status: 'success',
            duration: 3000,
        });
    };

    const handleDelete = (id: string) => {
        apiService.delete(`/plans/${id}`).then(() => {
            fetchPlans();
            toast({ title: 'Plan deleted', status: 'info', duration: 2000 });
        }).catch(() => {
            toast({ title: 'Error', description: 'Failed to delete plan', status: 'error' });
        });
    };

    const openEdit = (plan: PlanItem, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent bubbling issues
        setCurrentPlan(plan);
        onOpen();
    };

    const openAdd = () => {
        setCurrentPlan({ type: 'Trading', startTime: '09:00', endTime: '10:00' });
        onOpen();
    }

    const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickY = e.clientY - rect.top; // Relative Y in pixels (minutes)
        const totalMinutes = Math.max(0, Math.min(1439, clickY));

        // Snap to nearest 15 mins
        const snappedMinutes = Math.floor(totalMinutes / 15) * 15;

        const startH = Math.floor(snappedMinutes / 60);
        const startM = snappedMinutes % 60;

        // Default duration 1 hour, handle day overflow
        const endTotal = Math.min(1439, snappedMinutes + 60);
        const endH = Math.floor(endTotal / 60);
        const endM = endTotal % 60;

        const formatTime = (h: number, m: number) =>
            `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

        setCurrentPlan({
            type: 'Trading',
            startTime: formatTime(startH, startM),
            endTime: formatTime(endH, endM)
        });
        onOpen();
    };

    const changeDate = (days: number) => {
        setSelectedDate(prev => addDays(prev, days));
    }

    const getPosition = (time: string) => {
        const [h, m] = time.split(':').map(Number);
        return (h * 60) + m;
    };

    const getHeight = (start: string, end: string) => {
        return getPosition(end) - getPosition(start);
    }

    return (
        <Box p={4} h="calc(100vh - 100px)" overflow="hidden">
            <Flex justifyContent="space-between" mb={4} alignItems="center">
                <HStack spacing={4}>
                    <Heading size="lg">Daily Planner</Heading>
                    <HStack bg={bgColor} p={1} borderRadius="md" borderWidth="1px" borderColor={borderColor}>
                        <IconButton aria-label="Previous Day" icon={<ChevronLeftIcon />} size="sm" onClick={() => changeDate(-1)} />
                        <Input
                            type="date"
                            value={dateKey}
                            onChange={(e) => setSelectedDate(parseISO(e.target.value))}
                            w="150px"
                            size="sm"
                            border="none"
                            _focus={{ boxShadow: 'none' }}
                        />
                        <IconButton aria-label="Next Day" icon={<ChevronRightIcon />} size="sm" onClick={() => changeDate(1)} />
                    </HStack>
                </HStack>
                <Button leftIcon={<AddIcon />} colorScheme="teal" onClick={openAdd}>
                    Add Plan
                </Button>
            </Flex>

            <Flex h="full" gap={4}>
                {/* Timeline */}
                <Box
                    flex={1}
                    overflowY="auto"
                    bg={bgColor}
                    borderRadius="xl"
                    borderWidth="1px"
                    borderColor={borderColor}
                    position="relative"
                    ref={scrollRef} // Attached ref
                    css={{
                        '&::-webkit-scrollbar': { width: '4px' },
                        '&::-webkit-scrollbar-track': { width: '6px' },
                        '&::-webkit-scrollbar-thumb': { background: 'gray', borderRadius: '24px' },
                    }}
                >
                    <Box
                        position="relative"
                        height="1440px"
                        w="full"
                        onClick={handleTimelineClick} // Attached click handler
                        cursor="cell" // Indicate interactivity
                    >
                        {HOURS.map(hour => (
                            <Box key={hour} position="absolute" top={`${hour * 60}px`} left={0} w="full" borderTopWidth="1px" borderColor="gray.100" h="60px" pointerEvents="none">
                                <Text position="absolute" left={2} top={-3} fontSize="xs" color="gray.500" bg={bgColor} px={1}>
                                    {String(hour).padStart(2, '0')}:00
                                </Text>
                            </Box>
                        ))}

                        {/* Use pointer events to ensure clicks register */}
                        {currentDayPlans.map(plan => {
                            const top = getPosition(plan.startTime);
                            const height = getHeight(plan.startTime, plan.endTime);

                            return (
                                <Box
                                    key={plan.id}
                                    position="absolute"
                                    top={`${top}px`}
                                    left="60px"
                                    right="10px"
                                    height={`${height}px`}
                                    bg={PLAN_TYPES[plan.type]}
                                    borderRadius="md"
                                    opacity={0.9}
                                    p={2}
                                    cursor="pointer"
                                    onClick={(e) => openEdit(plan, e)}
                                    zIndex={10}
                                    transition="all 0.2s"
                                    _hover={{ opacity: 1, transform: 'scale(1.005)', zIndex: 20, shadow: 'md' }}
                                    color="white"
                                    overflow="hidden"
                                >
                                    <Flex justifyContent="space-between">
                                        <Text fontWeight="bold" fontSize="sm" noOfLines={1}>{plan.title}</Text>
                                        <Text fontSize="xs">{plan.startTime} - {plan.endTime}</Text>
                                    </Flex>
                                    {height > 30 && <Text fontSize="xs" noOfLines={2} mt={1}>{plan.notes}</Text>}
                                </Box>
                            )
                        })}

                        {/* Optional: Current Time Line */}
                        {isSameDay(selectedDate, new Date()) && (
                            <Box
                                position="absolute"
                                top={`${new Date().getHours() * 60 + new Date().getMinutes()}px`}
                                left={0}
                                w="full"
                                h="2px"
                                bg="red.400"
                                pointerEvents="none"
                                zIndex={5}
                            >
                                <Box position="absolute" left={0} top="-4px" w="8px" h="8px" borderRadius="full" bg="red.400" />
                            </Box>
                        )}
                    </Box>
                </Box>

                {/* Info Panel / Stats */}
                <VStack w="300px" display={{ base: 'none', lg: 'flex' }} spacing={4} align="stretch">
                    <Box p={4} bg={bgColor} borderRadius="xl" borderWidth="1px" borderColor={borderColor}>
                        <Heading size="sm" mb={4}>Summary for {format(selectedDate, 'MMM d')}</Heading>
                        <VStack align="stretch" spacing={2}>
                            {Object.entries(PLAN_TYPES).map(([type, color]) => {
                                const count = currentDayPlans.filter(p => p.type === type).length;
                                if (count === 0) return null;
                                return (
                                    <HStack key={type} justify="space-between">
                                        <HStack>
                                            <Box w={3} h={3} borderRadius="full" bg={color} />
                                            <Text fontSize="sm">{type}</Text>
                                        </HStack>
                                        <Text fontSize="sm" fontWeight="bold">{count}</Text>
                                    </HStack>
                                );
                            })}
                        </VStack>
                    </Box>

                    <Box p={4} bg="blue.50" _dark={{ bg: 'blue.900' }} borderRadius="xl">
                        <Heading size="sm" mb={2} color="blue.600" _dark={{ color: 'blue.200' }}>Tip</Heading>
                        <Text fontSize="sm" color="blue.600" _dark={{ color: 'blue.200' }}>
                            Click anywhere on the timeline to add a plan at that time.
                        </Text>
                    </Box>
                </VStack>
            </Flex>

            {/* Add/Edit Modal */}
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{currentPlan.id ? 'Edit Plan' : 'New Plan'}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel>Title</FormLabel>
                                <Input
                                    value={currentPlan.title || ''}
                                    onChange={e => setCurrentPlan({ ...currentPlan, title: e.target.value })}
                                    placeholder="e.g., Morning Analysis"
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>Type</FormLabel>
                                <Select
                                    value={currentPlan.type || 'Trading'}
                                    onChange={e => setCurrentPlan({ ...currentPlan, type: e.target.value as any })}
                                >
                                    {Object.keys(PLAN_TYPES).map(t => <option key={t} value={t}>{t}</option>)}
                                </Select>
                            </FormControl>

                            <HStack w="full">
                                <FormControl isRequired>
                                    <FormLabel>Start Time</FormLabel>
                                    <Input
                                        type="time"
                                        value={currentPlan.startTime || ''}
                                        onChange={e => setCurrentPlan({ ...currentPlan, startTime: e.target.value })}
                                    />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel>End Time</FormLabel>
                                    <Input
                                        type="time"
                                        value={currentPlan.endTime || ''}
                                        onChange={e => setCurrentPlan({ ...currentPlan, endTime: e.target.value })}
                                    />
                                </FormControl>
                            </HStack>

                            <FormControl>
                                <FormLabel>Notes</FormLabel>
                                <Textarea
                                    value={currentPlan.notes || ''}
                                    onChange={e => setCurrentPlan({ ...currentPlan, notes: e.target.value })}
                                    placeholder="Additional details..."
                                />
                            </FormControl>
                        </VStack>
                    </ModalBody>

                    <ModalFooter>
                        {currentPlan.id && (
                            <IconButton
                                aria-label="Delete plan"
                                icon={<DeleteIcon />}
                                colorScheme="red"
                                mr="auto"
                                onClick={() => { handleDelete(currentPlan.id!); onClose(); }}
                            />
                        )}
                        <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
                        <Button colorScheme="blue" onClick={handleSave}>Save</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}
