import { useState } from 'react';
import {
    Box,
    Button,
    Heading,
    SimpleGrid,
    Text,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    VStack,
    HStack,
    IconButton,
    useToast,
    Card,
    CardHeader,
    CardBody,
    CardFooter,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { useData } from '../context/DataContext';
import { format } from 'date-fns';

export default function Notes() {
    const { notes, addNote, updateNote, deleteNote } = useData();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const toast = useToast();

    const handleOpen = (noteId: string | null = null) => {
        if (noteId) {
            const note = notes.find(n => n.id === noteId);
            if (note) {
                setEditingNoteId(noteId);
                setTitle(note.title);
                setContent(note.content);
            }
        } else {
            setEditingNoteId(null);
            setTitle('');
            setContent('');
        }
        onOpen();
    };

    const handleSave = async () => {
        if (!title.trim() || !content.trim()) {
            toast({
                title: 'Error',
                description: 'Title and content are required.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        try {
            if (editingNoteId) {
                await updateNote({ id: editingNoteId, title, content });
                toast({ title: 'Note updated', status: 'success', duration: 2000 });
            } else {
                await addNote({ title, content });
                toast({ title: 'Note created', status: 'success', duration: 2000 });
            }
            onClose();
        } catch (error) {
            toast({ title: 'Failed to save note', status: 'error', duration: 3000 });
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this note?')) {
            await deleteNote(id);
            toast({ title: 'Note deleted', status: 'info', duration: 2000 });
        }
    };

    return (
        <Box maxW="1200px" mx="auto" p={4}>
            <HStack justify="space-between" mb={8}>
                <VStack align="start" spacing={1}>
                    <Heading size="lg" color="purple.600">My Notes</Heading>
                    <Text color="gray.500">Capture your thoughts, ideas, and trading rules</Text>
                </VStack>
                <Button leftIcon={<AddIcon />} colorScheme="purple" onClick={() => handleOpen()}>
                    New Note
                </Button>
            </HStack>

            {notes.length === 0 ? (
                <Box textAlign="center" py={10} px={6} bg="white" _dark={{ bg: 'gray.800' }} borderRadius="xl" shadow="sm">
                    <Heading as="h2" size="xl" mt={6} mb={2}>
                        No notes yet
                    </Heading>
                    <Text color={'gray.500'} mb={6}>
                        Create your first note to start storing important information.
                    </Text>
                    <Button colorScheme="purple" variant="solid" onClick={() => handleOpen()}>
                        Create Note
                    </Button>
                </Box>
            ) : (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {notes.map(note => (
                        <Card 
                            key={note.id} 
                            onClick={() => handleOpen(note.id)} 
                            cursor="pointer" 
                            _hover={{ transform: 'translateY(-2px)', shadow: 'md', borderColor: 'purple.300' }}
                            transition="all 0.2s"
                            borderWidth="1px"
                            borderColor="gray.200"
                            _dark={{ borderColor: 'gray.700' }}
                        >
                            <CardHeader pb={2}>
                                <HStack justify="space-between">
                                    <Heading size="md" noOfLines={1}>{note.title}</Heading>
                                    <IconButton
                                        aria-label="Delete Note"
                                        icon={<DeleteIcon />}
                                        size="sm"
                                        variant="ghost"
                                        colorScheme="red"
                                        onClick={(e) => handleDelete(note.id, e)}
                                    />
                                </HStack>
                            </CardHeader>
                            <CardBody py={2}>
                                <Text noOfLines={4} color="gray.600" _dark={{ color: 'gray.400' }} whiteSpace="pre-wrap">
                                    {note.content}
                                </Text>
                            </CardBody>
                            <CardFooter pt={2}>
                                <Text fontSize="xs" color="gray.400">
                                    {note.updatedAt ? `Last updated: ${format(new Date(note.updatedAt), 'MMM dd, yyyy h:mm a')}` : ''}
                                </Text>
                            </CardFooter>
                        </Card>
                    ))}
                </SimpleGrid>
            )}

            <Modal isOpen={isOpen} onClose={onClose} size="xl">
                <ModalOverlay backdropFilter="blur(4px)" />
                <ModalContent>
                    <ModalHeader>{editingNoteId ? 'Edit Note' : 'Create Note'}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel>Title</FormLabel>
                                <Input 
                                    placeholder="Enter note title..." 
                                    value={title} 
                                    onChange={(e) => setTitle(e.target.value)} 
                                    autoFocus
                                />
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel>Content</FormLabel>
                                <Textarea 
                                    placeholder="Write your thoughts here..." 
                                    value={content} 
                                    onChange={(e) => setContent(e.target.value)}
                                    minH="300px"
                                />
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>
                            Cancel
                        </Button>
                        <Button colorScheme="purple" onClick={handleSave}>
                            Save Note
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}
