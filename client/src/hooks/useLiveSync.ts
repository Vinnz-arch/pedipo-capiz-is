import { useEffect, useRef } from "react";
import {
  subscribeLiveSync,
  type LiveSyncMessage,
  type LiveSyncTopic,
} from "@/util/liveSync";

export interface UseLiveSyncOptions {
  /** Whether auto-sync listeners and polling are active. Defaults to true. */
  enabled?: boolean;
  /** Interval (ms) to silently poll while the tab is visible. Set to 0 to disable polling. */
  pollIntervalMs?: number;
  /** Minimum ms between focus/visibility refetches to avoid duplicate bursts. */
  focusThrottleMs?: number;
  /** Ignore broadcasts emitted from the current browser tab. Defaults to true. */
  ignoreSameTab?: boolean;
}

/**
 * Automatically refreshes data on cross-tab change broadcasts, window focus,
 * tab visibility restoration, and optional foreground polling.
 */
export const useLiveSync = (
  topics: LiveSyncTopic[],
  onRefresh: (meta?: { isManualPortalSync?: boolean }) => void | Promise<void>,
  options?: UseLiveSyncOptions
): void => {
  const {
    enabled = true,
    pollIntervalMs = 0,
    focusThrottleMs = 2000,
    ignoreSameTab = true,
  } = options || {};

  const onRefreshRef = useRef(onRefresh);
  const lastTriggerAtRef = useRef<number>(0);
  const topicsKey = topics.join(",");

  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const topicList = topicsKey.split(",").filter(Boolean) as LiveSyncTopic[];

    const triggerNow = (meta?: { isManualPortalSync?: boolean; bypassThrottle?: boolean }) => {
      const now = Date.now();
      if (!meta?.bypassThrottle && now - lastTriggerAtRef.current < focusThrottleMs) {
        return;
      }
      lastTriggerAtRef.current = now;
      onRefreshRef.current({ isManualPortalSync: meta?.isManualPortalSync });
    };

    const unsubscribe = subscribeLiveSync(
      topicList,
      (message: LiveSyncMessage) => {
        triggerNow({
          isManualPortalSync: message.isManualPortalSync,
          bypassThrottle: true,
        });
      },
      { ignoreSameTab }
    );

    const handleFocus = () => {
      triggerNow();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        triggerNow();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    let pollTimer: number | null = null;
    if (pollIntervalMs > 0) {
      pollTimer = window.setInterval(() => {
        if (document.visibilityState === "visible") {
          triggerNow({ bypassThrottle: true });
        }
      }, pollIntervalMs);
    }

    return () => {
      unsubscribe();
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (pollTimer !== null) {
        window.clearInterval(pollTimer);
      }
    };
  }, [enabled, focusThrottleMs, ignoreSameTab, pollIntervalMs, topicsKey]);
};

