'use client';

import { useEffect, useState } from 'react';
import { onServerWakeupChange } from '@/services/api';
import { Loader2, Server, Zap } from 'lucide-react';

export default function ServerWarmup() {
  const [isWaking, setIsWaking] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  // Backend base URL from environment or default snapdeploy backend
  const backendUrl =
    process.env.NEXT_PUBLIC_API_URL &&
    process.env.NEXT_PUBLIC_API_URL.startsWith('http')
      ? process.env.NEXT_PUBLIC_API_URL
      : 'https://blog-backend-64824.containers.snapdeploy.app';

  useEffect(() => {
    // Subscribe to active retries/wake-up requests
    const unsubscribe = onServerWakeupChange((waking) => {
      setIsWaking(waking);
      if (!waking) {
        setSecondsElapsed(0);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isWaking) {
      timer = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isWaking]);

  return (
    <>
      {/* Hidden iframe triggers the SnapDeploy container to spin up automatically */}
      <iframe
        src={backendUrl}
        title="Server Warmup Trigger"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* Sleek, unobtrusive notification bar when server is spinning up */}
      {isWaking && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-background/95 p-4 shadow-xl backdrop-blur-md">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Zap className="h-5 w-5 animate-pulse" />
            </div>
            <div className="flex-1 text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-foreground">
                  Starting Backend Server
                </span>
                <span className="inline-flex items-center rounded-full bg-primary/10 px-1.5 py-0.2 text-[10px] font-medium text-primary">
                  {secondsElapsed}s
                </span>
              </div>
              <p className="mt-0.5 text-[11px] text-muted-foreground leading-tight">
                Free-tier container is waking up from sleep. Loading your data...
              </p>
            </div>
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
          </div>
        </div>
      )}
    </>
  );
}
