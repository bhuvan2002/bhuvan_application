import { useEffect, useRef, memo } from 'react';
import { Box } from '@chakra-ui/react';

interface TradingViewWidgetProps {
    symbol?: string;
    theme?: 'light' | 'dark';
    height?: string | number;
}

declare global {
    interface Window {
        TradingView: any;
    }
}

const TradingViewWidget = ({
    symbol = 'OANDA:XAUUSD',
    theme = 'dark',
    height = 500
}: TradingViewWidgetProps) => {
    const containerId = 'tradingview_advanced_chart';
    const widgetRef = useRef<any>(null);

    useEffect(() => {
        const scriptId = 'tradingview-widget-script';
        let script = document.getElementById(scriptId) as HTMLScriptElement;

        const initWidget = () => {
            if (typeof window.TradingView !== 'undefined' && document.getElementById(containerId)) {
                widgetRef.current = new window.TradingView.widget({
                    autosize: true,
                    symbol: symbol,
                    interval: "D",
                    timezone: "Etc/UTC",
                    theme: theme,
                    style: "1",
                    locale: "en",
                    enable_publishing: false,
                    allow_symbol_change: true,
                    container_id: containerId,
                });
            }
        };

        if (!script) {
            script = document.createElement('script');
            script.id = scriptId;
            script.src = 'https://s3.tradingview.com/tv.js';
            script.type = 'text/javascript';
            script.onload = initWidget;
            document.head.appendChild(script);
        } else {
            initWidget();
        }

        return () => {
            // Clean up: The widget script creates an iframe. We can leave it or clear the div.
            // When symbol changes, the useEffect re-runs and initWidget overwrites the div.
        };
    }, [symbol, theme]);

    return (
        <Box
            h={height}
            w="full"
            borderRadius="lg"
            overflow="hidden"
            bg={theme === 'dark' ? 'gray.900' : 'white'}
            boxShadow="xl"
            position="relative"
        >
            <div
                id={containerId}
                style={{ height: '100%', width: '100%' }}
            />
        </Box>
    );
}

export default memo(TradingViewWidget);
