import { Button } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FiCpu } from 'react-icons/fi';

const MotionButton = motion(Button);

interface AIAnalyzeButtonProps {
    onClick: () => void;
    isLoading: boolean;
}

const AIAnalyzeButton = ({ onClick, isLoading }: AIAnalyzeButtonProps) => {
    return (
        <MotionButton
            onClick={onClick}
            isLoading={isLoading}
            loadingText="Analyzing..."
            leftIcon={<FiCpu />}
            colorScheme="purple"
            variant="solid"
            size="md"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            boxShadow="0 4px 14px 0 rgba(128, 90, 213, 0.39)"
            _hover={{
                boxShadow: "0 6px 20px rgba(128, 90, 213, 0.23)",
            }}
        >
            AI Analyze
        </MotionButton>
    );
};

export default AIAnalyzeButton;
