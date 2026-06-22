import { AlertTriangle, Camera } from 'lucide-react';

const directionLabels = {
  left: 'Face turned left — look at the screen',
  right: 'Face turned right — look at the screen',
  center: 'Face centered',
};

export default function ProctorCamera({ videoRef, cameraOk, faceStatus }) {
  const borderColor =
    faceStatus.direction === 'left' || faceStatus.direction === 'right'
      ? 'border-amber-400'
      : faceStatus.detected
        ? 'border-green-400'
        : 'border-red-400';

  return (
    <div className="fixed bottom-4 right-4 z-30 w-44 sm:w-52">
      <div className={`overflow-hidden rounded-2xl border-4 bg-black shadow-2xl ${borderColor}`}>
        <div className="flex items-center justify-between bg-slate-900 px-2 py-1.5">
          <span className="flex items-center gap-1 text-[10px] font-semibold text-white">
            <Camera size={12} />
            Live Proctor
          </span>
          <span
            className={`h-2 w-2 rounded-full ${cameraOk ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}
          />
        </div>
        <div className="relative aspect-[4/3] bg-black">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="h-full w-full scale-x-[-1] object-cover"
          />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-24 w-20 rounded-[50%] border-2 border-dashed border-white/40" />
          </div>
          {(faceStatus.direction === 'left' || faceStatus.direction === 'right') && (
            <div className="absolute inset-x-0 top-2 flex justify-center">
              <span className="flex items-center gap-1 rounded-full bg-amber-500/90 px-2 py-0.5 text-[10px] font-bold text-white">
                <AlertTriangle size={10} />
                {faceStatus.direction === 'left' ? 'Look Right' : 'Look Left'}
              </span>
            </div>
          )}
        </div>
        <div className="space-y-0.5 bg-slate-900 px-2 py-2 text-[10px] text-slate-300">
          <p>{directionLabels[faceStatus.direction]}</p>
          <p>Face warnings: {faceStatus.warnings}</p>
          {!faceStatus.supported && (
            <p className="text-amber-300">Use Chrome/Edge for face tracking.</p>
          )}
        </div>
      </div>
    </div>
  );
}
