import { useCallback, useEffect, useRef, useState } from 'react';

export const MAX_TAB_VIOLATIONS = 3;

function getCameraErrorMessage(err) {
  const name = err?.name || '';
  if (!window.isSecureContext) {
    return 'Camera requires a secure connection (HTTPS or localhost). Open the site securely and try again.';
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    return 'Camera is not supported in this browser. Please use Chrome or Edge.';
  }
  if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
    return 'Camera permission denied. Click the camera icon in the address bar, allow access, then try again.';
  }
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
    return 'No camera found. Connect a webcam and try again.';
  }
  if (name === 'NotReadableError' || name === 'TrackStartError') {
    return 'Camera is already in use by another app. Close it and try again.';
  }
  if (name === 'OverconstrainedError' || name === 'ConstraintNotSatisfiedError') {
    return 'Camera settings not supported on this device. Please try again.';
  }
  if (name === 'SecurityError') {
    return 'Browser blocked camera access. Allow camera permission and use HTTPS.';
  }
  return 'Camera access failed. Allow camera permission and try again.';
}

async function requestCameraStream() {
  if (!navigator.mediaDevices?.getUserMedia) {
    const err = new Error('getUserMedia unavailable');
    err.name = 'NotSupportedError';
    throw err;
  }

  const constraintSets = [
    {
      video: {
        facingMode: 'user',
        width: { ideal: 640 },
        height: { ideal: 480 },
      },
      audio: false,
    },
    { video: { facingMode: 'user' }, audio: false },
    { video: true, audio: false },
  ];

  let lastError = null;
  for (const constraints of constraintSets) {
    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (err) {
      lastError = err;
      // Permission denied — no point trying other constraints
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        throw err;
      }
    }
  }
  throw lastError || new Error('Camera access failed');
}

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
    internet: typeof navigator !== 'undefined' ? navigator.onLine : true,
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

  const attachStreamToVideo = useCallback(async (stream) => {
    const video = videoRef.current;
    if (!video || !stream) return false;

    if (video.srcObject !== stream) {
      video.srcObject = stream;
    }
    video.muted = true;
    video.playsInline = true;
    video.setAttribute('playsinline', 'true');
    video.setAttribute('webkit-playsinline', 'true');

    try {
      if (video.paused) {
        await video.play();
      }
    } catch {
      // Autoplay can fail; stream is still active and will show once allowed
    }
    return true;
  }, []);

  const enableCamera = useCallback(async () => {
    try {
      // Release any previous stream before requesting a new one
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      const stream = await requestCameraStream();
      streamRef.current = stream;

      // Attach now if video exists; otherwise the mount effect will attach
      await attachStreamToVideo(stream);

      // Brief retry in case the video element mounts a tick later
      if (!videoRef.current || videoRef.current.srcObject !== stream) {
        await new Promise((r) => requestAnimationFrame(r));
        await attachStreamToVideo(stream);
      }

      const trackLive = stream.getVideoTracks().some((t) => t.readyState === 'live');
      if (!trackLive) {
        throw Object.assign(new Error('Camera track not live'), { name: 'NotReadableError' });
      }

      setSecurity((prev) => ({ ...prev, camera: true, error: '' }));
      return true;
    } catch (err) {
      stopCamera();
      setSecurity((prev) => ({
        ...prev,
        camera: false,
        error: getCameraErrorMessage(err),
      }));
      return false;
    }
  }, [attachStreamToVideo, stopCamera]);

  const enableFullscreen = useCallback(async () => {
    try {
      const el = document.documentElement;
      if (!document.fullscreenElement) {
        if (el.requestFullscreen) await el.requestFullscreen();
        else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
        else if (el.msRequestFullscreen) await el.msRequestFullscreen();
      }
      const isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement);
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

    // Request camera first while still in the click gesture chain
    const cameraOk = await enableCamera();
    const fullscreenOk = cameraOk ? await enableFullscreen() : false;

    setSecurity((prev) => ({
      ...prev,
      internet: online,
      camera: cameraOk,
      fullscreen: fullscreenOk,
      loading: false,
      error: !online
        ? 'Internet connection is required.'
        : !cameraOk
          ? prev.error || 'Camera access failed. Allow camera permission and try again.'
          : !fullscreenOk
            ? 'Fullscreen mode is required. Press F11 or click Enter Fullscreen.'
            : '',
    }));

    return online && cameraOk && fullscreenOk;
  }, [enableCamera, enableFullscreen]);

  // Re-attach stream when the video element mounts / phase becomes active
  useEffect(() => {
    if (!enabled || !security.camera || !streamRef.current) return undefined;

    let cancelled = false;
    const tryAttach = async () => {
      if (cancelled || !streamRef.current) return;
      await attachStreamToVideo(streamRef.current);
    };

    tryAttach();
    const t1 = setTimeout(tryAttach, 150);
    const t2 = setTimeout(tryAttach, 500);

    return () => {
      cancelled = true;
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [enabled, security.camera, attachStreamToVideo]);

  useEffect(() => {
    if (!enabled) return undefined;

    const handleOnline = () => setSecurity((prev) => ({ ...prev, internet: true }));
    const handleOffline = () => {
      setSecurity((prev) => ({ ...prev, internet: false }));
      onViolation?.('internet');
    };

    const handleFullscreenChange = () => {
      const isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement);
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
