import { useEffect, useRef } from 'react';

type Props = {
    symbol: string;
    theme: 'light' | 'dark';
};

const TradingViewWidget = ({ symbol, theme }: Props) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        containerRef.current.innerHTML = '';

        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/tv.js';
        script.async = true;

        script.onload = () => {
            new (window as any).TradingView.widget({
                autosize: true,
                symbol,
                interval: '15',
                timezone: 'Asia/Kolkata',
                theme,
                style: '1',
                locale: 'en',
                enable_publishing: false,
                allow_symbol_change: true,
                hide_top_toolbar: false,
                hide_legend: false,
                save_image: true,
                container_id: containerRef.current!.id,
                studies: [
                    'Volume@tv-basicstudies',
                    'Moving Average@tv-basicstudies',
                    'RSI@tv-basicstudies',
                    'MACD@tv-basicstudies'
                ],
                withdateranges: true,
                details: true,
                hotlist: true,
                calendar: true,
                support_host: 'https://www.tradingview.com'
            });
        };

        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, [symbol, theme]);

    return (
        <div
            id="tradingview_container"
            ref={containerRef}
            style={{ width: '100%', height: '100%' }}
        />
    );
};

export default TradingViewWidget;
