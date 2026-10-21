import React, { useState, useEffect } from 'react';
import { fetchConstructors } from '../services/api';
import { Shield, Users, Wrench } from 'lucide-react';

export const ConstructorsView: React.FC = () => {
  const [constructors, setConstructors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConstructors().then((data) => {
      setConstructors(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-5">
      <div className="pb-3 border-b border-[#1f2530]">
        <h2 className="text-xl font-black text-white flex items-center space-x-2">
          <Shield className="w-5 h-5 text-[#38bdf8]" />
          <span>Formula 1 Teams & Constructor Directory</span>
        </h2>
        <p className="text-xs text-[#94a3b8]">Verified constructor profiles, powertrain suppliers, driver lineups, and historical Grand Prix victories</p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-[#64748b]">Loading teams...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {constructors.map((c) => (
            <div
              key={c.constructor_id}
              className="bg-[#12151b] border border-[#1f2530] hover:border-[#2d3748] rounded-lg p-5 space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-[#1f2530]">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-5 rounded-sm" style={{ backgroundColor: c.color_hex }}></span>
                    <h3 className="text-base font-bold text-white">{c.name}</h3>
                  </div>
                  <span className="text-[10px] text-[#94a3b8] font-mono">{c.nationality}</span>
                </div>

                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[#94a3b8]">
                    <span className="flex items-center space-x-1">
                      <Wrench className="w-3.5 h-3.5 text-[#64748b]" />
                      <span>Power Unit:</span>
                    </span>
                    <strong className="text-white font-mono">{c.power_unit || 'Proprietary Turbo-Hybrid'}</strong>
                  </div>

                  <div className="pt-2 border-t border-[#181d27]">
                    <div className="text-[10px] uppercase font-semibold text-[#64748b] mb-1.5 flex items-center space-x-1">
                      <Users className="w-3.5 h-3.5 text-[#38bdf8]" />
                      <span>Driver Lineup:</span>
                    </div>
                    <div className="space-y-1">
                      {(() => {
                        const driversList = Array.isArray(c.current_drivers)
                          ? c.current_drivers
                          : typeof c.drivers === "string"
                          ? c.drivers.split(",").map((s: string) => s.trim())
                          : [];
                        return driversList.length > 0 ? (
                          driversList.map((name: string, idx: number) => (
                            <div key={idx} className="p-1.5 bg-[#0d1017] border border-[#1a202c] rounded text-white font-semibold">
                              {name}
                            </div>
                          ))
                        ) : (
                          <div className="text-[#64748b] italic">Active driver roster</div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#181d27] flex items-center justify-between text-xs">
                <span className="text-[#64748b]">Total Victories</span>
                <span className="font-mono font-bold text-[#e10600] text-sm">{c.total_wins} Wins</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
