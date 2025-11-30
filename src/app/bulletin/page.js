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
        fetchFixtures(selectedDate);

        // Realtime Subscription
        const channel = supabase
            .channel('public:fixtures')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'fixtures' }, (payload) => {
                fetchFixtures(selectedDate);
            })
            .subscribe();

        // Load favorites from local storage
        const storedFavs = localStorage.getItem('favorites');
        if (storedFavs) setFavorites(JSON.parse(storedFavs));

        return () => {
            supabase.removeChannel(channel);
        };
    }, [selectedDate]); // Re-fetch when date changes

    const fetchFixtures = async (date) => {
        setLoading(true);

        // Calculate Local Start/End of Day in UTC
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const { data, error } = await supabase
            .from('fixtures')
            .select('*')
            .gte('match_time', startOfDay.toISOString())
            .lte('match_time', endOfDay.toISOString())
            .range(0, 4999) // Bypass default 1000 row limit
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

        // Date filter is now handled server-side for 'ALL'/'SCHEDULED'/'FINISHED'
        // But for 'LIVE', we might want to show ALL live matches regardless of date?
        // Usually live matches are "Today", but late night ones might be "Yesterday".
        // For now, let's stick to the selected date's view.

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

    const changeDate = (days) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + days);
        setSelectedDate(newDate);
        // fetchFixtures is triggered by useEffect dependency
    };

    return (
        <div className="bulletin-container">
            {/* Header / Date Navigation */}
            <div className="bulletin-header">
                <div className="date-nav">
                    <button onClick={() => changeDate(-1)} className="nav-btn">◀</button>
                    <div className="current-date">
                        <span className="day">{selectedDate.toLocaleDateString('tr-TR', { weekday: 'long' })}</span>
                        <span className="full-date">{selectedDate.toLocaleDateString('tr-TR')}</span>
                    </div>
                    <button onClick={() => changeDate(1)} className="nav-btn">▶</button>
                </div>

                <div className="tabs">
                    {['ALL', 'LIVE', 'FINISHED', 'SCHEDULED'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                        >
                            {tab === 'ALL' && 'TÜMÜ'}
                            {tab === 'LIVE' && 'CANLI'}
                            {tab === 'FINISHED' && 'BİTMİŞ'}
                            {tab === 'SCHEDULED' && 'PROGRAM'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Matches List */}
            <div className="matches-list">
                {/* DEBUG INFO */}
                <div style={{ padding: '1rem', background: '#334155', marginBottom: '1rem', fontSize: '0.8rem', color: '#cbd5e1' }}>
                    <p>Total Fixtures: {fixtures.length}</p>
                    <p>Selected Date: {selectedDate.toLocaleDateString('en-CA')}</p>
                    <p>Active Tab: {activeTab}</p>
                    <p>Sample Match Time (Raw): {fixtures[0]?.match_time}</p>
                    <p>Sample Match Date (Local): {fixtures[0] ? new Date(fixtures[0].match_time).toLocaleDateString('en-CA') : 'N/A'}</p>
                </div>

                {loading ? (
                    <div className="loading">Yükleniyor...</div>
                ) : filterFixtures().length === 0 ? (
                    <div className="empty-state">Maç bulunamadı.</div>
                ) : (
                    sortedLeagues.map(([leagueName, matches]) => (
                        <div key={leagueName} className="league-group">
                            <div className="league-header">
                                <span className="star-icon">☆</span>
                                <span className="league-name">{leagueName}</span>
                                <img src={matches[0].league_logo} alt="" className="league-logo" onError={(e) => e.target.style.display = 'none'} />
                            </div>
                            {matches.map((match) => {
                                const isFav = favorites.includes(match.id);
                                return (
                                    <div key={match.id} className={`match-row ${isFav ? 'favorite-row' : ''}`}>
                                        <div className="match-status-col">
                                            <span
                                                className={`star-icon-row ${isFav ? 'active' : ''}`}
                                                onClick={() => toggleFavorite(match.id)}
                                            >
                                                {isFav ? '★' : '☆'}
                                            </span>
                                            {match.status === 'LIVE' ? (
                                                <span className="live-minute">{match.minute}'</span>
                                            ) : match.status === 'FINISHED' ? (
                                                <span className="status-finished">MS</span>
                                            ) : (
                                                <span className="match-time">
                                                    {new Date(match.match_time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            )}
                                        </div>

                                        <div className="match-teams-col">
                                            <div className={`team home ${match.score && match.score !== '-' && parseInt(match.score.split('-')[0]) > parseInt(match.score.split('-')[1]) ? 'winner' : ''}`}>
                                                {match.home_team_logo && <img src={match.home_team_logo} alt="" className="team-logo" />}
                                                <span className="team-name">{match.home_team}</span>
                                            </div>
                                            <div className={`team away ${match.score && match.score !== '-' && parseInt(match.score.split('-')[1]) > parseInt(match.score.split('-')[0]) ? 'winner' : ''}`}>
                                                {match.away_team_logo && <img src={match.away_team_logo} alt="" className="team-logo" />}
                                                <span className="team-name">{match.away_team}</span>
                                            </div>
                                        </div>

                                        <div className="match-score-col">
                                            {match.status === 'NOT_STARTED' ? (
                                                <span className="vs">-</span>
                                            ) : (
                                                <div className="score-box">
                                                    <span className={`score-home ${match.status === 'LIVE' ? 'live-score' : ''}`}>{match.score.split('-')[0]}</span>
                                                    <span className="score-divider">-</span>
                                                    <span className={`score-away ${match.status === 'LIVE' ? 'live-score' : ''}`}>{match.score.split('-')[1]}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="match-actions-col">
                                            {/* Future: Add Odds Button Here */}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))
                )}
            </div>

            <style jsx>{`
                .bulletin-container {
                    background-color: #0f172a;
                    min-height: 100vh;
                    color: #e2e8f0;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                }

                .bulletin-header {
                    background-color: #1e293b;
                    padding: 1rem;
                    position: sticky;
                    top: 0;
                    z-index: 10;
                    border-bottom: 1px solid #334155;
                }

                .date-nav {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 1rem;
                }

                .nav-btn {
                    background: none;
                    border: none;
                    color: #94a3b8;
                    font-size: 1.2rem;
                    cursor: pointer;
                    padding: 0.5rem;
                }

                .nav-btn:hover {
                    color: #fff;
                }

                .current-date {
                    text-align: center;
                }

                .day {
                    display: block;
                    font-weight: 700;
                    font-size: 1.1rem;
                    color: #fff;
                }

                .full-date {
                    font-size: 0.8rem;
                    color: #94a3b8;
                }

                .tabs {
                    display: flex;
                    justify-content: center;
                    gap: 0.5rem;
                }

                .tab-btn {
                    background: transparent;
                    border: none;
                    color: #94a3b8;
                    padding: 0.5rem 1rem;
                    cursor: pointer;
                    font-weight: 600;
                    border-bottom: 2px solid transparent;
                    transition: all 0.2s;
                }

                .tab-btn.active {
                    color: #22c55e;
                    border-bottom-color: #22c55e;
                }

                .matches-list {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 1rem 0;
                }

                .league-group {
                    margin-bottom: 1rem;
                    background: #1e293b;
                    border-radius: 8px;
                    overflow: hidden;
                }

                .league-header {
                    background: #334155;
                    padding: 0.5rem 1rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: #cbd5e1;
                    text-transform: uppercase;
                }

                .league-logo {
                    width: 20px;
                    height: 20px;
                    object-fit: contain;
                    margin-left: auto;
                }

                .star-icon {
                    color: #64748b;
                    cursor: pointer;
                }
                
                .star-icon:hover {
                    color: #fbbf24;
                }

                .match-row {
                    display: flex;
                    align-items: center;
                    padding: 0.75rem 1rem;
                    border-bottom: 1px solid #334155;
                    transition: background 0.2s;
                }

                .match-row:last-child {
                    border-bottom: none;
                }

                .match-row:hover {
                    background: #283548;
                }
                
                .favorite-row {
                    background: rgba(251, 191, 36, 0.05);
                }

                .match-status-col {
                    width: 70px;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.8rem;
                    color: #94a3b8;
                }

                .star-icon-row {
                    color: #475569;
                    cursor: pointer;
                    font-size: 1.2rem;
                    line-height: 1;
                }
                
                .star-icon-row:hover, .star-icon-row.active {
                    color: #fbbf24;
                }

                .live-minute {
                    color: #ef4444;
                    font-weight: 700;
                    animation: pulse 2s infinite;
                }

                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.6; }
                    100% { opacity: 1; }
                }

                .match-teams-col {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                    padding: 0 1rem;
                }

                .team {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.95rem;
                    color: #e2e8f0;
                }
                
                .team.winner {
                    font-weight: 700;
                    color: #fff;
                }

                .team-logo {
                    width: 16px;
                    height: 16px;
                    object-fit: contain;
                }

                .match-score-col {
                    width: 50px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-weight: 700;
                    color: #22c55e;
                }

                .score-box {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    gap: 0.25rem;
                    font-size: 0.95rem;
                }
                
                .live-score {
                    color: #ef4444;
                }

                .loading, .empty-state {
                    text-align: center;
                    padding: 2rem;
                    color: #94a3b8;
                }
            `}</style>
        </div>
    );
}
