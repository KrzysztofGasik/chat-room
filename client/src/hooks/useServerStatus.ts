import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/client';

export type ServerStatus = 'checking' | 'online' | 'waking' | 'offline';

const HEALTH_CHECK_TIMEOUT = 2000; // 2 seconds
const HEALTH_CHECK_URL = '/health';

/**
 * Hook to check server status and detect cold starts
 * @returns Server status and check function
 */
export const useServerStatus = () => {
  const [status, setStatus] = useState<ServerStatus>('checking');
  const [isChecking, setIsChecking] = useState(false);

  const checkServerStatus = useCallback(async () => {
    setIsChecking(true);
    setStatus('checking');

    const startTime = Date.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        HEALTH_CHECK_TIMEOUT
      );

      const response = await apiClient.get(HEALTH_CHECK_URL, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      // 200 = server is online and healthy
      // 401 = server is online but endpoint requires auth (still means server is up)
      if (response.status === 200 || response.status === 401) {
        // If response took longer than 1 second, server is likely waking up
        if (responseTime > 1000) {
          setStatus('waking');
          // Check again after a short delay to see if it's fully online
          setTimeout(() => {
            checkServerStatus();
          }, 2000);
        } else {
          setStatus('online');
        }
      } else {
        setStatus('offline');
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Request timed out - server is likely waking up
        setStatus('waking');
        // Retry after a delay
        setTimeout(() => {
          checkServerStatus();
        }, 3000);
      } else {
        setStatus('offline');
      }
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    checkServerStatus();
  }, [checkServerStatus]);

  return {
    status,
    isChecking,
    checkServerStatus,
  };
};
