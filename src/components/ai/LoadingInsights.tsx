import { Box, Spinner, Text, VStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const MotionBox = motion(Box);
const MotionText = motion(Text);

const loadingMessages = [
    "🤖 AI is analyzing your financial patterns...",
    "📊 Calculating category percentages...",
    "💡 Finding personalized saving tips...",
    "🔍 Looking for unusual spending spikes..."
];

const LoadingInsights = () => {
    const [messageIndex, setMessageIndex] = useState(0);
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        const messageInterval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
        }, 2500);
        
        const timerInterval = setInterval(() => {
            setSeconds(s => s + 1);
        }, 1000);

        return () => {
            clearInterval(messageInterval);
            clearInterval(timerInterval);
        };
    }, []);

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            p={10}
            boxShadow="lg"
            bg="white"
            borderRadius="xl"
            w="full"
            textAlign="center"
        >
            <VStack spacing={6}>
                <Spinner 
                    thickness="4px" 
                    speed="0.65s" 
                    emptyColor="gray.200" 
                    color="purple.500" 
                    size="xl" 
                />

                <Box>
                    <Text fontSize="2xl" fontWeight="bold" color="purple.600" mb={1}>
                        {formatTime(seconds)}
                    </Text>
                    {seconds > 30 && (
                        <Text fontSize="sm" color="orange.500" fontWeight="medium">
                            This is taking longer than usual...
                        </Text>
                    )}
                </Box>

                <MotionText
                    key={messageIndex}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.5 }}
                    fontSize="lg"
                    fontWeight="medium"
                    color="gray.600"
                >
                    {loadingMessages[messageIndex]}
                </MotionText>
            </VStack>
        </MotionBox>
    );
};

export default LoadingInsights;
