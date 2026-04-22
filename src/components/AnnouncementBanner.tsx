"use client";

import { useEffect, useState } from "react";
import { X, Info, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";
import { createClient } from '@/utils/supabase/client';

export default function AnnouncementBanner() {
  const supabase = createClient();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [closedIds, setClosedIds] = useState<string[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        setUserRole(profile?.role || 'butik');
      }

      const { data: anns } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (anns) setAnnouncements(anns);
    }
    fetchData();
  }, [supabase]);

  const visibleAnnouncements = announcements.filter(ann => {
    const isNotClosed = !closedIds.includes(ann.id);
    const matchesRole = ann.target_role === 'all' || ann.target_role === userRole;
    return isNotClosed && matchesRole;
  }).slice(0, 1); // Sadece son duyuruyu göster

  if (visibleAnnouncements.length === 0) return null;

  const ann = visibleAnnouncements[0];

  const getStyles = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-amber-50/95 text-amber-950 border-b border-amber-200/80';
      case 'success': return 'bg-emerald-50/95 text-emerald-950 border-b border-emerald-200/80';
      case 'error': return 'bg-red-50/95 text-red-950 border-b border-red-200/80';
      default: return 'bg-sky-50/95 text-sky-950 border-b border-sky-200/80';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      case 'success': return <CheckCircle className="w-5 h-5" />;
      case 'error': return <AlertCircle className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  return (
    <div className={`relative z-[60] flex w-full items-center justify-between px-4 py-2.5 backdrop-blur sm:px-6 ${getStyles(ann.type)}`}>
      <div className="flex flex-1 items-center justify-center gap-2 sm:gap-3">
        <div className="hidden shrink-0 opacity-70 sm:block">
           {getIcon(ann.type)}
        </div>
        <div className="flex flex-col items-center gap-0.5 text-center sm:flex-row sm:gap-2 sm:text-left">
           <span className="rounded-md bg-white/75 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-anthracite-600 ring-1 ring-anthracite-200/60">Duyuru</span>
           <p className="max-w-3xl text-sm font-medium leading-snug text-anthracite-800">
             <span className="text-anthracite-600">{ann.title}: </span>
             {ann.content}
           </p>
        </div>
      </div>
      <button 
        type="button"
        onClick={() => setClosedIds([...closedIds, ann.id])}
        className="shrink-0 rounded-full p-1.5 text-anthracite-500 transition hover:bg-anthracite-200/30"
        aria-label="Kapat"
      >
        <X className="h-4 w-4" strokeWidth={2} />
      </button>
    </div>
  );
}
