import { useEffect, useRef, useState } from 'react';

const FACE_CHECK_MS = 600;
const TURN_THRESHOLD = 0.14;

export function useFaceMonitoring(videoRef, enabled = false, onFaceTurn) {
  const [faceStatus, setFaceStatus] = useState({
    detected: false,
    direction: 'center',
    warnings: 0,
    supported: typeof window !== 'undefined' && 'FaceDetector' in window,
  });
  const detectorRef = useRef(null);
  const lastWarnRef = useRef(0);

  useEffect(() => {
    if (!enabled || !videoRef.current) return undefined;

    let active = true;
    let intervalId;

    const init = async () => {
      if ('FaceDetector' in window) {
        try {
          detectorRef.current = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 1 });
        } catch {
          detectorRef.current = null;
        }
      }

      intervalId = setInterval(async () => {
        const video = videoRef.current;
        if (!video || video.readyState < 2 || !active) return;

        if (!detectorRef.current) {
          setFaceStatus((prev) => ({ ...prev, detected: true, direction: 'center' }));
          return;
        }

        try {
          const faces = await detectorRef.current.detect(video);
          if (!active) return;

          if (!faces.length) {
            setFaceStatus((prev) => ({ ...prev, detected: false, direction: 'center' }));
            return;
          }

          const box = faces[0].boundingBox;
          const centerX = box.x + box.width / 2;
          const ratio = centerX / video.videoWidth - 0.5;
          let direction = 'center';

          if (ratio < -TURN_THRESHOLD) direction = 'left';
          else if (ratio > TURN_THRESHOLD) direction = 'right';

          setFaceStatus((prev) => {
            const next = { ...prev, detected: true, direction };
            if (direction !== 'center') {
              const now = Date.now();
              if (now - lastWarnRef.current > 2500) {
                lastWarnRef.current = now;
                onFaceTurn?.(direction, prev.warnings + 1);
                next.warnings = prev.warnings + 1;
              }
            }
            return next;
          });
        } catch {
          // detection frame failed — skip
        }
      }, FACE_CHECK_MS);
    };

    init();

    return () => {
      active = false;
      clearInterval(intervalId);
      detectorRef.current = null;
    };
  }, [enabled, onFaceTurn, videoRef]);

  return faceStatus;
}
