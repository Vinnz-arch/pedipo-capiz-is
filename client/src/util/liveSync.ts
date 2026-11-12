export type LiveSyncTopic =
  | "opportunities"
  | "landing"
  | "news"
  | "msmes"
  | "inquiries"
  | "dashboard"
  | "all";

export interface LiveSyncMessage {
  topics: LiveSyncTopic[];
  timestamp: number;
  tabId: string;
  isManualPortalSync?: boolean;
  nonce?: string;
}

const LIVE_SYNC_CHANNEL = "pedipo_live_sync";
const PORTAL_SYNC_CHANNEL = "pedipo_portal_sync";
const STORAGE_KEY = "pedipo_live_sync_event";
const WINDOW_EVENT = "pedipo:live-sync";

export const CURRENT_TAB_ID =
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `tab_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

/**
 * Checks whether an incoming set of topics overlaps with a subscriber's topics.
 */
export const matchesSyncTopics = (
  subscribedTopics: LiveSyncTopic[],
  incomingTopics?: LiveSyncTopic[]
): boolean => {
  if (!incomingTopics || incomingTopics.length === 0) return true;
  if (subscribedTopics.includes("all") || incomingTopics.includes("all")) {
    return true;
  }
  return incomingTopics.some((topic) => subscribedTopics.includes(topic));
};

/**
 * Broadcast data changes across open browser tabs and same-tab listeners.
 */
export const publishLiveSync = (
  topics: LiveSyncTopic | LiveSyncTopic[],
  options?: { isManualPortalSync?: boolean }
): void => {
  if (typeof window === "undefined") return;

  const topicList = Array.isArray(topics) ? topics : [topics];
  const message: LiveSyncMessage = {
    topics: topicList,
    timestamp: Date.now(),
    tabId: CURRENT_TAB_ID,
    isManualPortalSync: options?.isManualPortalSync,
    nonce: Math.random().toString(36).slice(2, 10),
  };

  try {
    if (typeof BroadcastChannel !== "undefined") {
      const channel = new BroadcastChannel(LIVE_SYNC_CHANNEL);
      channel.postMessage(message);
      channel.close();

      if (topicList.includes("opportunities") || topicList.includes("all")) {
        const legacyChannel = new BroadcastChannel(PORTAL_SYNC_CHANNEL);
        legacyChannel.postMessage({
          type: "SYNC_PORTAL",
          timestamp: new Date(message.timestamp).toISOString(),
          isManualPortalSync: Boolean(options?.isManualPortalSync),
          tabId: CURRENT_TAB_ID,
        });
        legacyChannel.close();
      }
    }
  } catch (err) {
    console.warn("BroadcastChannel publish error:", err);
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(message));
  } catch {
    // Ignore storage quota or private browsing failures
  }

  try {
    window.dispatchEvent(new CustomEvent<LiveSyncMessage>(WINDOW_EVENT, { detail: message }));
  } catch {
    // Ignore event dispatch failures
  }
};

export interface LiveSyncSubscriptionOptions {
  ignoreSameTab?: boolean;
}

/**
 * Subscribe to cross-tab and same-tab live sync events for the given topics.
 */
export const subscribeLiveSync = (
  topics: LiveSyncTopic[],
  callback: (message: LiveSyncMessage) => void,
  options?: LiveSyncSubscriptionOptions
): (() => void) => {
  if (typeof window === "undefined") {
    return () => {};
  }

  const ignoreSameTab = options?.ignoreSameTab ?? true;
  let lastHandledSignature = "";

  const deliver = (message: LiveSyncMessage | null | undefined) => {
    if (!message) return;
    if (ignoreSameTab && message.tabId === CURRENT_TAB_ID) return;
    if (!matchesSyncTopics(topics, message.topics)) return;

    const signature = `${message.timestamp}:${message.nonce || ""}:${message.topics.join(",")}`;
    if (signature === lastHandledSignature) return;
    lastHandledSignature = signature;

    callback(message);
  };

  let liveChannel: BroadcastChannel | null = null;
  let legacyChannel: BroadcastChannel | null = null;

  try {
    if (typeof BroadcastChannel !== "undefined") {
      liveChannel = new BroadcastChannel(LIVE_SYNC_CHANNEL);
      liveChannel.onmessage = (event) => {
        deliver(event.data as LiveSyncMessage);
      };

      if (topics.includes("opportunities") || topics.includes("all")) {
        legacyChannel = new BroadcastChannel(PORTAL_SYNC_CHANNEL);
        legacyChannel.onmessage = (event) => {
          if (event.data?.type === "SYNC_PORTAL") {
            deliver({
              topics: ["opportunities"],
              timestamp: Date.now(),
              tabId: event.data?.tabId || "external",
              isManualPortalSync: event.data?.isManualPortalSync ?? true,
            });
          }
        };
      }
    }
  } catch (err) {
    console.warn("BroadcastChannel subscription error:", err);
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY || !event.newValue) return;
    try {
      deliver(JSON.parse(event.newValue) as LiveSyncMessage);
    } catch {
      // Ignore malformed JSON payloads
    }
  };

  const handleWindowEvent = (event: Event) => {
    const customEvent = event as CustomEvent<LiveSyncMessage>;
    deliver(customEvent.detail);
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(WINDOW_EVENT, handleWindowEvent);

  return () => {
    if (liveChannel) liveChannel.close();
    if (legacyChannel) legacyChannel.close();
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(WINDOW_EVENT, handleWindowEvent);
  };
};

