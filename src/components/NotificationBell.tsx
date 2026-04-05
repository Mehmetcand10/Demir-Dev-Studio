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
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-anthracite-100 transition-colors group"
      >
        <Bell className={`w-6 h-6 ${unreadCount > 0 ? 'text-emerald-500' : 'text-anthracite-400 group-hover:text-anthracite-900'}`} />
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
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-[2rem] shadow-2xl border border-anthracite-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-5 border-b border-anthracite-50 flex justify-between items-center bg-anthracite-50/50">
            <h3 className="font-black text-sm uppercase tracking-widest text-anthracite-900">Bildirimler</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-tight">
                TÜMÜNÜ OKUNDU YAP
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto overflow-x-hidden p-2">
            {notifications.length === 0 ? (
              <div className="p-10 text-center flex flex-col items-center gap-3">
                <Bell className="w-8 h-8 text-anthracite-200" />
                <p className="text-xs font-bold text-anthracite-400 uppercase">Henüz bildiriminiz yok.</p>
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
                        <p className={`text-[13px] font-black leading-tight mb-1 ${!n.is_read ? 'text-anthracite-900' : 'text-anthracite-600'}`}>{n.title}</p>
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
          
          <div className="p-4 bg-anthracite-50/30 text-center border-t border-anthracite-50">
            <p className="text-[9px] font-black text-anthracite-400 uppercase tracking-widest">Demir Dev Studio Gelişmiş Bildirim Ağı</p>
          </div>
        </div>
      )}
    </div>
  );
}
