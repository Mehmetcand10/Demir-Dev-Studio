"use client";

/* Realtime: Supabase'te realtime_publication.sql ile notifications tablosu publication'a eklenmeli; yoksa liste yine çalışır, sadece anlık push olmaz. */

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { Bell, Check, Info, AlertTriangle, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function NotificationBell({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const supabase = useMemo(() => createClient(), []);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);
    
    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    }
  }, [userId, supabase]);

  useEffect(() => {
    fetchNotifications();

    // Gerçek zamanlı dinleme (Realtime)
    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload) => {
          setNotifications(prev => [payload.new, ...(prev ? prev.slice(0, 9) : [])]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase, fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    fetchNotifications();
  };

  const markAllAsRead = async () => {
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", userId).eq("is_read", false);
    fetchNotifications();
  };

  const deleteNotification = async (id: string) => {
    await supabase.from("notifications").delete().eq("id", id);
    fetchNotifications();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group relative rounded-full p-2 transition-colors hover:bg-anthracite-100/80"
        aria-label="Bildirimler"
      >
        <Bell className={`h-5 w-5 ${unreadCount > 0 ? 'text-emerald-600' : 'text-anthracite-500 group-hover:text-anthracite-800'}`} strokeWidth={2} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 text-[10px] items-center justify-center text-white font-bold">
              {unreadCount}
            </span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-anthracite-200/80 bg-white shadow-lg animate-in fade-in slide-in-from-top-2 duration-200 sm:w-96">
          <div className="flex items-center justify-between border-b border-anthracite-100/90 bg-anthracite-50/40 p-4">
            <h3 className="text-sm font-semibold text-anthracite-900">Bildirimler</h3>
            {unreadCount > 0 && (
              <button type="button" onClick={markAllAsRead} className="text-xs font-medium text-emerald-700 hover:underline">
                Tümünü okundu işaretle
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto overflow-x-hidden p-2">
            {notifications.length === 0 ? (
              <div className="p-10 text-center flex flex-col items-center gap-3">
                <Bell className="w-8 h-8 text-anthracite-200" />
                <p className="text-xs font-medium text-anthracite-500">Bildirim yok.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {notifications.map((n) => (
                  <div 
                    key={n.id} 
                    className={`p-4 rounded-2xl transition-all relative group/item border ${!n.is_read ? 'bg-emerald-50/30 border-emerald-100' : 'bg-white border-transparent hover:bg-anthracite-50'}`}
                  >
                    <div className="flex gap-3">
                      <div className="mt-0.5">{getTypeIcon(n.type)}</div>
                      <div className="flex-1">
                        <p className={`mb-1 text-[13px] font-semibold leading-tight ${!n.is_read ? 'text-anthracite-900' : 'text-anthracite-600'}`}>{n.title}</p>
                        <p className="text-[11px] font-medium text-anthracite-500 leading-relaxed mb-2">{n.message}</p>
                        <p className="text-[9px] font-bold text-anthracite-400 uppercase">{new Date(n.created_at).toLocaleString('tr-TR')}</p>
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover/item:opacity-100 transition-all">
                      {!n.is_read && (
                        <button onClick={() => markAsRead(n.id)} className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200" title="Okundu">
                          <Check className="w-3 h-3" />
                        </button>
                      )}
                      <button onClick={() => deleteNotification(n.id)} className="p-1.5 bg-red-100 text-red-500 rounded-lg hover:bg-red-200" title="Sil">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="border-t border-anthracite-100/90 bg-anthracite-50/30 p-3 text-center">
            <p className="text-[10px] font-medium leading-relaxed text-anthracite-500">
              Ödeme onaylandığında ve kargoya verildiğinde burada kısa bilgi görürsünüz. E-posta gönderilmez; paneli zaman zaman kontrol edin.
            </p>
            <p className="mt-1.5 text-[10px] text-anthracite-400">Demir Dev Studio</p>
          </div>
        </div>
      )}
    </div>
  );
}
