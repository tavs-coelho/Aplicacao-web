// Custom hook for Socket.IO connection
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function useSocket(onOrderCompleted) {
  const socketRef = useRef(null);
  const callbackRef = useRef(onOrderCompleted);

  // Update callback ref when it changes
  useEffect(() => {
    callbackRef.current = onOrderCompleted;
  }, [onOrderCompleted]);

  useEffect(() => {
    // Create socket connection
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket.IO connected:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket.IO disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error.message);
    });

    // Listen for order_completed events
    socket.on('order_completed', (data) => {
      console.log('Order completed event received:', data);
      if (callbackRef.current) {
        callbackRef.current(data);
      }
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);
}

export default useSocket;
