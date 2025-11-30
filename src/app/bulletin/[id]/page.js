"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function MatchDetailPage() {
    const { id } = useParams();
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

    if (loading) return <div className="p-8 text-center text-slate-400">Yükleniyor...</div>;
    if (!match) return <div className="p-8 text-center text-slate-400">Maç bulunamadı.</div>;

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 font-sans pb-20">
            {/* Header */}
            <div className="bg-slate-800 p-6 shadow-lg border-b border-slate-700">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-4 text-sm text-slate-400">
                        <div className="flex items-center gap-2">
                            {match.country_flag && <img src={match.country_flag} className="w-5 h-4 object-cover rounded" />}
                            <span>{match.country} - {match.league}</span>
                        </div>
                        <div>{new Date(match.match_time).toLocaleString('tr-TR')}</div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex flex-col items-center flex-1">
                            <img src={match.home_team_logo} className="w-16 h-16 object-contain mb-2" />
                            <span className="font-bold text-lg text-center">{match.home_team}</span>
                        </div>

                        <div className="flex flex-col items-center px-6">
                            <div className="text-4xl font-black text-white tracking-widest bg-slate-700/50 px-6 py-2 rounded-lg">
                                {match.score}
                            </div>
                            <div className="mt-2 text-emerald-400 font-semibold">{match.status === 'LIVE' ? `${match.minute}'` : match.status}</div>
                        </div>

                        <div className="flex flex-col items-center flex-1">
                            <img src={match.away_team_logo} className="w-16 h-16 object-contain mb-2" />
                            <span className="font-bold text-lg text-center">{match.away_team}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto flex overflow-x-auto">
                    {['SUMMARY', 'STATS', 'H2H', 'STANDINGS', 'PREDICTIONS'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-4 font-semibold text-sm transition-colors border-b-2 ${activeTab === tab
                                ? 'border-emerald-500 text-emerald-400'
                                : 'border-transparent text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            {tab === 'SUMMARY' && 'ÖZET'}
                            {tab === 'STATS' && 'İSTATİSTİK'}
                            {tab === 'H2H' && 'KARŞILAŞMALAR'}
                            {tab === 'STANDINGS' && 'PUAN DURUMU'}
                            {tab === 'PREDICTIONS' && 'TAHMİNLER'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto p-4">
                {activeTab === 'SUMMARY' && (
                    <div className="space-y-4">
                        {/* Odds */}
                        {match.odds && (
                            <div className="bg-slate-800 rounded-lg p-4">
                                <h3 className="text-slate-400 text-xs font-bold uppercase mb-3">Maç Oranları</h3>
                                <div className="grid grid-cols-3 gap-2">
                                    {Object.entries(match.odds).map(([key, val]) => (
                                        <div key={key} className="bg-slate-700 p-2 rounded flex justify-between items-center">
                                            <span className="text-slate-400 text-sm">{key}</span>
                                            <span className="text-emerald-400 font-bold">{val}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Lineups (If available) */}
                        {match.lineups && match.lineups.length > 0 && (
                            <div className="bg-slate-800 rounded-lg p-4">
                                <h3 className="text-slate-400 text-xs font-bold uppercase mb-3">Kadrolar</h3>
                                <div className="grid grid-cols-2 gap-8">
                                    {match.lineups.map((team, idx) => (
                                        <div key={idx}>
                                            <div className="font-bold mb-2 text-emerald-500">{team.team.name} <span className="text-xs text-slate-500">({team.formation})</span></div>
                                            <div className="space-y-1">
                                                {team.startXI.map((player, pIdx) => (
                                                    <div key={pIdx} className="flex items-center gap-2 text-sm">
                                                        <span className="w-6 text-slate-500 text-xs">{player.player.number}</span>
                                                        <span>{player.player.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'STATS' && (
                    <div className="bg-slate-800 rounded-lg p-4">
                        {match.statistics && match.statistics.length > 0 ? (
                            <div className="space-y-2">
                                {match.statistics[0].statistics.map((stat, idx) => {
                                    const homeVal = stat.value ?? 0;
                                    const awayVal = match.statistics[1].statistics[idx].value ?? 0;
                                    const total = (typeof homeVal === 'number' ? homeVal : 0) + (typeof awayVal === 'number' ? awayVal : 0);
                                    const homePercent = total === 0 ? 50 : (homeVal / total) * 100;

                                    return (
                                        <div key={idx} className="py-2 border-b border-slate-700 last:border-0">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="font-bold">{homeVal}</span>
                                                <span className="text-slate-400 text-xs uppercase">{stat.type}</span>
                                                <span className="font-bold">{awayVal}</span>
                                            </div>
                                            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden flex">
                                                <div className="bg-emerald-500 h-full" style={{ width: `${homePercent}%` }}></div>
                                                <div className="bg-rose-500 h-full flex-1"></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center text-slate-500 py-8">İstatistik bulunamadı.</div>
                        )}
                    </div>
                )}

                {activeTab === 'H2H' && (
                    <div className="space-y-2">
                        {match.h2h && match.h2h.length > 0 ? (
                            match.h2h.map((h, idx) => (
                                <div key={idx} className="bg-slate-800 p-3 rounded flex items-center justify-between text-sm">
                                    <div className="text-slate-400 w-24">{new Date(h.fixture.date).toLocaleDateString()}</div>
                                    <div className="flex-1 flex justify-end items-center gap-2">
                                        <span>{h.teams.home.name}</span>
                                        <img src={h.teams.home.logo} className="w-5 h-5" />
                                    </div>
                                    <div className="px-4 font-bold bg-slate-700 py-1 rounded mx-2">
                                        {h.goals.home} - {h.goals.away}
                                    </div>
                                    <div className="flex-1 flex justify-start items-center gap-2">
                                        <img src={h.teams.away.logo} className="w-5 h-5" />
                                        <span>{h.teams.away.name}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-slate-500 py-8">Geçmiş maç verisi yok.</div>
                        )}
                    </div>
                )}

                {activeTab === 'STANDINGS' && (
                    <div className="bg-slate-800 rounded-lg overflow-hidden">
                        {match.standings && match.standings.length > 0 ? (
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-700 text-slate-300 uppercase text-xs">
                                    <tr>
                                        <th className="p-3 text-center">#</th>
                                        <th className="p-3">Takım</th>
                                        <th className="p-3 text-center">O</th>
                                        <th className="p-3 text-center">Av</th>
                                        <th className="p-3 text-center">P</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {match.standings[0].map((team) => (
                                        <tr key={team.team.id} className={`border-b border-slate-700 ${team.team.name === match.home_team || team.team.name === match.away_team ? 'bg-slate-700/50' : ''}`}>
                                            <td className="p-3 text-center font-bold">{team.rank}</td>
                                            <td className="p-3 flex items-center gap-2">
                                                <img src={team.team.logo} className="w-5 h-5" />
                                                <span>{team.team.name}</span>
                                            </td>
                                            <td className="p-3 text-center">{team.all.played}</td>
                                            <td className="p-3 text-center">{team.goalsDiff}</td>
                                            <td className="p-3 text-center font-bold text-emerald-400">{team.points}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="text-center text-slate-500 py-8">Puan durumu bulunamadı.</div>
                        )}
                    </div>
                )}

                {activeTab === 'PREDICTIONS' && (
                    <div className="space-y-4">
                        {match.predictions && match.predictions.length > 0 ? (
                            match.predictions.map((pred, idx) => (
                                <div key={idx} className="bg-slate-800 p-6 rounded-lg">
                                    <div className="mb-6">
                                        <h3 className="text-emerald-400 font-bold uppercase mb-2">Kazanan Tahmini</h3>
                                        <div className="text-2xl font-black">{pred.predictions.winner.name} <span className="text-slate-500 text-lg font-normal">{pred.predictions.winner.comment}</span></div>
                                    </div>

                                    <div className="mb-6">
                                        <h3 className="text-slate-400 text-xs font-bold uppercase mb-2">Kazanma İhtimali</h3>
                                        <div className="flex h-4 rounded-full overflow-hidden bg-slate-700">
                                            <div className="bg-emerald-500" style={{ width: pred.predictions.percent.home }}></div>
                                            <div className="bg-slate-500" style={{ width: pred.predictions.percent.draw }}></div>
                                            <div className="bg-rose-500" style={{ width: pred.predictions.percent.away }}></div>
                                        </div>
                                        <div className="flex justify-between text-xs mt-1 text-slate-400">
                                            <span>Ev: {pred.predictions.percent.home}</span>
                                            <span>Beraberlik: {pred.predictions.percent.draw}</span>
                                            <span>Deplasman: {pred.predictions.percent.away}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-700 p-4 rounded">
                                            <div className="text-slate-400 text-xs uppercase">Gol Tahmini</div>
                                            <div className="font-bold">{pred.predictions.goals.home} - {pred.predictions.goals.away}</div>
                                        </div>
                                        <div className="bg-slate-700 p-4 rounded">
                                            <div className="text-slate-400 text-xs uppercase">Tavsiye</div>
                                            <div className="font-bold text-emerald-400">{pred.predictions.advice}</div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-slate-500 py-8">Tahmin bulunamadı.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
