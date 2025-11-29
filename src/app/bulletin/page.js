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

        // 2. Date Filter
        if (activeTab !== 'LIVE') { // Don't filter by date if looking at LIVE tab
            const selDateStr = selectedDate.toISOString().split('T')[0];
            filtered = filtered.filter(f => {
                if (!f.match_time) return false;
                const matchDateStr = new Date(f.match_time).toISOString().split('T')[0];
                return matchDateStr === selDateStr;
            });
        }

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
            </div >

        {/* Matches List */ }
        < div className = "matches-list" >
        {
            loading?(
                    <div className = "loading" > Yükleniyor...</div>
                ) : filterFixtures().length === 0 ? (
        <div className="empty-state">Maç bulunamadı.</div>
    ) : (
        Object.entries(groupedFixtures).map(([leagueName, matches]) => (
            <div key={leagueName} className="league-group">
                <div className="league-header">
                    <span className="star-icon">☆</span>
                    <span className="league-name">{leagueName}</span>
                </div>
                {matches.map((match) => (
                    <div key={match.id} className="match-row">
                        <div className="match-status-col">
                            <span className="star-icon-row">☆</span>
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
                                    <span className="score-home">{match.score.split('-')[0]}</span>
                                    <span className="score-divider">-</span>
                                    <span className="score-away">{match.score.split('-')[1]}</span>
                                </div>
                            )}
                        </div>

                        {/* Placeholder for Odds/More button */}
                        <div className="match-actions-col">
                            <button className="detail-btn">Detay</button>
                        </div>
                    </div>
                ))}
            </div>
        ))
    )
}
            </div >

    <style jsx>{`
                .bulletin-container {
                    background-color: #0f172a; /* Dark background like Flashscore */
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
                    color: #22c55e; /* Green accent */
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

                .star-icon {
                    color: #64748b;
                    cursor: pointer;
                }
                
                .star-icon:hover {
                    color: #fbbf24;
                }

                .match-row {
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
        </div >
    );
}
