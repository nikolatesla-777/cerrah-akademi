"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function BulletinPage() {
    const [fixtures, setFixtures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('ALL'); // ALL, LIVE, FINISHED, SCHEDULED
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        fetchFixtures();

        // Realtime Subscription
        const channel = supabase
            .channel('public:fixtures')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'fixtures' }, (payload) => {
                fetchFixtures();
            })
            .subscribe();

        // Load favorites from local storage
        const storedFavs = localStorage.getItem('favorites');
        if (storedFavs) setFavorites(JSON.parse(storedFavs));

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchFixtures = async () => {
        const { data, error } = await supabase
            .from('fixtures')
            .select('*')
            .order('match_time', { ascending: true });

        if (error) console.error('Error fetching fixtures:', error);
        else setFixtures(data || []);
        setLoading(false);
    };

    const toggleFavorite = (matchId) => {
        const newFavs = favorites.includes(matchId)
            ? favorites.filter(id => id !== matchId)
            : [...favorites, matchId];
        setFavorites(newFavs);
        localStorage.setItem('favorites', JSON.stringify(newFavs));
    };

    const filterFixtures = () => {
        let filtered = fixtures;

        // 1. Tab Filter
        if (activeTab === 'LIVE') {
            filtered = filtered.filter(f => f.status === 'LIVE');
        } else if (activeTab === 'FINISHED') {
            filtered = filtered.filter(f => f.status === 'FINISHED');
        } else if (activeTab === 'SCHEDULED') {
            filtered = filtered.filter(f => f.status === 'NOT_STARTED');
        }

        // 2. Date Filter (Simplified for now - strictly matching day)
        // In a real app, we'd compare dates properly. For this demo, we might skip strict date filtering 
        // if the mock data dates are random, but let's try to be somewhat realistic or just show all for 'ALL'.
        // For now, let's keep it simple: Tabs control status. Date picker is visual/functional placeholder 
        // or filters if we had real date data spanning multiple days.

        return filtered;
    };

    const groupedFixtures = filterFixtures().reduce((acc, fixture) => {
        const league = fixture.league || 'Diğer';
        if (!acc[league]) acc[league] = [];
        acc[league].push(fixture);
        return acc;
    }, {});

    // Sort leagues: Favorites first
    const sortedLeagues = Object.entries(groupedFixtures).sort(([leagueA, matchesA], [leagueB, matchesB]) => {
        const aHasFav = matchesA.some(m => favorites.includes(m.id));
        const bHasFav = matchesB.some(m => favorites.includes(m.id));
        if (aHasFav && !bHasFav) return -1;
        if (!aHasFav && bHasFav) return 1;
        return 0;
    });

    const formatDate = (date) => {
        return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', weekday: 'short' }).toUpperCase();
    };

    const changeDate = (days) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + days);
        setSelectedDate(newDate);
    };

    return (
        <div className="bulletin-page">
            {/* Header / Filter Bar */}
            <div className="filter-bar">
                <div className="tabs">
                    <button className={activeTab === 'ALL' ? 'active' : ''} onClick={() => setActiveTab('ALL')}>TÜMÜ</button>
                    <button className={activeTab === 'LIVE' ? 'active' : ''} onClick={() => setActiveTab('LIVE')}>CANLI</button>
                    <button className={activeTab === 'ODDS' ? 'active' : ''} onClick={() => setActiveTab('ODDS')}>ORANLAR</button>
                    <button className={activeTab === 'FINISHED' ? 'active' : ''} onClick={() => setActiveTab('FINISHED')}>BİTMİŞ</button>
                    <button className={activeTab === 'SCHEDULED' ? 'active' : ''} onClick={() => setActiveTab('SCHEDULED')}>PROGRAM</button>
                </div>

                <div className="date-selector">
                    <button onClick={() => changeDate(-1)}>‹</button>
                    <span className="current-date">📅 {formatDate(selectedDate)}</span>
                    <button onClick={() => changeDate(1)}>›</button>
                </div>
            </div>

            {loading ? (
                <div className="loading">Yükleniyor...</div>
            ) : sortedLeagues.length === 0 ? (
                <div className="empty-state">Maç bulunamadı.</div>
            ) : (
                <div className="fixtures-list">
                    {sortedLeagues.map(([league, matches]) => (
                        <div key={league} className="league-group">
                            <div className="league-header">
                                <div className="league-info">
                                    <span className="flag-icon">⚽</span>
                                    <span className="league-name">{league}</span>
                                </div>
                                <a href="#" className="standings-link">Puan Durumu</a>
                            </div>
                            <div className="matches-rows">
                                {matches.map(match => (
                                    <div key={match.id} className={`match-row ${match.status === 'LIVE' ? 'live' : ''}`}>

                                        {/* Favorite Star */}
                                        <div className="col-star" onClick={() => toggleFavorite(match.id)}>
                                            <span className={`star-icon ${favorites.includes(match.id) ? 'active' : ''}`}>
                                                {favorites.includes(match.id) ? '★' : '☆'}
                                            </span>
                                        </div>

                                        {/* Status / Time */}
                                        <div className="col-status">
                                            {match.status === 'LIVE' ? (
                                                <span className="status-live">Canlı</span>
                                            ) : match.status === 'FINISHED' ? (
                                                <span className="status-finished">Bitti</span>
                                            ) : (
                                                <span className="match-time">
                                                    {new Date(match.match_time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            )}
                                        </div>

                                        {/* Teams & Score */}
                                        <div className="col-match">
                                            <div className={`team home ${match.score && parseInt(match.score.split('-')[0]) > parseInt(match.score.split('-')[1]) ? 'winner' : ''}`}>
                                                {match.home_team}
                                            </div>
                                            <div className="score-box">
                                                {match.status === 'NOT_STARTED' ? '-' : match.score}
                                            </div>
                                            <div className={`team away ${match.score && parseInt(match.score.split('-')[1]) > parseInt(match.score.split('-')[0]) ? 'winner' : ''}`}>
                                                {match.away_team}
                                            </div>
                                        </div>

                                        {/* Odds */}
                                        <div className="col-odds">
                                            <div className="odd-btn" title="1">
                                                <span className="val">{match.odds?.['1'] || '-'}</span>
                                            </div>
                                            <div className="odd-btn" title="X">
                                                <span className="val">{match.odds?.['X'] || '-'}</span>
                                            </div>
                                            <div className="odd-btn" title="2">
                                                <span className="val">{match.odds?.['2'] || '-'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style jsx>{`
                .bulletin-page {
                    max-width: 900px;
                    margin: 0 auto;
                    font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                    color: #e2e8f0;
                }

                /* Filter Bar */
                .filter-bar {
                    background: #1e293b;
                    border-radius: 8px;
                    padding: 0.5rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                    flex-wrap: wrap;
                    gap: 1rem;
                }

                .tabs { display: flex; gap: 0.25rem; }
                .tabs button {
                    background: transparent;
                    border: none;
                    color: #94a3b8;
                    font-weight: 600;
                    font-size: 0.85rem;
                    padding: 0.5rem 1rem;
                    cursor: pointer;
                    border-radius: 4px;
                    transition: all 0.2s;
                }
                .tabs button:hover { color: #fff; background: rgba(255,255,255,0.05); }
                .tabs button.active { background: #ef4444; color: #fff; }

                .date-selector {
                    display: flex;
                    align-items: center;
                    background: #0f172a;
                    border-radius: 4px;
                    padding: 0.25rem;
                }
                .date-selector button {
                    background: none; border: none; color: #94a3b8; cursor: pointer; padding: 0 0.5rem; font-size: 1.2rem;
                }
                .current-date { font-size: 0.85rem; font-weight: 600; color: #fff; margin: 0 0.5rem; }

                /* League Group */
                .league-group {
                    margin-bottom: 0.5rem;
                    background: #fff; /* Flashscore uses white/light bg for rows usually, but we are dark mode */
                    background: #1e293b;
                    border-radius: 4px;
                    overflow: hidden;
                }
                .league-header {
                    background: #0f172a; /* Darker header */
                    padding: 0.4rem 0.8rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid #334155;
                }
                .league-info { display: flex; align-items: center; gap: 0.5rem; }
                .league-name { font-weight: 700; font-size: 0.8rem; color: #f1f5f9; text-transform: uppercase; }
                .standings-link { font-size: 0.75rem; color: #94a3b8; text-decoration: none; }
                .standings-link:hover { text-decoration: underline; }

                /* Match Row */
                .match-row {
                    display: grid;
                    grid-template-columns: 30px 50px 1fr 120px; /* Star | Time | Match | Odds */
                    align-items: center;
                    padding: 0.5rem 0.8rem;
                    border-bottom: 1px solid #334155;
                    font-size: 0.85rem;
                    height: 40px; /* Tighter row */
                }
                .match-row:last-child { border-bottom: none; }
                .match-row:hover { background: #263345; }
                
                /* Live State */
                .match-row.live { background: rgba(239, 68, 68, 0.08); }
                .match-row.live .status-live { color: #ef4444; }
                .match-row.live .score-box { color: #ef4444; }

                /* Columns */
                .col-star { cursor: pointer; display: flex; justify-content: center; }
                .star-icon { color: #475569; font-size: 1.1rem; transition: color 0.2s; }
                .star-icon.active { color: #fbbf24; } /* Gold star */
                .star-icon:hover { color: #fbbf24; }

                .col-status { text-align: center; color: #94a3b8; font-size: 0.75rem; }
                
                .col-match { display: flex; align-items: center; justify-content: center; gap: 0.8rem; }
                .team { flex: 1; color: #cbd5e1; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .team.home { text-align: right; }
                .team.away { text-align: left; }
                .team.winner { color: #fff; font-weight: 700; }
                
                .score-box { 
                    font-weight: 700; 
                    color: #fff; 
                    min-width: 30px; 
                    text-align: center; 
                }

                .col-odds { display: flex; gap: 2px; justify-content: flex-end; }
                .odd-btn {
                    display: flex; align-items: center; justify-content: center;
                    width: 36px; height: 28px;
                    background: #334155;
                    border-radius: 2px;
                    font-size: 0.75rem;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .odd-btn:hover { background: #475569; }
                .odd-btn .val { color: #fff; font-weight: 600; }

                /* Mobile Responsive */
                @media (max-width: 600px) {
                    .filter-bar { flex-direction: column; align-items: stretch; }
                    .tabs { overflow-x: auto; padding-bottom: 0.5rem; }
                    .date-selector { justify-content: center; }
                    
                    .match-row {
                        grid-template-columns: 24px 40px 1fr;
                        grid-template-rows: auto auto;
                        height: auto;
                        padding: 0.6rem 0.5rem;
                        gap: 0.2rem;
                    }
                    .col-odds {
                        grid-column: 1 / -1;
                        justify-content: center;
                        margin-top: 0.2rem;
                        width: 100%;
                        gap: 0.5rem;
                    }
                    .odd-btn { width: 30%; height: 32px; background: #273548; }
                }
            `}</style>
        </div>
    );
}
