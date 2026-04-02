"use client";

import { useEffect, useState } from "react";
import { Megaphone, X, Info, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";
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
      case 'warning': return 'bg-amber-500 text-white';
      case 'success': return 'bg-emerald-500 text-white';
      case 'error': return 'bg-red-500 text-white';
      default: return 'bg-blue-600 text-white';
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
    <div className={`relative z-[60] w-full py-3 px-4 sm:px-6 flex items-center justify-between shadow-lg animate-in slide-in-from-top duration-500 ${getStyles(ann.type)}`}>
      <div className="flex-1 flex items-center justify-center gap-3">
        <div className="hidden sm:block">
           {getIcon(ann.type)}
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3">
           <span className="font-black text-[10px] sm:text-xs uppercase tracking-widest bg-black/20 px-2 py-0.5 rounded">DUYURU</span>
           <p className="text-sm font-bold text-center">
             <span className="opacity-90">{ann.title}: </span>
             {ann.content}
           </p>
        </div>
      </div>
      <button 
        onClick={() => setClosedIds([...closedIds, ann.id])}
        className="p-1 hover:bg-black/10 rounded-full transition-colors shrink-0"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
