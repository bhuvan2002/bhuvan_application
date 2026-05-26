import { Box, HStack, Icon, Text, VStack } from '@chakra-ui/react';
import { FiAlertCircle, FiCheckCircle, FiInfo } from 'react-icons/fi';
import { motion } from 'framer-motion';
import type { AIInsight } from '../../services/aiService';

const MotionBox = motion(Box);

interface AIInsightCardProps {
    insight: AIInsight;
    index: number;
}

const AIInsightCard = ({ insight, index }: AIInsightCardProps) => {
    let icon = FiInfo;
    let color = "blue.500";
    let bg = "blue.50";

    if (insight.type === 'warning') {
        icon = FiAlertCircle;
        color = "red.500";
        bg = "red.50";
    } else if (insight.type === 'positive') {
        icon = FiCheckCircle;
        color = "green.500";
        bg = "green.50";
    } else if (insight.type === 'suggestion') {
        icon = FiInfo;
        color = "purple.500";
        bg = "purple.50";
    }

    return (
        <MotionBox
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            bg={bg}
            p={4}
            borderRadius="lg"
            borderLeft="4px solid"
            borderColor={color}
            boxShadow="sm"
        >
            <HStack align="start" spacing={4}>
                <Icon as={icon} color={color} boxSize={6} mt={1} />
                <VStack align="start" spacing={1}>
                    <Text fontWeight="bold" color="gray.800">
                        {insight.title}
                    </Text>
                    <Text color="gray.600" fontSize="sm">
                        {insight.message}
                    </Text>
                </VStack>
            </HStack>
        </MotionBox>
    );
};

export default AIInsightCard;
