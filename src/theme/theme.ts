import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
    initialColorMode: 'system',
    useSystemColorMode: true,
};

const theme = extendTheme({
    config,
    fonts: {
        heading: `'Outfit', sans-serif`,
        body: `'Inter', sans-serif`,
    },
    colors: {
        brand: {
            50: '#eef2ff',
            100: '#e0e7ff',
            200: '#c7d2fe',
            300: '#a5b4fc',
            400: '#818cf8',
            500: '#6366f1',
            600: '#4f46e5',
            700: '#4338ca',
            800: '#3730a3',
            900: '#312e81',
        },
    },
    styles: {
        global: (props: any) => ({
            body: {
                bg: props.colorMode === 'dark' ? 'gray.900' : 'gray.50',
                color: props.colorMode === 'dark' ? 'gray.100' : 'gray.800',
                lineHeight: 'base',
            },
            '*::-webkit-scrollbar': {
                width: '8px',
                height: '8px',
            },
            '*::-webkit-scrollbar-track': {
                bg: 'transparent',
            },
            '*::-webkit-scrollbar-thumb': {
                bg: props.colorMode === 'dark' ? 'whiteAlpha.300' : 'blackAlpha.300',
                borderRadius: 'full',
            },
            '*::-webkit-scrollbar-thumb:hover': {
                bg: props.colorMode === 'dark' ? 'whiteAlpha.400' : 'blackAlpha.400',
            },
        }),
    },
    components: {
        Button: {
            baseStyle: {
                fontWeight: '600',
                borderRadius: 'xl',
            },
            variants: {
                solid: (props: any) => ({
                    bg: props.colorScheme === 'gray' ? (props.colorMode === 'dark' ? 'gray.700' : 'gray.100') : `${props.colorScheme}.500`,
                    color: props.colorScheme === 'gray' ? (props.colorMode === 'dark' ? 'white' : 'gray.800') : 'white',
                    _hover: {
                        bg: props.colorScheme === 'gray' ? (props.colorMode === 'dark' ? 'gray.600' : 'gray.200') : `${props.colorScheme}.600`,
                        transform: 'translateY(-1px)',
                        boxShadow: 'md',
                    },
                    _active: {
                        transform: 'translateY(0)',
                    },
                    transition: 'all 0.2s',
                }),
                outline: {
                    borderRadius: 'xl',
                },
                ghost: {
                    borderRadius: 'xl',
                }
            },
        },
        Card: {
            baseStyle: (props: any) => ({
                container: {
                    borderRadius: '2xl',
                    boxShadow: props.colorMode === 'dark' ? '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                    borderWidth: '1px',
                    borderColor: props.colorMode === 'dark' ? 'gray.700' : 'gray.100',
                    bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
                    transition: 'box-shadow 0.2s, border-color 0.2s',
                    _hover: {
                        boxShadow: props.colorMode === 'dark' ? '0 10px 15px -3px rgba(0, 0, 0, 0.3)' : '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                    }
                },
                header: {
                    paddingBottom: '2',
                },
                body: {
                    paddingTop: '2',
                }
            }),
        },
        Input: {
            variants: {
                outline: (props: any) => ({
                    field: {
                        borderRadius: 'lg',
                        borderColor: props.colorMode === 'dark' ? 'gray.600' : 'gray.200',
                        bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
                        _hover: {
                            borderColor: props.colorMode === 'dark' ? 'gray.500' : 'gray.300',
                        },
                        _focus: {
                            borderColor: 'brand.500',
                            boxShadow: `0 0 0 1px var(--chakra-colors-brand-500)`,
                        },
                    },
                }),
            },
        },
        Select: {
            variants: {
                outline: (props: any) => ({
                    field: {
                        borderRadius: 'lg',
                        borderColor: props.colorMode === 'dark' ? 'gray.600' : 'gray.200',
                        bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
                        _focus: {
                            borderColor: 'brand.500',
                            boxShadow: `0 0 0 1px var(--chakra-colors-brand-500)`,
                        },
                    },
                }),
            },
        },
        Modal: {
            baseStyle: (props: any) => ({
                dialog: {
                    borderRadius: '2xl',
                    bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
                },
            }),
        },
        Menu: {
            baseStyle: (props: any) => ({
                list: {
                    borderRadius: 'xl',
                    border: 'none',
                    boxShadow: 'lg',
                    bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
                },
                item: {
                    _focus: {
                        bg: props.colorMode === 'dark' ? 'gray.700' : 'gray.50',
                    },
                },
            }),
        },
        Table: {
            variants: {
                simple: (props: any) => ({
                    th: {
                        borderColor: props.colorMode === 'dark' ? 'gray.700' : 'gray.100',
                        color: props.colorMode === 'dark' ? 'gray.400' : 'gray.500',
                        fontSize: 'xs',
                        textTransform: 'uppercase',
                        letterSpacing: 'wider',
                    },
                    td: {
                        borderColor: props.colorMode === 'dark' ? 'gray.700' : 'gray.100',
                    },
                    tbody: {
                        tr: {
                            _hover: {
                                bg: props.colorMode === 'dark' ? 'whiteAlpha.50' : 'gray.50',
                            },
                        },
                    },
                }),
            },
        },
        Badge: {
            baseStyle: {
                borderRadius: 'md',
                px: 2,
                py: 0.5,
                fontWeight: '600',
                textTransform: 'none',
            },
        },
        Tabs: {
            variants: {
                enclosed: (props: any) => ({
                    tablist: {
                        borderBottom: 'none',
                        bg: props.colorMode === 'dark' ? 'whiteAlpha.50' : 'gray.100',
                        p: 1,
                        borderRadius: 'xl',
                        display: 'inline-flex',
                        mb: 4,
                    },
                    tab: {
                        borderRadius: 'lg',
                        fontWeight: '600',
                        color: props.colorMode === 'dark' ? 'gray.400' : 'gray.500',
                        border: 'none',
                        _selected: {
                            bg: props.colorMode === 'dark' ? 'gray.700' : 'white',
                            color: props.colorMode === 'dark' ? 'white' : 'brand.600',
                            boxShadow: props.colorMode === 'dark' ? 'md' : 'sm',
                        },
                        _active: {
                            bg: 'transparent',
                        },
                    },
                }),
                line: (props: any) => ({
                    tablist: {
                        borderColor: props.colorMode === 'dark' ? 'gray.700' : 'gray.200',
                    },
                    tab: {
                        fontWeight: '600',
                        color: props.colorMode === 'dark' ? 'gray.400' : 'gray.500',
                        _selected: {
                            color: 'brand.500',
                            borderColor: 'brand.500',
                        },
                        _active: {
                            bg: 'transparent',
                        },
                    },
                }),
            },
        },
    },
});

export default theme;

