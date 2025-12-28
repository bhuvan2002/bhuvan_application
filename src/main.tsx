import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react'
import { HashRouter } from 'react-router-dom'
import App from './App'
import theme from './theme/theme'


import { DataProvider } from './context/DataContext'
import { AuthProvider } from './context/AuthContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <DataProvider>
          <HashRouter>
            <App />
          </HashRouter>
        </DataProvider>
      </AuthProvider>
    </ChakraProvider>
  </React.StrictMode>,
)
