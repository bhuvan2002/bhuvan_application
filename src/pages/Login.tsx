import { useState } from 'react';
import {
    Button,
    FormControl,
    FormLabel,
    Input,
    Select,
    VStack,
    Heading,
    Text,
    useToast,
    Container,
    Card,
    CardBody,
    CardHeader,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<Role>('TRADER');
    const { login } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    const handleLogin = () => {
        if (username === 'admin' && password === 'admin') {
            login(role);
            toast({
                title: 'Login Successful',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            navigate('/');
        } else {
            toast({
                title: 'Invalid Credentials',
                description: 'Please use admin/admin',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
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
                    <VStack spacing={4}>
                        <FormControl>
                            <FormLabel>Username</FormLabel>
                            <Input
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter username"
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Password</FormLabel>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Role</FormLabel>
                            <Select value={role} onChange={(e) => setRole(e.target.value as Role)}>
                                <option value="TRADER">Trader (Full Access)</option>
                                <option value="PARENT">Parent (Monitor)</option>
                            </Select>
                        </FormControl>
                        <Button colorScheme="blue" width="full" onClick={handleLogin}>
                            Sign In
                        </Button>
                    </VStack>
                </CardBody>
            </Card>
        </Container>
    );
};

export default Login;
