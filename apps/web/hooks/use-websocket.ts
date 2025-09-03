import { performAction } from '@/lib/canvas/websocketActions';
import { ApiResponse } from '@/types/responses.type';
import { Action, ApiError, draw_elementsType } from '@repo/backend-common';
import React, { useEffect, useRef, useState } from 'react';

export function useWebSocket(
  url: string,
  shouldConnect = false,
  diagrams: React.RefObject<draw_elementsType[]>,
  userId: string | undefined,
  activeUsersRef?: React.RefObject<Map<string, { username: string; lastActive: number; }>>,
  diagramUserMapRef?: React.RefObject<Map<string, string>>

) {
  const socketRef = useRef<WebSocket | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>('');

  useEffect(() => {
    if (!shouldConnect || !url) return;

    setIsLoading(true);
    setIsError(false);

    const socket = new WebSocket(url);
    socketRef.current = socket;

    socket.onopen = () => {
      setIsLoading(false);
    };

    socket.onmessage = (event) => {
      // console.log('event in onmessage ', event)
      try {
        let parsed: unknown;

        try {
          parsed = JSON.parse(event.data);
          // console.log('pars',parsed)
        } catch (err) {
          
          console.log('Failed to parse WebSocket message:', event.data, err);
          setIsError(true)
          setLastMessage('ERROR: Failed to parse WebSocket message');
          return;
        }

        const data = parsed as ApiResponse | ApiError;

        if (typeof data.data === 'string') {
          setLastMessage(data.data);
          return;
        }

        if (!data.data || typeof data.data !== 'object') {
          console.log('ERROR:', data.message);
          setIsError(true)
          setLastMessage(`ERROR: ${data.message}`);
          return;
        }

        if ('element' in (data.data as Action) && 'userId' in (data.data as Action)) {
          // console.log('data.data is',data.data)
          const action = data.data as Action;

          if (action.userId === userId) return;

          //if no element or null the just ignore 
          if(!action.element) return

          try {
            
            performAction(action.element, diagrams.current, action.removeShape);
      
            //for showing users names
            if(activeUsersRef && diagramUserMapRef){

              // console.log(`ShapeId ${action.element.id} and UserId ${action.userId}`)
            
              if (!action.removeShape && !Array.isArray(action.element)) {
                diagramUserMapRef.current.set(action.element.id, action.userId);
              }

              activeUsersRef.current.set(action.userId, {
                username: action.username,
                lastActive: Date.now()
              });
            }

          } catch (err) {

            console.log('ERROR: Failed to perform action:', action, err);
            setIsError(true)
            setLastMessage('Failed to perform action');
          }
          return;

        }

        if (Array.isArray(data.data)) {

          const action = data.data as draw_elementsType[]
          
          try {

            performAction(action, diagrams.current);
            setLastMessage(data.message)

          } catch (err) {

            console.log('ERROR: Failed to load diagrams and perform action:', action, err);
            setIsError(true)
            setLastMessage('Failed to load diagrams and perform action');
          }

          
          // console.log(' Received drawElements:', data.data);
          return;
        }

        if ('userData' in data.data && 'socket' in data.data) {
          // console.log('Received user info:', data.data);
          return;
        }

        console.log(' Unknown data format:', data.data);
        setIsError(true)
        setLastMessage('Unknown data format');

      } catch (err) {

        console.log(' Unexpected WebSocket error:', err);
        setIsError(true)
        setLastMessage('ERROR: Failed to Receive WebSocket Messages');

      }
    };

    socket.onerror = (err) => {
      console.log(err);
      socketRef.current = null;
      setIsError(true);
      setIsLoading(false);
    };

    socket.onclose = (event) => {
      let response: ApiError|ApiResponse;
      // console.log(event);

      try {
        response = JSON.parse(event.reason) as ApiError|ApiResponse;
      } catch {
        response = {
          statusCode: event.code,
          message: event.reason || 'Connection closed',
        } as ApiError|ApiResponse;
      }

      //   console.log(response.message);
      
      if (response.statusCode && response.statusCode !== 4000) setIsError(true);
      setLastMessage(response.message);
      socketRef.current = null;
      setIsLoading(false);
    };
    
  }, [url, shouldConnect, diagrams, userId,activeUsersRef,diagramUserMapRef]);

  //   console.log(socketRef.current);
  //   console.log(lastMessage);
  //   console.log("error",isError);
  //   console.log(isLoading);

  return {
    socket: socketRef, 
    isLoading,
    isError,
    lastMessage,
  };
}
