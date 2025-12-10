import { Heading, Box, VStack, HStack, Spacer, Button, useDisclosure, Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton } from '@chakra-ui/react';
import TradeForm from '../components/TradeForm';
import TradeList from '../components/TradeList';
import TradeAnalytics from '../components/TradeAnalytics';

const TradingJournal = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
        <Box h="calc(100vh - 100px)" overflow="hidden" p={4}>
            <VStack spacing={6} align="stretch" h="full">
                <HStack>
                    <Heading size="lg">Trading Journal</Heading>
                    <Spacer />
                    <Button onClick={onOpen} variant="outline" mr={2}>
                        View Trade Log
                    </Button>
                    <TradeForm />
                </HStack>

                <Box flex="1" overflowY="auto" pr={2}>
                    <TradeAnalytics />
                </Box>

                {/* Drawer for Trade Log */}
                <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="xl">
                    <DrawerOverlay />
                    <DrawerContent>
                        <DrawerCloseButton />
                        <DrawerHeader>Trade Log</DrawerHeader>

                        <DrawerBody>
                            <TradeList />
                        </DrawerBody>

                        <DrawerFooter>
                            <Button variant="outline" mr={3} onClick={onClose}>
                                Close
                            </Button>
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>
            </VStack>
        </Box>
    );
};

export default TradingJournal;
