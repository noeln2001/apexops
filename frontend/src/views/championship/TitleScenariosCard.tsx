import React from 'react';
import { Flame } from 'lucide-react';
import { TitleScenariosResponse } from '../../types';

interface TitleScenariosCardProps {
  scenariosData: TitleScenariosResponse;
}

export const TitleScenariosCard: React.FC<TitleScenariosCardProps> = ({ scenariosData }) => {
  return (
    <div className="space-y-6">
      <div className="bg-[#12151b] border border-[#1f2530] rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Flame className="w-4 h-4 text-[#e10600]" />
            <span>Tactical Scenario Engine: Path to the 2026 World Championship</span>
          </h3>
          <p className="text-xs text-[#94a3b8] mt-0.5">
            Evaluates every major race scenario, point swing, leader retirement, and elimination risk
          </p>
        </div>
        <div className="text-xs font-mono text-[#f59e0b] bg-[#1a202c] px-3 py-1.5 rounded border border-[#2d3748]">
          Current Deficit: <strong>{scenariosData.starting_deficit} PTS</strong> (180 Available)
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(scenariosData?.scenarios || []).map((scen) => (
          <div
            key={scen.id}
            className="bg-[#12151b] border border-[#1f2530] hover:border-[#2d3748] rounded-lg p-5 transition flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${
                  scen.category === 'BEST_CASE'
                    ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40'
                    : scen.category === 'TACTICAL_SWING'
                    ? 'bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/40'
                    : scen.category === 'RIVAL_MISFORTUNE'
                    ? 'bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40'
                    : scen.category === 'ELIMINATION_RISK'
                    ? 'bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/40'
                    : 'bg-[#a855f7]/20 text-[#a855f7] border border-[#a855f7]/40'
                }`}>
                  {scen.category.replace('_', ' ')}
                </span>
                <span className={`text-xs font-mono font-bold ${scen.target_wins_championship ? 'text-[#10b981]' : 'text-white'}`}>
                  {scen.target_wins_championship ? '★ CHAMPIONSHIP WIN' : 'CONTENDER'}
                </span>
              </div>

              <h4 className="text-sm font-bold text-white">{scen.title}</h4>
              <p className="text-xs text-[#94a3b8]">{scen.description}</p>
            </div>

            {/* Score Swing Bar */}
            <div className="bg-[#0b0e14] border border-[#1f2530] rounded p-3 text-xs font-mono space-y-1">
              <div className="flex justify-between text-[#94a3b8]">
                <span>Target Points Gain:</span>
                <strong className="text-[#10b981]">+{scen.target_gained_points} pts ({scen.target_final_points} total)</strong>
              </div>
              <div className="flex justify-between text-[#94a3b8]">
                <span>Leader Assumed Gain:</span>
                <strong className="text-[#f59e0b]">+{scen.leader_assumed_gain} pts ({scen.leader_final_points} total)</strong>
              </div>
              <div className="flex justify-between border-t border-[#1f2530] pt-1">
                <span className="text-white font-bold">New Points Margin:</span>
                <strong className={scen.resulting_points_difference <= 0 ? 'text-[#10b981]' : 'text-[#f59e0b]'}>
                  {scen.resulting_points_difference <= 0 ? `LEADS BY ${Math.abs(scen.resulting_points_difference)} PTS` : `TRAILS BY ${scen.resulting_points_difference} PTS`}
                </strong>
              </div>
            </div>

            {/* Plain-English Explanation */}
            <div className="p-3 bg-[#151922] border-l-2 border-l-[#e10600] rounded text-[11px] text-[#cbd5e1] leading-relaxed">
              {scen.explanation}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
