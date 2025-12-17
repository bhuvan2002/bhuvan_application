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
    Container,
    Card,
    CardBody,
    CardHeader,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Select
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('TRADER');
    const [isLoading, setIsLoading] = useState(false);

    const { login, register } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    const handleLogin = async () => {
        setIsLoading(true);
        try {
            await login({ username, password });
            toast({ title: 'Login Successful', status: 'success', duration: 2000 });
            navigate('/');
        } catch (error: any) {
            toast({
                title: 'Login Failed',
                description: error.response?.data?.error || 'Invalid credentials',
                status: 'error',
                duration: 3000
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async () => {
        setIsLoading(true);
        try {
            await register({ username, password, role });
            toast({ title: 'Registration Successful', description: 'Please login now', status: 'success', duration: 3000 });
            // Switch to login tab - logic to prevent auto switch but notify user
        } catch (error: any) {
            toast({
                title: 'Registration Failed',
                description: error.response?.data?.error || 'Registration failed',
                status: 'error',
                duration: 3000
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container maxW="container.sm" py={20}>
            <Card variant="outline" borderColor="gray.200" boxShadow="lg">
                <CardHeader textAlign="center">
                    <Heading size="lg" mb={2}>Welcome Back</Heading>
                    <Text color="gray.500">Sign in to manage your trading and finances</Text>
                </CardHeader>
                <CardBody>
                    <Tabs isFitted variant="enclosed">
                        <TabList mb="1em">
                            <Tab>Login</Tab>
                            <Tab>Register</Tab>
                        </TabList>
                        <TabPanels>
                            <TabPanel>
                                <VStack spacing={4}>
                                    <FormControl>
                                        <FormLabel>Username</FormLabel>
                                        <Input value={username} onChange={(e) => setUsername(e.target.value)} />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Password</FormLabel>
                                        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                                    </FormControl>
                                    <Button colorScheme="blue" width="full" onClick={handleLogin} isLoading={isLoading}>
                                        Sign In
                                    </Button>
                                </VStack>
                            </TabPanel>
                            <TabPanel>
                                <VStack spacing={4}>
                                    <FormControl>
                                        <FormLabel>Username</FormLabel>
                                        <Input value={username} onChange={(e) => setUsername(e.target.value)} />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Password</FormLabel>
                                        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel>Role (for new user)</FormLabel>
                                        <Select
                                            value={role}
                                            onChange={(e) => setRole(e.target.value)}
                                        >
                                            <option value="TRADER">Trader</option>
                                            <option value="PARENT">Parent</option>
                                        </Select>
                                    </FormControl>
                                    <Button colorScheme="green" width="full" onClick={handleRegister} isLoading={isLoading}>
                                        Register
                                    </Button>
                                </VStack>
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </CardBody>
            </Card>
        </Container>
    );
};

export default Login;
