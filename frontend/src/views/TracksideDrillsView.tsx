import React, { useState, useEffect } from 'react';
import { fetchDrills, triggerDrill, remediateDrill } from '../services/api';
import { IncidentDrillItem } from '../types';
import { Terminal, Play, Wrench, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const TracksideDrillsView: React.FC = () => {
  const { isAdmin } = useAuth();
  const [drills, setDrills] = useState<IncidentDrillItem[]>([]);
  const [activeDrill, setActiveDrill] = useState<IncidentDrillItem | null>(null);
  const [, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const loadDrills = () => {
    setLoading(true);
    fetchDrills()
      .then((data) => {
        setDrills(data);
        if (data.length > 0 && !activeDrill) {
          setActiveDrill(data[0]);
        } else if (activeDrill) {
          const updated = data.find((d) => d.scenario_key === activeDrill.scenario_key);
          if (updated) setActiveDrill(updated);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadDrills();
  }, []);

  const handleTrigger = async (key: string) => {
    if (!isAdmin) return;
    setActionLoading(true);
    try {
      await triggerDrill(key);
      loadDrills();
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemediate = async (key: string) => {
    if (!isAdmin) return;
    setActionLoading(true);
    try {
      await remediateDrill(key);
      loadDrills();
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-3 border-b border-[#1f2530]">
        <h2 className="text-xl font-black text-white flex items-center space-x-2">
          <Terminal className="w-5 h-5 text-[#e10600]" />
          <span>Trackside IT Operations & Incident Drill Simulator</span>
        </h2>
        <p className="text-xs text-[#94a3b8]">Interactive race-weekend simulation drills demonstrating enterprise platform resilience, circuit breakers, and verified disaster recovery procedures</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left List of 8 Drills */}
        <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-3 space-y-2">
          <div className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider px-2 py-1">
            SCENARIO RUNBOOK (8 DRILLS)
          </div>

          <div className="space-y-1.5">
            {drills.map((d) => {
              const isSelected = activeDrill?.scenario_key === d.scenario_key;
              const isActive = d.status === 'ACTIVE';
              const isResolved = d.status === 'RESOLVED';

              return (
                <button
                  key={d.scenario_key}
                  onClick={() => setActiveDrill(d)}
                  className={`w-full text-left p-3 rounded border text-xs transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#1a2230] border-[#38bdf8] text-white'
                      : 'bg-[#0d1017] border-[#1c222e] text-[#94a3b8] hover:border-[#2a3447]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-[#38bdf8]">{d.scenario_key}</span>
                    <span className={`px-1.5 py-0.2 text-[9px] rounded font-semibold uppercase ${
                      isActive
                        ? 'bg-[#3b1212] text-[#ff6b6b] border border-[#692424] animate-pulse'
                        : isResolved
                        ? 'bg-[#152a1c] text-[#4ade80] border border-[#214f2e]'
                        : 'bg-[#171d28] text-[#64748b] border border-[#242e40]'
                    }`}>
                      {d.status}
                    </span>
                  </div>
                  <div className="font-bold text-white line-clamp-1">{d.name}</div>
                  <div className="text-[10px] text-[#64748b] mt-0.5">{d.category}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Active Drill Details & Diagnostic Console */}
        <div className="lg:col-span-2 space-y-4">
          {activeDrill ? (
            <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1f2530]">
                <div>
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="font-mono font-bold text-[#38bdf8]">{activeDrill.scenario_key}</span>
                    <span className="text-[#475569]">•</span>
                    <span className="text-[#94a3b8] uppercase font-semibold">{activeDrill.category}</span>
                  </div>
                  <h3 className="text-base font-black text-white mt-0.5">{activeDrill.name}</h3>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="relative group">
                    <button
                      onClick={() => handleTrigger(activeDrill.scenario_key)}
                      disabled={actionLoading || activeDrill.status === 'ACTIVE' || !isAdmin}
                      title={!isAdmin ? "Requires Administrator Authentication" : "Inject synthetic failure"}
                      className={`px-3 py-1.5 rounded text-xs font-bold flex items-center space-x-1.5 transition ${
                        !isAdmin
                          ? 'bg-[#232b38] text-[#64748b] cursor-not-allowed opacity-60'
                          : activeDrill.status === 'ACTIVE'
                          ? 'bg-[#291717] text-[#ff8080] border border-[#522020] opacity-50 cursor-not-allowed'
                          : 'bg-[#e10600] hover:bg-[#b80500] text-white cursor-pointer'
                      }`}
                    >
                      {isAdmin ? <Play className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                      <span>Inject Fault</span>
                    </button>
                    {!isAdmin && (
                      <div className="absolute right-0 top-full mt-1 hidden group-hover:block z-20 w-48 p-2 bg-[#0e1117] border border-[#2d3748] rounded text-[10px] text-[#ff8080] shadow-xl">
                        Fault injection restricted to Admin. Please log in.
                      </div>
                    )}
                  </div>

                  <div className="relative group">
                    <button
                      onClick={() => handleRemediate(activeDrill.scenario_key)}
                      disabled={actionLoading || activeDrill.status !== 'ACTIVE' || !isAdmin}
                      title={!isAdmin ? "Requires Administrator Authentication" : "Execute remediation playbook"}
                      className={`px-3 py-1.5 rounded text-xs font-bold flex items-center space-x-1.5 transition ${
                        !isAdmin
                          ? 'bg-[#232b38] text-[#64748b] cursor-not-allowed opacity-60'
                          : activeDrill.status === 'ACTIVE'
                          ? 'bg-[#10b981] hover:bg-[#059669] text-white cursor-pointer'
                          : 'bg-[#132219] text-[#64748b] border border-[#1f3a29] opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Execute Playbook</span>
                    </button>
                    {!isAdmin && (
                      <div className="absolute right-0 top-full mt-1 hidden group-hover:block z-20 w-48 p-2 bg-[#0e1117] border border-[#2d3748] rounded text-[10px] text-[#ff8080] shadow-xl">
                        Remediation execution restricted to Admin.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Scenario Description & Symptoms */}
              <div className="space-y-2 text-xs text-[#94a3b8]">
                <div>
                  <span className="text-white font-semibold">Incident Description: </span>
                  {activeDrill.description}
                </div>
                <div>
                  <span className="text-[#38bdf8] font-semibold">Diagnostic Symptoms: </span>
                  {activeDrill.description}
                </div>
                <div className="p-3 bg-[#171d27] border border-[#232d3d] rounded text-white">
                  <span className="text-[#10b981] font-semibold">Remediation Procedure: </span>
                  {activeDrill.remediation_steps}
                </div>
              </div>

              {/* Real-time Diagnostic Terminal */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-bold text-[#64748b] uppercase tracking-wider">
                  <div className="flex items-center space-x-1.5">
                    <Terminal className="w-3.5 h-3.5 text-[#38bdf8]" />
                    <span>TRACKSIDE DIAGNOSTIC TERMINAL LOGS</span>
                  </div>
                  <span className="font-mono text-[#38bdf8]">SYSTEM LOGSTREAM</span>
                </div>

                <div className="bg-[#080a0f] border border-[#1a202c] rounded-md p-3.5 font-mono text-[11px] leading-relaxed text-[#a5b4fc] h-52 overflow-y-auto whitespace-pre-wrap">
                  {activeDrill.logs_output}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-[#64748b]">Select an incident drill from the catalog.</div>
          )}
        </div>
      </div>
    </div>
  );
};
