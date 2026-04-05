import React, { useState, useEffect } from "react";
import { dbService, Notification } from "../services/mockDb";
import { Bell, X, CheckCircle2, AlertCircle, Info } from "lucide-react";

export const PDVNotification: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const check = () => {
      const data = dbService.getNotifications().filter((n) => !n.read);
      setNotifications(data);
    };
    check();
    const interval = setInterval(check, 3000);
    return () => clearInterval(interval);
  }, []);

  const markRead = (id: string) => {
    dbService.markNotificationRead(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-8 left-8 z-[200] space-y-4 max-w-sm w-full animate-[slideUp_0.3s_ease-out]">
      {notifications.map((n) => (
        <div
          key={n.id}
          className="bg-slate-900 text-white p-5 rounded-[28px] shadow-2xl border border-white/10 flex items-start gap-4 group"
        >
          <div
            className={`p-2.5 rounded-xl shrink-0 ${
              n.type === "SUCCESS"
                ? "bg-emerald-500/20 text-emerald-400"
                : n.type === "WARNING"
                  ? "bg-amber-500/20 text-amber-400"
                  : "bg-indigo-500/20 text-indigo-400"
            }`}
          >
            {n.type === "SUCCESS" ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <Info className="w-5 h-5" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-xs font-black uppercase tracking-tight">
              {n.title}
            </p>
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed mt-1">
              {n.message}
            </p>
          </div>
          <button
            onClick={() => markRead(n.id)}
            className="p-1 text-slate-600 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
