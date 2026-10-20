import React from 'react';
import {
  LayoutDashboard,
  Trophy,
  Flag,
  Users,
  Shield,
  MapPin,
  Calendar,
  Activity,
  Layers,
  Cpu,
  Newspaper,
  Database,
  Sliders,
  Terminal,
  Save,
  Info,
  Camera
} from 'lucide-react';

export type NavView =
  | 'overview'
  | 'championship'
  | 'gallery'
  | 'standings'
  | 'weekend'
  | 'drivers'
  | 'constructors'
  | 'circuits'
  | 'calendar'
  | 'telemetry'
  | 'strategy'
  | 'simulator'
  | 'news'
  | 'observability'
  | 'drills'
  | 'backups'
  | 'explorer'
  | 'about';

interface SidebarProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onSelectView }) => {
  const sections = [
    {
      label: 'INTELLIGENCE',
      items: [
        { id: 'overview' as NavView, label: 'Overview Dashboard', icon: LayoutDashboard },
        { id: 'championship' as NavView, label: 'Championship Tracker', icon: Trophy, badge: 'VER 33' },
        { id: 'gallery' as NavView, label: 'F1 Image Gallery', icon: Camera, badge: 'UHD 4K' },
        { id: 'standings' as NavView, label: 'Championship Standings', icon: Trophy },
        { id: 'weekend' as NavView, label: 'Race Weekend Centre', icon: Flag },
        { id: 'drivers' as NavView, label: 'Driver Explorer', icon: Users },
        { id: 'constructors' as NavView, label: 'Teams & Constructors', icon: Shield },
        { id: 'circuits' as NavView, label: 'Circuit Directory', icon: MapPin },
        { id: 'calendar' as NavView, label: 'Championship Calendar', icon: Calendar },
      ],
    },
    {
      label: 'ENGINEERING LABS',
      items: [
        { id: 'telemetry' as NavView, label: 'Telemetry Lab', icon: Activity },
        { id: 'strategy' as NavView, label: 'Tyre & Strategy Lab', icon: Layers },
        { id: 'simulator' as NavView, label: 'Championship Simulator', icon: Cpu },
      ],
    },
    {
      label: 'IT OPERATIONS & DISASTER RECOVERY',
      items: [
        { id: 'drills' as NavView, label: 'Trackside Incident Drills', icon: Terminal, badge: '8 SCENARIOS' },
        { id: 'observability' as NavView, label: 'System Observability', icon: Sliders },
        { id: 'backups' as NavView, label: 'Backups & Recovery', icon: Save },
        { id: 'news' as NavView, label: 'News & FIA Regulations', icon: Newspaper },
        { id: 'explorer' as NavView, label: 'Data Explorer & Exports', icon: Database },
        { id: 'about' as NavView, label: 'Engineering Case Study', icon: Info },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-[#0a0c10] border-r border-[#1a202c] flex flex-col h-[calc(100vh-3.5rem)] select-none">
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-6">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <h3 className="px-3 text-[10px] font-bold text-[#475569] tracking-wider uppercase">
              {section.label}
            </h3>
            <div className="space-y-0.5 pt-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectView(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded transition cursor-pointer ${
                      active
                        ? 'bg-[#1a2230] text-white border-l-2 border-[#e10600]'
                        : 'text-[#94a3b8] hover:bg-[#12161f] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-[#e10600]' : 'text-[#64748b]'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] px-1.5 py-0.2 bg-[#2d1515] text-[#ff6b6b] border border-[#522020] rounded font-semibold">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Trackside Ops Footer */}
      <div className="p-3 bg-[#0d1017] border-t border-[#1a202c] text-[11px] text-[#64748b] flex items-center justify-between">
        <div>
          <div className="text-white font-semibold">Trackside Mode: READY</div>
          <div className="text-[10px]">Austin GP Round 18 T-3 Days</div>
        </div>
        <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></div>
      </div>
    </aside>
  );
};
