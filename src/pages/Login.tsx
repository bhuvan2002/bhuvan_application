import { useState } from 'react';
import {
    Button,
    FormControl,
    FormLabel,
    Input,
    VStack,
    Heading,
    Text,
    useToast,
    Box,
    Flex,
    Image,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Select,
    useColorModeValue,
    Icon,
    IconButton,
    InputGroup,
    Checkbox
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLock, FiUser, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';
import loginPhoto from '../assets/login_photo.png';


const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('TRADER');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const { login, register } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    // Theme values
    const bgColor = useColorModeValue('white', 'gray.800');
    const accentColor = 'blue.500';
    const textColor = useColorModeValue('gray.600', 'gray.400');

    const handleLogin = async () => {
        setIsLoading(true);
        try {
            await login({ username, password });
            toast({
                title: 'Login Successful',
                description: 'Redirecting to your dashboard...',
                status: 'success',
                duration: 2000,
                isClosable: true,
                position: 'top-right'
            });
            navigate('/');
        } catch (error: any) {
            toast({
                title: 'Login Failed',
                description: error.response?.data?.error || 'Invalid credentials. Please check your username and password.',
                status: 'error',
                duration: 4000,
                isClosable: true,
                position: 'top-right'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async () => {
        setIsLoading(true);
        try {
            await register({ username, password, role });
            toast({
                title: 'Registration Successful',
                description: 'Account created! You can now sign in.',
                status: 'success',
                duration: 4000,
                isClosable: true,
                position: 'top-right'
            });
        } catch (error: any) {
            toast({
                title: 'Registration Failed',
                description: error.response?.data?.error || 'We couldn\'t create your account at this time.',
                status: 'error',
                duration: 4000,
                isClosable: true,
                position: 'top-right'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Flex minH="100vh" direction={{ base: 'column', md: 'row' }} overflow="hidden">
            {/* Left Side: Image Content */}
            <Box
                flex="1"
                display={{ base: 'none', md: 'block' }}
                position="relative"
                bg="blue.900"
            >
                <Image
                    src={loginPhoto}
                    alt="Trading Analytics"
                    objectFit="cover"
                    w="100%"
                    h="100%"
                    opacity="0.7"
                />
                <Box
                    position="absolute"
                    top="0"
                    left="0"
                    right="0"
                    bottom="0"
                    bgGradient="linear(to-t, rgba(0,0,0,0.8), transparent)"
                    display="flex"
                    flexDirection="column"
                    justifyContent="flex-end"
                    p={12}
                    color="white"
                >
                    <Heading size="2xl" mb={4} fontWeight="extrabold">
                        Bhuvan App
                    </Heading>
                    <Text fontSize="xl" maxW="lg" fontWeight="medium">
                        Empower your trading journey with advanced analytics and seamless financial management.
                    </Text>
                </Box>
            </Box>

            {/* Right Side: Authentication Form */}
            <Flex
                flex="1"
                align="center"
                justify="center"
                p={8}
                bg={bgColor}
            >
                <VStack spacing={8} w="full" maxW="md">
                    <Box textAlign="center">
                        <Heading size="xl" mb={2} fontWeight="bold">
                            Welcome Back
                        </Heading>
                        <Text color={textColor}>
                            Sign in to your account to continue
                        </Text>
                    </Box>

                    <Box w="full" bg={bgColor} borderRadius="xl">
                        <Tabs isFitted variant="soft-rounded" colorScheme="blue">
                            <TabList mb={6} p={1} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="lg">
                                <Tab fontWeight="semibold">Sign In</Tab>
                                <Tab fontWeight="semibold">Register</Tab>
                            </TabList>
                            <TabPanels>
                                <TabPanel p={0}>
                                    <VStack spacing={5}>
                                        <FormControl id="username">
                                            <FormLabel fontWeight="600">Username</FormLabel>
                                            <Flex align="center" borderBottom="2px solid" borderColor="gray.100" _focusWithin={{ borderColor: accentColor }}>
                                                <Icon as={FiUser} color="gray.400" mr={3} />
                                                <Input
                                                    variant="unstyled"
                                                    py={2}
                                                    placeholder="Enter your username"
                                                    value={username}
                                                    onChange={(e) => setUsername(e.target.value)}
                                                />
                                            </Flex>
                                        </FormControl>
                                        <FormControl id="password">
                                            <FormLabel fontWeight="600">Password</FormLabel>
                                            <InputGroup>
                                                <Flex align="center" w="full" borderBottom="2px solid" borderColor="gray.100" _focusWithin={{ borderColor: accentColor }}>
                                                    <Icon as={FiLock} color="gray.400" mr={3} />
                                                    <Input
                                                        type={showPassword ? 'text' : 'password'}
                                                        variant="unstyled"
                                                        py={2}
                                                        placeholder="Enter your password"
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                    />
                                                    <IconButton
                                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        icon={showPassword ? <FiEyeOff /> : <FiEye />}
                                                        _hover={{ bg: 'transparent' }}
                                                    />
                                                </Flex>
                                            </InputGroup>
                                        </FormControl>
                                        <Flex w="full" justify="space-between" align="center">
                                            <Checkbox
                                                colorScheme="blue"
                                                isChecked={rememberMe}
                                                onChange={(e) => setRememberMe(e.target.checked)}
                                            >
                                                <Text fontSize="sm">Remember me</Text>
                                            </Checkbox>
                                            <Button variant="link" colorScheme="blue" size="sm">
                                                Forgot password?
                                            </Button>
                                        </Flex>
                                        <Button
                                            colorScheme="blue"
                                            size="lg"
                                            width="full"
                                            onClick={handleLogin}
                                            isLoading={isLoading}
                                            rightIcon={<FiArrowRight />}
                                            borderRadius="lg"
                                            mt={4}
                                            boxShadow="0 4px 14px 0 rgba(0, 118, 255, 0.39)"
                                        >
                                            Sign In
                                        </Button>
                                    </VStack>
                                </TabPanel>
                                <TabPanel p={0}>
                                    <VStack spacing={5}>
                                        <FormControl id="reg-username">
                                            <FormLabel fontWeight="600">Username</FormLabel>
                                            <Flex align="center" borderBottom="2px solid" borderColor="gray.100" _focusWithin={{ borderColor: accentColor }}>
                                                <Icon as={FiUser} color="gray.400" mr={3} />
                                                <Input
                                                    variant="unstyled"
                                                    py={2}
                                                    placeholder="Create a username"
                                                    value={username}
                                                    onChange={(e) => setUsername(e.target.value)}
                                                />
                                            </Flex>
                                        </FormControl>
                                        <FormControl id="reg-password">
                                            <FormLabel fontWeight="600">Password</FormLabel>
                                            <InputGroup>
                                                <Flex align="center" w="full" borderBottom="2px solid" borderColor="gray.100" _focusWithin={{ borderColor: accentColor }}>
                                                    <Icon as={FiLock} color="gray.400" mr={3} />
                                                    <Input
                                                        type={showPassword ? 'text' : 'password'}
                                                        variant="unstyled"
                                                        py={2}
                                                        placeholder="Create a strong password"
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                    />
                                                    <IconButton
                                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        icon={showPassword ? <FiEyeOff /> : <FiEye />}
                                                        _hover={{ bg: 'transparent' }}
                                                    />
                                                </Flex>
                                            </InputGroup>
                                        </FormControl>
                                        <FormControl id="reg-role">
                                            <FormLabel fontWeight="600">Account Type</FormLabel>
                                            <Select
                                                variant="outline"
                                                borderRadius="lg"
                                                value={role}
                                                onChange={(e) => setRole(e.target.value)}
                                            >
                                                <option value="TRADER">Trader</option>
                                                <option value="PARENT">Parent</option>
                                            </Select>
                                        </FormControl>
                                        <Button
                                            colorScheme="blue"
                                            size="lg"
                                            width="full"
                                            onClick={handleRegister}
                                            isLoading={isLoading}
                                            borderRadius="lg"
                                            mt={4}
                                            variant="outline"
                                        >
                                            Create Account
                                        </Button>
                                    </VStack>
                                </TabPanel>
                            </TabPanels>
                        </Tabs>
                    </Box>

                    <Text fontSize="sm" color="gray.500" textAlign="center">
                        Securely logged in? Your data remains private and encrypted.
                    </Text>
                </VStack>
            </Flex>
        </Flex>
    );
};

export default Login;

