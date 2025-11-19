import { useEffect, useState, useCallback } from 'react';

const useWebSocket = (url) => {
    const [ws, setWs] = useState(null);
    const [lastMessage, setLastMessage] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');

    useEffect(() => {
        const websocket = new WebSocket(url);

        websocket.onopen = () => {
            console.log('WebSocket connected');
            setConnectionStatus('connected');
        };

        websocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setLastMessage(data);
        };

        websocket.onerror = (error) => {
            console.error('WebSocket error:', error);
            setConnectionStatus('error');
        };

        websocket.onclose = () => {
            console.log('WebSocket disconnected');
            setConnectionStatus('disconnected');
        };

        setWs(websocket);

        return () => {
            websocket.close();
        };
    }, [url]);

    const sendMessage = useCallback((message) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
        }
    }, [ws]);

    return { lastMessage, connectionStatus, sendMessage };
};

export default useWebSocket;