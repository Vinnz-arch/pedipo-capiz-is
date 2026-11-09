import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Bell, 
  CheckCheck, 
  Briefcase, 
  Store, 
  FileSpreadsheet, 
  Info, 
  Trash2, 
  X, 
  Loader2,
  ExternalLink
} from "lucide-react";
import { NotificationService, type AppNotification } from "@/services/NotificationService";
import { notify } from "@/util/notify";

interface NotificationDropdownProps {
  className?: string;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ className = "" }) => {
  const isPortal = typeof window !== "undefined" && window.location.pathname.startsWith("/portal");
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Fetch notifications
  const fetchNotifications = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const data = await NotificationService.getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  // Initial load and polling every 30 seconds
  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications(true);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mark a single notification as read & navigate
  const handleNotificationClick = async (notif: AppNotification) => {
    if (!notif.read_at) {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read_at: new Date().toISOString() } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      try {
        await NotificationService.markAsRead(notif.id);
      } catch (err) {
        console.error("Failed to mark notification as read:", err);
      }
    }

    setIsOpen(false);

    if (notif.action_url) {
      if (!isPortal) {
        let targetUrl = notif.action_url.replace(/^\/app\/inquiries/, "/app/manageInquires");
        if (
          (notif.type === "msme_request" || notif.type === "msme_status" || notif.type === "msme") &&
          !targetUrl.includes("tab=msme")
        ) {
          const hasQuery = targetUrl.includes("?");
          targetUrl = `${targetUrl}${hasQuery ? "&" : "?"}tab=msme`;
        }
        const reqId = notif.data?.request_id || notif.data?.id;
        if (reqId && !targetUrl.includes("id=")) {
          const hasQuery = targetUrl.includes("?");
          targetUrl = `${targetUrl}${hasQuery ? "&" : "?"}id=${reqId}`;
        }
        navigate(targetUrl);
      } else {
        let targetUrl = notif.action_url;
        // Direct inquiry status notifications to My Inquiries tab
        if (notif.type === "inquiry_status" || notif.type === "inquiry") {
          if (!targetUrl.includes("tab=inquiries")) {
            const hasQuery = targetUrl.includes("?");
            targetUrl = `${targetUrl}${hasQuery ? "&" : "?"}tab=inquiries`;
          }
          if (notif.data?.inquiry_id && !targetUrl.includes("id=")) {
            targetUrl = `${targetUrl}&id=${notif.data.inquiry_id}`;
          }
        } else if (
          notif.type === "msme_status" ||
          notif.type === "msme_request" ||
          notif.type === "msme" ||
          targetUrl.includes("/portal/msmeAssistance")
        ) {
          const reqId = notif.data?.request_id || notif.data?.id;
          if (reqId && !targetUrl.includes("id=")) {
            const hasQuery = targetUrl.includes("?");
            targetUrl = `${targetUrl}${hasQuery ? "&" : "?"}id=${reqId}`;
          }
        }
        navigate(targetUrl);
      }
    } else {
      navigate(isPortal ? "/portal/dashboard" : "/app/manageInquires");
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0 || isMarkingAll) return;
    setIsMarkingAll(true);
    const prevCount = unreadCount;
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
    );
    setUnreadCount(0);

    try {
      await NotificationService.markAllAsRead();
      notify.success("All Read", "All notifications marked as read.");
    } catch (err) {
      console.error("Failed to mark all as read:", err);
      setUnreadCount(prevCount);
    } finally {
      setIsMarkingAll(false);
    }
  };

  // Delete notification
  const handleDeleteNotification = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const target = notifications.find((n) => n.id === id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (target && !target.read_at) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    try {
      await NotificationService.deleteNotification(id);
    } catch (err) {
      console.error("Failed to delete notification:", err);
      fetchNotifications(true);
    }
  };

  // Relative time formatter
  const formatRelativeTime = (dateStr: string) => {
    try {
      const now = new Date();
      const past = new Date(dateStr);
      const diffMs = now.getTime() - past.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHour / 24);

      if (diffSec < 60) return "Just now";
      if (diffMin < 60) return `${diffMin}m ago`;
      if (diffHour < 24) return `${diffHour}h ago`;
      if (diffDay < 7) return `${diffDay}d ago`;
      return past.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    } catch {
      return dateStr;
    }
  };

  // Icon and badge styling by notification type
  const renderTypeIcon = (type: string) => {
    switch (type) {
      case "inquiry":
      case "inquiry_status":
        return (
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
            <Briefcase className="w-4 h-4" />
          </div>
        );
      case "msme_request":
      case "msme_status":
        return (
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
            <Store className="w-4 h-4" />
          </div>
        );
      case "report":
        return (
          <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center shrink-0">
            <Info className="w-4 h-4" />
          </div>
        );
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "unread") return !n.read_at;
    return true;
  });

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications(true);
        }}
        title="Notifications"
        className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-all relative cursor-pointer outline-none active:scale-95"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white font-extrabold text-[10px] rounded-full border-2 border-white flex items-center justify-center shadow-xs animate-in zoom-in-50 duration-200">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[340px] sm:w-[390px] bg-white rounded-2xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                  {unreadCount} New
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  disabled={isMarkingAll}
                  title="Mark all as read"
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {isMarkingAll ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <CheckCheck className="w-3.5 h-3.5" />
                  )}
                  <span>Mark all read</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tabs: All / Unread */}
          <div className="px-4 pt-2 pb-1 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`pb-2 border-b-2 transition-all cursor-pointer ${
                activeTab === "all"
                  ? "border-[#002B66] text-[#002B66]"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("unread")}
              className={`pb-2 border-b-2 transition-all cursor-pointer ${
                activeTab === "unread"
                  ? "border-[#002B66] text-[#002B66]"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notification List Container */}
          <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-100">
            {isLoading && notifications.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin text-[#002B66]" />
                <span className="text-xs font-medium">Checking for updates...</span>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="py-12 px-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Bell className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-700">All Caught Up!</h4>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  {activeTab === "unread"
                    ? "You have no unread notifications at the moment."
                    : isPortal
                    ? "Application updates and newly published investment reports will appear here."
                    : "New investor inquiries and MSME assistance requests will appear here."}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const isUnread = !notif.read_at;
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer group relative ${
                      isUnread
                        ? "bg-blue-50/40 hover:bg-blue-50/70"
                        : "bg-white hover:bg-slate-50"
                    }`}
                  >
                    {/* Category Icon */}
                    {renderTypeIcon(notif.type)}

                    {/* Content */}
                    <div className="flex-1 overflow-hidden space-y-0.5">
                      <div className="flex items-center justify-between gap-1">
                        <h5
                          className={`text-xs truncate ${
                            isUnread ? "font-bold text-slate-900" : "font-semibold text-slate-700"
                          }`}
                        >
                          {notif.title}
                        </h5>
                        <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                          {formatRelativeTime(notif.created_at)}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>

                      {notif.action_url && (
                        <div className="pt-1 flex items-center gap-1 text-[10px] font-bold text-blue-600 opacity-80 group-hover:opacity-100">
                          <span>View record</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>

                    {/* Unread indicator dot & delete on hover */}
                    <div className="flex flex-col items-center justify-between gap-2 shrink-0 self-stretch">
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1"></span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleDeleteNotification(notif.id, e)}
                        title="Delete notification"
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-400 font-medium">
              Showing latest updates
            </span>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate(isPortal ? "/portal/dashboard" : "/app/manageInquires");
              }}
              className="text-[11px] font-bold text-[#002B66] hover:underline cursor-pointer"
            >
              {isPortal ? "Open Portal Dashboard \u2192" : "Open Inquiries Manager \u2192"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
