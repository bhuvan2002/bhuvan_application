import { Box, Flex, Text, VStack, HStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);
const MotionText = motion(Text);

const GlobalLoader = () => {
    return (
        <Flex 
            height="100vh" 
            width="100vw" 
            alignItems="center" 
            justifyContent="center" 
            bg="gray.50"
            position="fixed"
            top={0}
            left={0}
            zIndex={9999}
        >
            <VStack spacing={8}>
                <HStack spacing={2} align="flex-end" h="50px">
                    {[1, 2, 3, 4, 5].map((index) => (
                        <MotionBox
                            key={index}
                            w="12px"
                            bg="purple.500"
                            borderRadius="sm"
                            animate={{
                                height: ["20%", "100%", "20%"]
                            }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: index * 0.15
                            }}
                        />
                    ))}
                </HStack>
                
                <MotionText
                    fontSize="xl"
                    fontWeight="bold"
                    bgGradient="linear(to-r, purple.500, blue.500)"
                    bgClip="text"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                    Fetching Financial Data...
                </MotionText>
            </VStack>
        </Flex>
    );
};

export default GlobalLoader;
