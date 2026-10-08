import {
    Box,
    Flex,
    HStack,
    IconButton,
    Button,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    useDisclosure,
    useColorModeValue,
    Text,
    Stack,
    useColorMode,
    Link,
} from '@chakra-ui/react';
import { Link as RouterLink, Outlet, useLocation } from 'react-router-dom';
import { HamburgerIcon, CloseIcon, MoonIcon, SunIcon } from '@chakra-ui/icons';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import GlobalLoader from './GlobalLoader';

const Links = [
    { name: 'Dashboard', path: '/', roles: ['TRADER'] },
    { name: 'Journal', path: '/journal', roles: ['TRADER'] },
    { name: 'Accounts', path: '/accounts', roles: ['TRADER', 'PARENT'] },
    { name: 'Daily Expenses', path: '/expenses', roles: ['TRADER', 'PARENT'] },
    { name: 'To-Do', path: '/todo', roles: ['TRADER'] },
    { name: 'Planner', path: '/planner', roles: ['TRADER'] },
    { name: 'Notes', path: '/notes', roles: ['TRADER'] },
];

const NavLink = ({ children, to, isActive }: { children: React.ReactNode; to: string; isActive: boolean }) => (
    <Link
        as={RouterLink}
        to={to}
        px={2}
        py={1}
        rounded={'md'}
        _hover={{
            textDecoration: 'none',
            bg: useColorModeValue('brand.50', 'whiteAlpha.100'),
            color: useColorModeValue('brand.600', 'brand.200'),
        }}
        bg={isActive ? useColorModeValue('brand.50', 'whiteAlpha.100') : undefined}
        color={isActive ? useColorModeValue('brand.700', 'brand.200') : useColorModeValue('gray.600', 'gray.300')}
        fontWeight={isActive ? '600' : '500'}
        transition="all 0.2s"
    >
        {children}
    </Link>
);

import { useState, useEffect } from 'react';

const LiveClock = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <Text fontSize="sm" fontWeight="bold" minW="100px" textAlign="center">
            {time.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false })} IST
        </Text>
    );
};

export default function Layout() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { colorMode, toggleColorMode } = useColorMode();
    const { user, logout } = useAuth();
    const { isGlobalLoading } = useData();
    const location = useLocation();

    const filteredLinks = Links.filter(link => user && link.roles.includes(user.role));

    if (isGlobalLoading) {
        return <GlobalLoader />;
    }

    return (
        <>
            <Box
                bg={useColorModeValue('whiteAlpha.800', 'rgba(17, 24, 39, 0.8)')}
                backdropFilter="blur(12px)"
                px={4}
                position="sticky"
                top={0}
                zIndex="banner"
                borderBottom="1px solid"
                borderColor={useColorModeValue('gray.100', 'gray.700')}
            >
                <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
                    <IconButton
                        size={'md'}
                        icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
                        aria-label={'Open Menu'}
                        display={{ md: 'none' }}
                        onClick={isOpen ? onClose : onOpen}
                    />
                    <HStack spacing={8} alignItems={'center'}>
                        <Box fontWeight="700" fontSize="xl" bgGradient="linear(to-r, brand.500, purple.500)" bgClip="text">
                            BhuvanApp
                        </Box>
                        <HStack as={'nav'} spacing={4} display={{ base: 'none', md: 'flex' }}>
                            {filteredLinks.map((link) => (
                                <NavLink key={link.name} to={link.path} isActive={location.pathname === link.path}>
                                    {link.name}
                                </NavLink>
                            ))}
                        </HStack>
                    </HStack>
                    <Flex alignItems={'center'}>
                        <Stack direction={'row'} spacing={7} alignItems="center">
                            <LiveClock />
                            <Button onClick={toggleColorMode}>
                                {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                            </Button>

                            <Menu>
                                <MenuButton
                                    as={Button}
                                    rounded={'full'}
                                    variant={'ghost'}
                                    cursor={'pointer'}
                                    minW={0}
                                    px={2}>
                                    <Text fontWeight="600">{user?.username}</Text>
                                    <Text fontSize="xs" color="gray.500" ml={2} display={{ base: 'none', md: 'block' }}>
                                        ({user?.role})
                                    </Text>
                                </MenuButton>
                                <MenuList>
                                    <MenuItem onClick={logout}>Logout</MenuItem>
                                </MenuList>
                            </Menu>
                        </Stack>
                    </Flex>
                </Flex>

                {isOpen ? (
                    <Box pb={4} display={{ md: 'none' }}>
                        <Stack as={'nav'} spacing={4}>
                            {filteredLinks.map((link) => (
                                <NavLink key={link.name} to={link.path} isActive={location.pathname === link.path}>
                                    {link.name}
                                </NavLink>
                            ))}
                        </Stack>
                    </Box>
                ) : null}
            </Box>

            <Box p={{ base: 4, md: 6 }} w="full" mx="auto">
                <Outlet />
            </Box>
        </>
    );
}
