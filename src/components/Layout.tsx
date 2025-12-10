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

const Links = [
    { name: 'Dashboard', path: '/', roles: ['TRADER'] },
    { name: 'Journal', path: '/journal', roles: ['TRADER'] },
    { name: 'Accounts', path: '/accounts', roles: ['TRADER', 'PARENT'] },
    { name: 'To-Do', path: '/todo', roles: ['TRADER'] },
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
            bg: useColorModeValue('gray.200', 'gray.700'),
        }}
        bg={isActive ? useColorModeValue('gray.200', 'gray.700') : undefined}
        fontWeight={isActive ? 'bold' : 'normal'}
    >
        {children}
    </Link>
);

export default function Layout() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { colorMode, toggleColorMode } = useColorMode();
    const { user, logout } = useAuth();
    const location = useLocation();

    const filteredLinks = Links.filter(link => user && link.roles.includes(user.role));

    return (
        <>
            <Box bg={useColorModeValue('gray.100', 'gray.900')} px={4}>
                <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
                    <IconButton
                        size={'md'}
                        icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
                        aria-label={'Open Menu'}
                        display={{ md: 'none' }}
                        onClick={isOpen ? onClose : onOpen}
                    />
                    <HStack spacing={8} alignItems={'center'}>
                        <Box fontWeight="bold" fontSize="lg">TradeTracker</Box>
                        <HStack as={'nav'} spacing={4} display={{ base: 'none', md: 'flex' }}>
                            {filteredLinks.map((link) => (
                                <NavLink key={link.name} to={link.path} isActive={location.pathname === link.path}>
                                    {link.name}
                                </NavLink>
                            ))}
                        </HStack>
                    </HStack>
                    <Flex alignItems={'center'}>
                        <Stack direction={'row'} spacing={7}>
                            <Button onClick={toggleColorMode}>
                                {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                            </Button>

                            <Menu>
                                <MenuButton
                                    as={Button}
                                    rounded={'full'}
                                    variant={'link'}
                                    cursor={'pointer'}
                                    minW={0}>
                                    <Text>{user?.username} ({user?.role})</Text>
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

            <Box p={4}>
                <Outlet />
            </Box>
        </>
    );
}
