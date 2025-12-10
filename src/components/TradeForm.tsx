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
    SimpleGrid,
    Card,
    CardBody,
    Divider,
    Text
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
    const pnlValue = watch('pnl');

    useEffect(() => {
        if (entryPrice && exitPrice && lotSize && type) {
            const diff = type === 'BUY' ? (Number(exitPrice) - Number(entryPrice)) : (Number(entryPrice) - Number(exitPrice));
            // Standard Forex/CFD P&L approx calculation: (Price Diff) * LotSize * ContractSize (assuming standard 100k or just simple unit math for now)
            // For simplicity in this app, we'll assume direct unit multiplication unless specified otherwise: (Diff * Lot)
            // Adjusting based on user context might be needed, but for now strict math:
            const pnl = diff * Number(lotSize);
            // Often "Lot Size" in simple trackers implies "Quantity", so (Exit - Entry) * Qty
            setValue('pnl', parseFloat(pnl.toFixed(2)));
        }
    }, [entryPrice, exitPrice, lotSize, type, setValue]);

    const onSubmit = (data: any) => {
        const newTrade: Trade = {
            ...data,
            id: uuidv4(),
            date: new Date(data.date).toISOString(),
            lotSize: Number(data.lotSize),
            entryPrice: Number(data.entryPrice),
            exitPrice: Number(data.exitPrice),
            pnl: Number(data.pnl),
            notes: data.notes || "",
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

            <Modal isOpen={isOpen} onClose={onClose} size="4xl" isCentered>
                <ModalOverlay backdropFilter="blur(2px)" />
                <ModalContent>
                    <ModalHeader>Log New Trade</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <VStack as="form" spacing={6} id="trade-form" onSubmit={handleSubmit(onSubmit)}>

                            {/* Top Section: Date & Main Info */}
                            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} w="full">
                                <FormControl isRequired>
                                    <FormLabel>Date & Time</FormLabel>
                                    <Input type="datetime-local" {...register('date', { required: true })} />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel>Symbol / Ticker</FormLabel>
                                    <Input placeholder="e.g. EURUSD, NVDA, BTC" {...register('symbol', { required: true })} />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel>Strategy</FormLabel>
                                    <Select placeholder="Select Strategy" {...register('strategy', { required: true })}>
                                        <option value="Breakout">Breakout</option>
                                        <option value="Reversal">Reversal</option>
                                        <option value="Trend Following">Trend Following</option>
                                        <option value="Scalping">Scalping</option>
                                        <option value="Swing">Swing</option>
                                        <option value="Other">Other</option>
                                    </Select>
                                </FormControl>
                            </SimpleGrid>

                            <Divider />

                            {/* Middle Section: Trade Execution Details & Visual P&L */}
                            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} w="full" alignItems="center">
                                {/* Column 1: Trade Specs */}
                                <VStack spacing={4} align="stretch">
                                    <FormControl isRequired>
                                        <FormLabel>Type</FormLabel>
                                        <Select {...register('type', { required: true })}>
                                            <option value="BUY">Buy / Long</option>
                                            <option value="SELL">Sell / Short</option>
                                        </Select>
                                    </FormControl>
                                    <FormControl isRequired>
                                        <FormLabel>Position Size (Qty/Lots)</FormLabel>
                                        <Input type="number" step="0.01" {...register('lotSize', { required: true })} />
                                    </FormControl>
                                </VStack>

                                {/* Column 2: Price Points */}
                                <VStack spacing={4} align="stretch">
                                    <FormControl isRequired>
                                        <FormLabel>Entry Price</FormLabel>
                                        <Input type="number" step="0.0001" placeholder="0.0000" {...register('entryPrice', { required: true })} />
                                    </FormControl>
                                    <FormControl isRequired>
                                        <FormLabel>Exit Price</FormLabel>
                                        <Input type="number" step="0.0001" placeholder="0.0000" {...register('exitPrice', { required: true })} />
                                    </FormControl>
                                </VStack>

                                {/* Column 3: P&L Input (Manual or Auto) */}
                                <Card
                                    bg={pnlValue > 0 ? 'green.50' : (pnlValue < 0 ? 'red.50' : 'gray.50')}
                                    borderColor={pnlValue > 0 ? 'green.400' : (pnlValue < 0 ? 'red.400' : 'gray.200')}
                                    borderWidth="2px"
                                    boxShadow="sm"
                                >
                                    <CardBody>
                                        <FormControl isRequired>
                                            <FormLabel fontWeight="bold" textAlign="center">
                                                Profit / Loss {pnlValue > 0 ? '(Profit)' : (pnlValue < 0 ? '(Loss)' : '')}
                                            </FormLabel>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                textAlign="center"
                                                fontSize="2xl"
                                                fontWeight="bold"
                                                color={(pnlValue || 0) > 0 ? 'green.500' : ((pnlValue || 0) < 0 ? 'red.500' : 'gray.700')}
                                                bg="white"
                                                _dark={{ bg: 'gray.800' }}
                                                {...register('pnl', { required: true })}
                                            />
                                            <Text fontSize="sm" color="gray.500" textAlign="center" mt={2}>
                                                Auto-calculated. Manual override allowed.
                                            </Text>
                                        </FormControl>
                                    </CardBody>
                                </Card>
                            </SimpleGrid>

                            <Divider />

                            {/* Bottom Section: Notes */}
                            <FormControl>
                                <FormLabel>Trade Notes & Analysis</FormLabel>
                                <Textarea
                                    placeholder="Describe your thought process, emotions, and lessons learned..."
                                    rows={4}
                                    {...register('notes')}
                                    resize="vertical"
                                />
                            </FormControl>

                        </VStack>
                    </ModalBody>

                    <ModalFooter bg="gray.50" borderBottomRadius="md">
                        <Button variant="outline" mr={3} onClick={onClose} size="lg">Cancel</Button>
                        <Button colorScheme="teal" type="submit" form="trade-form" size="lg" px={8}>
                            Log Trade
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default TradeForm;
