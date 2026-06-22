import { useCallback, useEffect, useRef, useState } from 'react';

export const MAX_TAB_VIOLATIONS = 3;

export function useExamSecurity({
  enabled = true,
  onViolation,
  onTabLimitExceeded,
} = {}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const tabLimitTriggeredRef = useRef(false);
  const [security, setSecurity] = useState({
    camera: false,
    fullscreen: false,
    internet: navigator.onLine,
    tabViolations: 0,
    loading: false,
    error: '',
  });

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const enableCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        await videoRef.current.play();
      }
      setSecurity((prev) => ({ ...prev, camera: true, error: '' }));
      return true;
    } catch {
      setSecurity((prev) => ({
        ...prev,
        camera: false,
        error: 'Camera access is required to continue the exam.',
      }));
      return false;
    }
  }, []);

  const enableFullscreen = useCallback(async () => {
    try {
      const el = document.documentElement;
      if (!document.fullscreenElement) {
        if (el.requestFullscreen) await el.requestFullscreen();
        else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
      }
      const isFullscreen = !!document.fullscreenElement;
      setSecurity((prev) => ({ ...prev, fullscreen: isFullscreen }));
      return isFullscreen;
    } catch {
      setSecurity((prev) => ({
        ...prev,
        fullscreen: false,
        error: 'Fullscreen mode is required. Press F11 or click Enter Fullscreen.',
      }));
      return false;
    }
  }, []);

  const initializeSecurity = useCallback(async () => {
    setSecurity((prev) => ({ ...prev, loading: true, error: '' }));
    const online = navigator.onLine;
    const cameraOk = await enableCamera();
    const fullscreenOk = await enableFullscreen();

    setSecurity((prev) => ({
      ...prev,
      internet: online,
      camera: cameraOk,
      fullscreen: fullscreenOk,
      loading: false,
      error:
        !online
          ? 'Internet connection is required.'
          : !cameraOk
            ? 'Camera access is required.'
            : !fullscreenOk
              ? 'Fullscreen mode is required.'
              : '',
    }));

    return online && cameraOk && fullscreenOk;
  }, [enableCamera, enableFullscreen]);

  useEffect(() => {
    if (streamRef.current && videoRef.current && !videoRef.current.srcObject) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [enabled, security.camera]);

  useEffect(() => {
    if (!enabled) return undefined;

    const handleOnline = () => setSecurity((prev) => ({ ...prev, internet: true }));
    const handleOffline = () => {
      setSecurity((prev) => ({ ...prev, internet: false }));
      onViolation?.('internet');
    };

    const handleFullscreenChange = () => {
      const isFullscreen = !!document.fullscreenElement;
      setSecurity((prev) => ({ ...prev, fullscreen: isFullscreen }));
      if (!isFullscreen) {
        onViolation?.('fullscreen');
        enableFullscreen().catch(() => {});
      }
    };

    const registerTabViolation = () => {
      setSecurity((prev) => {
        const next = prev.tabViolations + 1;
        onViolation?.('tab', next);

        if (next >= MAX_TAB_VIOLATIONS && !tabLimitTriggeredRef.current) {
          tabLimitTriggeredRef.current = true;
          onTabLimitExceeded?.(next);
        }

        return { ...prev, tabViolations: next };
      });
    };

    const handleVisibility = () => {
      if (document.hidden) registerTabViolation();
    };

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enabled, enableFullscreen, onViolation, onTabLimitExceeded]);

  useEffect(
    () => () => {
      stopCamera();
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    },
    [stopCamera]
  );

  return {
    videoRef,
    security,
    initializeSecurity,
    enableCamera,
    enableFullscreen,
    stopCamera,
  };
}
