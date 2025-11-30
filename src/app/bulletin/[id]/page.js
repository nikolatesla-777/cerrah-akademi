"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function MatchDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [match, setMatch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('SUMMARY'); // SUMMARY, STATS, H2H, STANDINGS, PREDICTIONS

    useEffect(() => {
        if (id) {
            fetchMatchData();
        }
    }, [id]);

    const fetchMatchData = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('fixtures')
            .select('*')
            .eq('external_id', id)
            .single();

        if (data) {
            setMatch(data);

            // Check if we need to fetch details (if stats or h2h are missing)
            if (!data.statistics || !data.h2h) {
                fetch('/api/match-details', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fixtureId: id })
                })
                    .then(res => res.json())
                    .then(res => {
                        if (res.success) {
                            // Re-fetch match data to get updated details
                            fetchMatchData();
                        }
                    })
                    .catch(err => console.error('Error triggering detail fetch:', err));
            }
        }
        setLoading(false);
    };

    if (loading) return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
    );

    if (!match) return (
        <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center text-slate-400">
            <div className="text-2xl font-bold mb-4">Maç Bulunamadı</div>
            <button onClick={() => router.back()} className="text-emerald-500 hover:underline">Geri Dön</button>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans pb-20">
            {/* Header - Glassmorphism & Gradient */}
            <div className="relative bg-gradient-to-b from-slate-800 to-[#0f172a] border-b border-slate-800 pb-8 pt-6">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="absolute top-6 left-6 p-2 bg-slate-800/50 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-white"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                </button>

                <div className="max-w-4xl mx-auto px-4">
                    {/* League Info */}
                    <div className="flex flex-col items-center justify-center mb-8 gap-2">
                        <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-emerald-400 uppercase bg-emerald-500/10 px-3 py-1 rounded-full">
                            {match.country_flag && <img src={match.country_flag} className="w-4 h-3 object-cover rounded-sm" alt={match.country} />}
                            <span>{match.country}</span>
                            <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                            <span>{match.league}</span>
                        </div>
                        <div className="text-slate-500 text-sm font-medium">
                            {new Date(match.match_time).toLocaleString('tr-TR', { dateStyle: 'long', timeStyle: 'short' })}
                        </div>
                    </div>

                    {/* Scoreboard */}
                    <div className="flex items-center justify-between md:justify-center md:gap-16">
                        {/* Home Team */}
                        <div className="flex flex-col items-center flex-1 md:flex-none md:w-48">
                            <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-800/50 rounded-2xl p-4 mb-4 shadow-lg backdrop-blur-sm flex items-center justify-center border border-slate-700/50">
                                <img src={match.home_team_logo} className="w-full h-full object-contain" alt={match.home_team} />
                            </div>
                            <span className="font-bold text-lg md:text-xl text-center leading-tight">{match.home_team}</span>
                        </div>

                        {/* Score */}
                        <div className="flex flex-col items-center px-4">
                            <div className="relative">
                                <div className="text-5xl md:text-7xl font-black text-white tracking-tighter flex items-center gap-4">
                                    <span>{match.score?.split('-')[0] ?? '-'}</span>
                                    <span className="text-slate-600 text-4xl">:</span>
                                    <span>{match.score?.split('-')[1] ?? '-'}</span>
                                </div>
                                {match.status === 'LIVE' && (
                                    <div className="absolute -top-4 -right-4 flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                    </div>
                                )}
                            </div>
                            <div className={`mt-4 px-4 py-1 rounded-full text-sm font-bold ${match.status === 'LIVE' ? 'bg-emerald-500 text-white animate-pulse' :
                                match.status === 'FINISHED' ? 'bg-slate-700 text-slate-300' :
                                    'bg-slate-800 text-slate-400'
                                }`}>
                                {match.status === 'LIVE' ? `${match.minute}'` :
                                    match.status === 'FINISHED' ? 'MAÇ SONUCU' :
                                        new Date(match.match_time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>

                        {/* Away Team */}
                        <div className="flex flex-col items-center flex-1 md:flex-none md:w-48">
                            <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-800/50 rounded-2xl p-4 mb-4 shadow-lg backdrop-blur-sm flex items-center justify-center border border-slate-700/50">
                                <img src={match.away_team_logo} className="w-full h-full object-contain" alt={match.away_team} />
                            </div>
                            <span className="font-bold text-lg md:text-xl text-center leading-tight">{match.away_team}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="sticky top-0 z-20 bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-800 shadow-sm">
                <div className="max-w-4xl mx-auto flex overflow-x-auto no-scrollbar">
                    {['SUMMARY', 'STATS', 'H2H', 'STANDINGS', 'PREDICTIONS'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`relative px-6 py-4 font-bold text-sm transition-all whitespace-nowrap ${activeTab === tab ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            {tab === 'SUMMARY' && 'ÖZET'}
                            {tab === 'STATS' && 'İSTATİSTİK'}
                            {tab === 'H2H' && 'KARŞILAŞMALAR'}
                            {tab === 'STANDINGS' && 'PUAN DURUMU'}
                            {tab === 'PREDICTIONS' && 'TAHMİNLER'}

                            {activeTab === tab && (
                                <span className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500 rounded-t-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-4xl mx-auto p-4 md:p-6 min-h-[500px]">
                {activeTab === 'SUMMARY' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Match Events Timeline */}
                        {match.events && match.events.length > 0 ? (
                            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <span className="w-1 h-4 bg-emerald-500 rounded-full"></span>
                                    Maç Özeti
                                </h3>
                                <div className="space-y-4 relative">
                                    {/* Central Line */}
                                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-700/50 -translate-x-1/2"></div>

                                    {match.events.map((event, idx) => {
                                        const isHome = event.team.id === match.lineups?.[0]?.team?.id || event.team.name === match.home_team;

                                        return (
                                            <div key={idx} className={`flex items-center ${isHome ? 'flex-row' : 'flex-row-reverse'} gap-4 group`}>
                                                {/* Event Detail */}
                                                <div className={`flex-1 flex items-center gap-3 ${isHome ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`flex flex-col ${isHome ? 'items-end' : 'items-start'}`}>
                                                        <span className="text-sm font-bold text-slate-200">{event.player.name}</span>
                                                        {event.assist.name && <span className="text-xs text-slate-500">Asist: {event.assist.name}</span>}
                                                        <span className="text-xs text-slate-400 capitalize">{event.detail}</span>
                                                    </div>

                                                    {/* Icon based on type */}
                                                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 border border-slate-700 shadow-sm">
                                                        {event.type === 'Goal' && <span className="text-lg">⚽</span>}
                                                        {event.type === 'Card' && (
                                                            <div className={`w-3 h-4 rounded-sm ${event.detail.includes('Yellow') ? 'bg-yellow-400' : 'bg-red-500'}`}></div>
                                                        )}
                                                        {event.type === 'subst' && <span className="text-lg">⇄</span>}
                                                        {event.type === 'Var' && <span className="text-lg font-bold text-slate-400">VAR</span>}
                                                    </div>
                                                </div>

                                                {/* Minute Badge */}
                                                <div className="relative z-10 w-10 h-10 flex items-center justify-center bg-slate-900 rounded-full border-2 border-slate-700 group-hover:border-emerald-500 transition-colors shadow-lg">
                                                    <span className="text-xs font-bold text-emerald-400">{event.time.elapsed}'</span>
                                                </div>

                                                {/* Spacer for opposite side */}
                                                <div className="flex-1"></div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-slate-500 py-12 bg-slate-800/30 rounded-2xl border border-slate-800 border-dashed">
                                {match.status === 'NS' ? 'Maç henüz başlamadı.' : 'Henüz bir olay yok.'}
                            </div>
                        )}

                        {/* Odds Card (moved below events) */}
                        {match.odds && (
                            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <span className="w-1 h-4 bg-emerald-500 rounded-full"></span>
                                    Maç Oranları
                                </h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {Object.entries(match.odds).map(([key, val]) => (
                                        <div key={key} className="bg-slate-900/50 p-4 rounded-xl flex flex-col items-center justify-center border border-slate-800 hover:border-emerald-500/30 transition-colors group">
                                            <span className="text-slate-500 text-xs font-bold mb-1 group-hover:text-emerald-400 transition-colors">{key}</span>
                                            <span className="text-white font-black text-xl">{val}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'STATS' && (
                    <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {match.statistics && match.statistics.length > 0 ? (
                            <div className="space-y-6">
                                {match.statistics[0].statistics.map((stat, idx) => {
                                    const homeVal = stat.value ?? 0;
                                    const awayVal = match.statistics[1].statistics[idx].value ?? 0;
                                    const total = (typeof homeVal === 'number' ? homeVal : 0) + (typeof awayVal === 'number' ? awayVal : 0);

                                    // Handle percentage strings if API returns "50%"
                                    const homeNum = typeof homeVal === 'string' ? parseInt(homeVal) : homeVal;
                                    const awayNum = typeof awayVal === 'string' ? parseInt(awayVal) : awayVal;
                                    const totalNum = homeNum + awayNum;

                                    const homePercent = totalNum === 0 ? 50 : (homeNum / totalNum) * 100;

                                    return (
                                        <div key={idx} className="group">
                                            <div className="flex justify-between text-sm mb-2 font-medium">
                                                <span className="text-emerald-400">{homeVal}</span>
                                                <span className="text-slate-400 text-xs uppercase tracking-wider">{stat.type}</span>
                                                <span className="text-rose-400">{awayVal}</span>
                                            </div>
                                            <div className="h-2 bg-slate-900 rounded-full overflow-hidden flex shadow-inner">
                                                <div className="bg-emerald-500 h-full transition-all duration-1000 ease-out relative group-hover:brightness-110" style={{ width: `${homePercent}%` }}></div>
                                                <div className="bg-rose-500 h-full flex-1 transition-all duration-1000 ease-out relative group-hover:brightness-110"></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center text-slate-500 py-12">İstatistik verisi henüz oluşmadı.</div>
                        )}
                    </div>
                )}

                {activeTab === 'H2H' && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {match.h2h && match.h2h.length > 0 ? (
                            match.h2h.map((h, idx) => (
                                <div key={idx} className="bg-slate-800/50 hover:bg-slate-800 transition-colors p-4 rounded-xl border border-slate-700/50 flex items-center justify-between text-sm group">
                                    <div className="text-slate-500 w-24 text-xs font-mono">{new Date(h.fixture.date).toLocaleDateString()}</div>

                                    <div className="flex-1 flex justify-end items-center gap-3">
                                        <span className={`font-medium ${h.teams.home.winner ? 'text-emerald-400' : 'text-slate-300'}`}>{h.teams.home.name}</span>
                                        <img src={h.teams.home.logo} className="w-6 h-6 object-contain" />
                                    </div>

                                    <div className="px-4 py-1 bg-slate-900 rounded-lg font-bold text-white mx-4 border border-slate-700 group-hover:border-emerald-500/50 transition-colors">
                                        {h.goals.home} - {h.goals.away}
                                    </div>

                                    <div className="flex-1 flex justify-start items-center gap-3">
                                        <img src={h.teams.away.logo} className="w-6 h-6 object-contain" />
                                        <span className={`font-medium ${h.teams.away.winner ? 'text-emerald-400' : 'text-slate-300'}`}>{h.teams.away.name}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-slate-500 py-12 bg-slate-800/30 rounded-2xl border border-slate-800 border-dashed">Geçmiş maç verisi yok.</div>
                        )}
                    </div>
                )}

                {activeTab === 'STANDINGS' && (
                    <div className="bg-slate-800/50 rounded-2xl overflow-hidden border border-slate-700/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {match.standings && match.standings.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-900/80 text-slate-400 uppercase text-xs tracking-wider font-bold">
                                        <tr>
                                            <th className="p-4 text-center w-12">#</th>
                                            <th className="p-4">Takım</th>
                                            <th className="p-4 text-center w-12">O</th>
                                            <th className="p-4 text-center w-12">Av</th>
                                            <th className="p-4 text-center w-12">P</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700/50">
                                        {match.standings[0].map((team) => {
                                            const isMatchTeam = team.team.name === match.home_team || team.team.name === match.away_team;
                                            return (
                                                <tr key={team.team.id} className={`transition-colors ${isMatchTeam ? 'bg-emerald-500/10 hover:bg-emerald-500/20' : 'hover:bg-slate-700/30'}`}>
                                                    <td className="p-4 text-center font-bold text-slate-500">{team.rank}</td>
                                                    <td className="p-4 flex items-center gap-3">
                                                        <img src={team.team.logo} className="w-6 h-6 object-contain" />
                                                        <span className={`font-medium ${isMatchTeam ? 'text-emerald-400' : 'text-slate-200'}`}>{team.team.name}</span>
                                                    </td>
                                                    <td className="p-4 text-center text-slate-400">{team.all.played}</td>
                                                    <td className="p-4 text-center text-slate-400">{team.goalsDiff}</td>
                                                    <td className="p-4 text-center font-black text-white">{team.points}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center text-slate-500 py-12">Puan durumu bulunamadı.</div>
                        )}
                    </div>
                )}

                {activeTab === 'PREDICTIONS' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {match.predictions && match.predictions.length > 0 ? (
                            match.predictions.map((pred, idx) => (
                                <div key={idx} className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
                                    <div className="mb-8 text-center">
                                        <h3 className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-3">Yapay Zeka Tahmini</h3>
                                        <div className="text-3xl md:text-4xl font-black text-white mb-2">{pred.predictions.winner.name}</div>
                                        <div className="text-slate-400 text-sm">{pred.predictions.winner.comment}</div>
                                    </div>

                                    <div className="mb-8">
                                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                                            <span>Ev Sahibi</span>
                                            <span>Beraberlik</span>
                                            <span>Deplasman</span>
                                        </div>
                                        <div className="flex h-6 rounded-full overflow-hidden bg-slate-900 shadow-inner">
                                            <div className="bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-white transition-all duration-1000" style={{ width: pred.predictions.percent.home }}>{pred.predictions.percent.home}</div>
                                            <div className="bg-slate-600 flex items-center justify-center text-[10px] font-bold text-white transition-all duration-1000" style={{ width: pred.predictions.percent.draw }}>{pred.predictions.percent.draw}</div>
                                            <div className="bg-rose-500 flex items-center justify-center text-[10px] font-bold text-white transition-all duration-1000" style={{ width: pred.predictions.percent.away }}>{pred.predictions.percent.away}</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                                            <div className="text-slate-500 text-xs uppercase font-bold mb-1">Gol Beklentisi</div>
                                            <div className="font-black text-xl text-white">{pred.predictions.goals.home} - {pred.predictions.goals.away}</div>
                                        </div>
                                        <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
                                            <div className="text-emerald-400 text-xs uppercase font-bold mb-1">Önerilen Bahis</div>
                                            <div className="font-black text-xl text-emerald-300">{pred.predictions.advice}</div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-slate-500 py-12 bg-slate-800/30 rounded-2xl border border-slate-800 border-dashed">Tahmin bulunamadı.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
