import {
    Button,
    FormControl,
    FormLabel,
    Input,
    Select,
    Textarea,
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
    HStack,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import { useData } from '../context/DataContext';
import type { Trade } from '../types';
import { useEffect } from 'react';

const TradeForm = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { addTrade } = useData();
    const toast = useToast();
    const { register, handleSubmit, watch, setValue, reset } = useForm<Trade>();

    // Auto-calculate P&L based on entry/exit/lot size
    const entryPrice = watch('entryPrice');
    const exitPrice = watch('exitPrice');
    const lotSize = watch('lotSize');
    const type = watch('type');

    useEffect(() => {
        if (entryPrice && exitPrice && lotSize) {
            const diff = type === 'BUY' ? (Number(exitPrice) - Number(entryPrice)) : (Number(entryPrice) - Number(exitPrice));
            const pnl = diff * Number(lotSize);
            setValue('pnl', parseFloat(pnl.toFixed(2)));
        }
    }, [entryPrice, exitPrice, lotSize, type, setValue]);

    const onSubmit = (data: any) => {
        const newTrade: Trade = {
            ...data,
            id: uuidv4(),
            lotSize: Number(data.lotSize),
            entryPrice: Number(data.entryPrice),
            exitPrice: Number(data.exitPrice),
            pnl: Number(data.pnl),
        };
        addTrade(newTrade);
        toast({
            title: 'Trade logged successfully.',
            status: 'success',
            duration: 2000,
        });
        reset();
        onClose();
    };

    return (
        <>
            <Button colorScheme="teal" onClick={onOpen}>Log New Trade</Button>

            <Modal isOpen={isOpen} onClose={onClose} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Log Trade</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack as="form" spacing={4} id="trade-form" onSubmit={handleSubmit(onSubmit)}>
                            <HStack w="full" spacing={4}>
                                <FormControl isRequired>
                                    <FormLabel>Date</FormLabel>
                                    <Input type="datetime-local" {...register('date', { required: true })} />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel>Symbol</FormLabel>
                                    <Input placeholder="e.g. EURUSD, AAPL" {...register('symbol', { required: true })} />
                                </FormControl>
                            </HStack>

                            <HStack w="full" spacing={4}>
                                <FormControl isRequired>
                                    <FormLabel>Type</FormLabel>
                                    <Select {...register('type', { required: true })}>
                                        <option value="BUY">Buy / Long</option>
                                        <option value="SELL">Sell / Short</option>
                                    </Select>
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel>Strategy</FormLabel>
                                    <Select placeholder="Select Strategy" {...register('strategy', { required: true })}>
                                        <option value="Breakout">Breakout</option>
                                        <option value="Reversal">Reversal</option>
                                        <option value="Trend Following">Trend Following</option>
                                        <option value="Scalping">Scalping</option>
                                        <option value="Swing">Swing</option>
                                    </Select>
                                </FormControl>
                            </HStack>

                            <HStack w="full" spacing={4}>
                                <FormControl isRequired>
                                    <FormLabel>Position Size (Qty)</FormLabel>
                                    <Input type="number" step="0.01" {...register('lotSize', { required: true })} />
                                </FormControl>
                            </HStack>

                            <HStack w="full" spacing={4}>
                                <FormControl isRequired>
                                    <FormLabel>Entry Price</FormLabel>
                                    <Input type="number" step="0.0001" {...register('entryPrice', { required: true })} />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel>Exit Price</FormLabel>
                                    <Input type="number" step="0.0001" {...register('exitPrice', { required: true })} />
                                </FormControl>
                            </HStack>

                            <FormControl isRequired>
                                <FormLabel>P&L (Calculated)</FormLabel>
                                <Input type="number" step="0.01" {...register('pnl', { required: true })} />
                            </FormControl>

                            <FormControl>
                                <FormLabel>Notes</FormLabel>
                                <Textarea placeholder="Analysis, emotions, mistakes..." {...register('notes')} />
                            </FormControl>
                        </VStack>
                    </ModalBody>

                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
                        <Button colorScheme="teal" type="submit" form="trade-form">Save Trade</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default TradeForm;
