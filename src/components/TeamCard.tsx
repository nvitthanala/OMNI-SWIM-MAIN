/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  User, 
  Award,
  BarChart3,
  List
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { TeamScore, SwimmerResult, ClassYear, Gender } from '../types';
import { getYearsRemaining, convertTimeToSeconds, formatSecondsToTime } from '../lib/utils';
import { cutlines } from '../cutlines';

interface Props {
  team: TeamScore;
  index: number;
  gender: Gender;
  eventsList?: string[];
  key?: string | number;
  searchQuery?: string;
  onUpdateTime?: (id: string, newTime: string) => void;
}

export default function TeamCard({ team, index, gender, eventsList = [], searchQuery, onUpdateTime }: Props) {
  const [isExpanded, setIsExpanded] = useState(index === 0);
  const [editingResultId, setEditingResultId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [viewMode, setViewMode] = useState<'swimmer'|'event'>('event');

  // Group points by event and class
  const eventPointsMap: Record<string, number> = {};
  const classData = [
    { name: 'FR', points: 0, color: '#39FF14', swimmers: [] as SwimmerResult[] },
    { name: 'SO', points: 0, color: '#00F5FF', swimmers: [] as SwimmerResult[] },
    { name: 'JR', points: 0, color: '#FF00FF', swimmers: [] as SwimmerResult[] },
    { name: 'SR', points: 0, color: '#FFD700', swimmers: [] as SwimmerResult[] },
  ];

  team.swimmers.forEach(s => {
    if (!eventPointsMap[s.event]) eventPointsMap[s.event] = 0;
    eventPointsMap[s.event] += typeof s.points === 'number' ? s.points : 0;
    const entry = classData.find(d => d.name === s.classYear);
    if (entry) {
      entry.points += typeof s.points === 'number' ? s.points : 0;
      entry.swimmers.push(s);
    }
  });

  const eventData = Object.entries(eventPointsMap)
    .map(([name, points]) => {
      const swimmers = team.swimmers.filter(s => s.event === name);
      return { 
        name: name.replace(' Freestyle', ' Free').replace('Individual Medley', 'IM').replace('Backstroke', 'Back').replace('Breaststroke', 'Breast').replace('Butterfly', 'Fly').substring(0, 12), 
        fullEvent: name, 
        points,
        swimmers 
      };
    });

  if (eventsList.length > 0) {
    eventData.sort((a, b) => eventsList.indexOf(a.fullEvent) - eventsList.indexOf(b.fullEvent));
  } else {
    eventData.sort((a, b) => b.points - a.points);
  }

  // Group by swimmer for drill-down
  let topSwimmers = Object.values(
    team.swimmers.reduce((acc, s) => {
      if (!acc[s.name]) {
        acc[s.name] = { 
          name: s.name, 
          points: 0, 
          swimmers: [],
          classYear: s.classYear
        };
      }
      acc[s.name].points += typeof s.points === 'number' ? s.points : 0;
      acc[s.name].swimmers.push(s);
      return acc;
    }, {} as Record<string, any>)
  ).sort((a, b) => b.points - a.points);
  
  if (searchQuery) {
    const lowerQ = searchQuery.toLowerCase();
    topSwimmers = topSwimmers.filter((s: any) => s.name.toLowerCase().includes(lowerQ));
  }

  // Group by event for drill-down
  let topEvents = Object.values(
    team.swimmers.reduce((acc, s) => {
      if (!acc[s.event]) {
        acc[s.event] = { 
          event: s.event, 
          points: 0, 
          swimmers: [],
        };
      }
      acc[s.event].points += typeof s.points === 'number' ? s.points : 0;
      acc[s.event].swimmers.push(s);
      return acc;
    }, {} as Record<string, any>)
  ).sort((a, b) => b.points - a.points);
  
  if (searchQuery) {
    const lowerQ = searchQuery.toLowerCase();
    topEvents = topEvents.filter((e: any) => e.event.toLowerCase().includes(lowerQ));
  }

  return (
    <div className={`neon-card rounded-md overflow-hidden mb-4`} style={{ borderLeftColor: team.color }}>
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-5 hover:bg-white/2 transition-colors"
      >
        <div className="flex flex-col items-start gap-1">
          <h3 className="text-sm font-black uppercase tracking-tighter text-[var(--text-primary)]">{team.teamName}</h3>
          <div className="flex gap-2">
            <span className="text-[9px] text-theme-secondary uppercase tracking-widest font-medium">NSISC • {topSwimmers.length} Athletes</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="block text-2xl font-black text-rose-400 font-mono tracking-tighter leading-none">
              {team.totalPoints.toFixed(1)}
            </span>
            <span className="text-[9px] text-theme-secondary uppercase tracking-widest font-medium font-mono">Projected Points</span>
          </div>
          {isExpanded ? <ChevronUp size={16} className="text-theme-secondary" /> : <ChevronDown size={16} className="text-theme-secondary" />}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-theme-soft surface-overlay"
          >
            <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Stats & Charts */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center gap-2">
                  <BarChart3 size={14} className="text-rose-400" />
                  <span className="text-[10px] font-medium uppercase tracking-widest text-theme-secondary">Total Points by Event & Class</span>
                </div>
                
                <div className="space-y-4">
                  {/* Event Chart */}
                  <div className="h-48 w-full surface-overlay p-2 rounded border border-theme-soft">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={eventData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 8, fontStyle: 'bold', fontFamily: 'JetBrains Mono' }} interval="preserveStartEnd" />
                        <YAxis hide domain={['auto', 'auto']} />
                        <Tooltip 
                          cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }}
                          contentStyle={{ background: '#0c0f16', border: '1px solid #1f2937', fontSize: '10px', color: '#fff', borderRadius: '8px', padding: '10px', minWidth: '250px' }}
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-[#0c0f16] border border-gray-800 p-3 rounded-lg shadow-xl shadow-black/50 z-50 pointer-events-auto">
                                  <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-800">
                                    <h4 className="font-bold text-rose-400 uppercase tracking-widest text-[11px]">{data.fullEvent}</h4>
                                    <span className="font-mono font-black text-[12px]">{data.points.toFixed(1)} PTS</span>
                                  </div>
                                  <div className="space-y-1 mt-2">
                                    {data.swimmers && data.swimmers.length > 0 ? data.swimmers.map((s: any, idx: number) => (
                                      <div key={idx} className="flex items-center justify-between text-[9px] py-1 border-b border-gray-800/50 last:border-0">
                                        <div className="flex items-center gap-2">
                                          <span className="w-4 font-mono text-gray-500">{s.rank || '-'}</span>
                                          {s.podium === 'gold' && <span className="text-yellow-400" title="Gold">🥇</span>}
                                          {s.podium === 'silver' && <span className="text-gray-300" title="Silver">🥈</span>}
                                          {s.podium === 'bronze' && <span className="text-orange-400" title="Bronze">🥉</span>}
                                          <span className="font-medium text-gray-200">{s.name}</span>
                                          {s.cutline_achieved && <span className="text-[8px] bg-rose-500/20 text-rose-400 px-1 rounded ml-1">CUT</span>}
                                        </div>
                                        <div className="flex gap-3 text-right">
                                          <span className="font-mono text-gray-500 w-12">{s.prelimsTime ? `P:${s.prelimsTime}` : ''}</span>
                                          <span className="font-mono text-gray-300 w-12">{s.finalsTime ? `F:${s.finalsTime}` : s.time}</span>
                                          <span className="font-mono text-emerald-400 font-bold w-6">{typeof s.points === 'number' ? s.points.toFixed(1) : s.points}</span>
                                        </div>
                                      </div>
                                    )) : (
                                      <div className="text-gray-500 text-[9px] italic">No scoring swimmers</div>
                                    )}
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="points" 
                          stroke="#F43F5E" 
                          strokeWidth={2} 
                          dot={{ r: 4, fill: '#0c0f16', stroke: '#F43F5E', strokeWidth: 2 }} 
                          activeDot={{ r: 6, fill: '#F43F5E', stroke: '#fff', strokeWidth: 2, onClick: (e, payload) => console.log('pinned', payload) }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Class Chart */}
                  <div className="h-40 w-full surface-overlay p-2 rounded border border-theme-soft">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={classData}>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10, fontStyle: 'bold', fontFamily: 'JetBrains Mono' }} />
                        <Tooltip 
                          cursor={{ fill: 'rgba(255,255,255,0.03)' }} 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              // Aggregate points by swimmer for the class
                              const swimmerPts: Record<string, number> = {};
                              data.swimmers.forEach((s: SwimmerResult) => {
                                if (!swimmerPts[s.name]) swimmerPts[s.name] = 0;
                                swimmerPts[s.name] += typeof s.points === 'number' ? s.points : 0;
                              });
                              const topPerformers = Object.entries(swimmerPts)
                                .sort((a, b) => b[1] - a[1])
                                .slice(0, 5);

                              return (
                                <div className="bg-[#0c0f16] border border-gray-800 p-3 rounded-lg shadow-xl shadow-black/50 z-50 pointer-events-auto min-w-[200px]">
                                  <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-800">
                                    <h4 className="font-bold text-rose-400 uppercase tracking-widest text-[11px]">Class of {data.name}</h4>
                                    <span className="font-mono font-black text-[12px]">{data.points.toFixed(1)} PTS</span>
                                  </div>
                                  <div className="space-y-1 mt-2">
                                    <div className="text-[9px] text-gray-500 font-bold uppercase mb-1">Top Performers</div>
                                    {topPerformers.length > 0 ? topPerformers.map(([name, pts], idx) => (
                                      <div key={idx} className="flex items-center justify-between text-[10px] py-0.5 border-b border-gray-800/30 last:border-0">
                                        <span className="font-medium text-gray-200 truncate pr-2">{name}</span>
                                        <span className="font-mono text-emerald-400 font-bold">{pts.toFixed(1)}</span>
                                      </div>
                                    )) : (
                                      <div className="text-gray-500 text-[9px] italic">No scoring swimmers</div>
                                    )}
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar dataKey="points" radius={[2, 2, 0, 0]}>
                          {classData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} opacity={0.8} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="flex justify-between mt-2 px-2 text-[10px] text-theme-secondary font-mono border-t border-theme-soft pt-2 italic uppercase">
                  <span>Chronological Event Scoring Timeline</span>
                  <span>{eventData.reduce((acc, d) => acc + d.points, 0).toFixed(1)} PTS TOTAL</span>
                </div>
              </div>

              {/* Individual/Event Matrix */}
              <div className="lg:col-span-7">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <List size={14} className="text-rose-400" />
                    <span className="text-[10px] font-medium uppercase tracking-widest text-theme-secondary">Team Matrix</span>
                  </div>
                  <div className="flex items-center surface-overlay border border-theme-soft rounded p-0.5">
                    <button 
                      onClick={() => setViewMode('event')}
                      className={`text-[9px] px-2 py-1 uppercase tracking-widest rounded ${viewMode === 'event' ? 'bg-[var(--surface-strong)]/60 text-[var(--text-primary)]' : 'text-theme-secondary hover:text-[var(--text-primary)]'}`}
                    >
                      By Event
                    </button>
                    <button 
                      onClick={() => setViewMode('swimmer')}
                      className={`text-[9px] px-2 py-1 uppercase tracking-widest rounded ${viewMode === 'swimmer' ? 'bg-[var(--surface-strong)]/60 text-[var(--text-primary)]' : 'text-theme-secondary hover:text-[var(--text-primary)]'}`}
                    >
                      By Swimmer
                    </button>
                  </div>
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {(viewMode === 'swimmer' ? topSwimmers : topEvents).map((group: any) => (
                    <div key={group.name || group.event} className="p-3 rounded surface-overlay border border-theme-soft group transition-all hover:border-[var(--border)]">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <h4 className="text-xs font-medium text-[var(--text-primary)] uppercase group-hover:text-[var(--text-accent)] transition-colors">
                            {viewMode === 'swimmer' ? group.name : group.event}
                          </h4>
                          {viewMode === 'swimmer' && (
                            <span className="px-1.5 py-0.5 rounded surface-overlay border border-theme-soft text-[9px] font-mono font-medium text-theme-secondary">
                              {group.classYear}
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-black text-[var(--text-primary)] text-xs">{group.points.toFixed(1)} <span className="text-[8px] text-theme-secondary">PTS</span></span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        {group.swimmers.map((res: SwimmerResult, i: number) => {
                          const timeSec = convertTimeToSeconds(res.time);
                          const cleanEvent = res.event.replace(" (Avg Split)", "").replace(/ Yard /i, " ").replace(/ Meter /i, " ").trim();
                          const cutsForEvent = cutlines.filter(c => c.gender.toUpperCase() === (gender === Gender.MEN ? 'MEN' : 'WOMEN') && c.event.toUpperCase() === cleanEvent.toUpperCase());
                          
                          const aCut = cutsForEvent.find(c => c.standard === 'A');
                          const bCut = cutsForEvent.find(c => c.standard === 'B');
                          
                          const aCutSec = aCut ? convertTimeToSeconds(aCut.time_25_26) : 0;
                          const bCutSec = bCut ? convertTimeToSeconds(bCut.time_25_26) : 0;
                          
                          const isACut = aCutSec > 0 && timeSec <= aCutSec;
                          const isBCut = !isACut && bCutSec > 0 && timeSec <= bCutSec;

                          const yearsRemaining = getYearsRemaining(res.classYear as ClassYear);
                          const targetProp = yearsRemaining === 1 ? 'proj_26_27' : yearsRemaining === 2 ? 'proj_27_28' : yearsRemaining >= 3 ? 'proj_28_29' : null;
                          let willMakeFutureCut = null;
                          if (targetProp && !res.isRelay) {
                             const futureACutSec = aCut ? convertTimeToSeconds((aCut as any)[targetProp]) : 0;
                             const futureBCutSec = bCut ? convertTimeToSeconds((bCut as any)[targetProp]) : 0;
                             if (futureACutSec > 0 && timeSec <= futureACutSec) willMakeFutureCut = 'A';
                             else if (futureBCutSec > 0 && timeSec <= futureBCutSec) willMakeFutureCut = 'B';
                          }

                          return (
                            <div key={i} className="flex items-center justify-between text-[10px] py-1.5 border-t border-theme-soft">
                              <div className="flex items-center gap-2 text-theme-secondary font-mono w-1/3">
                                <span className="w-4 font-medium text-theme-secondary">{res.rank || '-'}</span>
                                <span className="truncate max-w-[150px]" title={viewMode === 'swimmer' ? res.event : res.name}>
                                  {viewMode === 'swimmer' ? res.event : res.name}
                                </span>
                                {res.roundSwam && <span className="text-[8px] surface-overlay px-1 rounded truncate max-w-[60px]">{res.roundSwam}</span>}
                              </div>
                              <div className="flex flex-col items-end gap-0.5 justify-center w-1/3 text-right">
                                {res.prelimsTime && (
                                  <div className="text-[9px] text-theme-secondary font-mono">
                                    Prelim: {res.prelimsTime}
                                  </div>
                                )}
                                {res.finalsTime && (
                                  <div 
                                    className={`font-mono font-medium cursor-pointer hover:underline ${isACut ? 'text-rose-400' : isBCut ? 'text-amber-400' : 'text-theme-secondary'}`}
                                    onClick={() => { if(onUpdateTime && res.id) { setEditingResultId(res.id); setEditValue(res.time); } }}
                                  >
                                    Final: {res.finalsTime}
                                  </div>
                                )}
                                {!res.finalsTime && !res.prelimsTime && (
                                  <div 
                                    className={`font-mono font-medium cursor-pointer hover:underline ${isACut ? 'text-rose-400' : isBCut ? 'text-amber-400' : 'text-theme-secondary'}`}
                                    onClick={() => { if(onUpdateTime && res.id) { setEditingResultId(res.id); setEditValue(res.time); } }}
                                  >
                                    {res.time}
                                  </div>
                                )}
                                {willMakeFutureCut && (
                                  <div className="text-[8px] text-[var(--text-accent)] font-mono mt-0.5">
                                    Beats Future {willMakeFutureCut}-Cut ({targetProp?.replace('proj_', "'").replace('_', "-'")})
                                  </div>
                                )}
                                {editingResultId === res.id && (
                                  <form 
                                    onSubmit={(e) => {
                                      e.preventDefault();
                                      if(onUpdateTime && res.id) onUpdateTime(res.id, editValue);
                                      setEditingResultId(null);
                                    }}
                                    className="flex w-full mt-1 border border-theme-soft rounded overflow-hidden"
                                  >
                                    <input 
                                      type="text" 
                                      autoFocus
                                      value={editValue} 
                                      onChange={e => setEditValue(e.target.value)} 
                                      className="surface-muted-bg text-[10px] px-1 py-0.5 outline-none font-mono flex-1 text-[var(--text-primary)]" 
                                      onBlur={() => setEditingResultId(null)}
                                    />
                                  </form>
                                )}
                              </div>
                              <div className="flex items-center justify-end gap-2 w-1/3">
                                {isACut && <span title="Current A Cut Achieved" className="text-[8px] bg-rose-400/10 text-rose-400 px-1 border border-rose-400/30 rounded-sm">A CUT</span>}
                                {isBCut && <span title="Current B Cut Achieved" className="text-[8px] bg-amber-400/10 text-amber-400 px-1 border border-amber-400/30 rounded-sm">B CUT</span>}
                                <span className={`font-mono font-medium w-8 text-right ${res.points === 'N/A' || res.points === 0 ? 'text-theme-secondary' : 'text-emerald-500'}`}>
                                  {res.points === 'N/A' ? 'N/A' : `+${res.points}`}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
