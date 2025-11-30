"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function BulletinPage() {
    const [fixtures, setFixtures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('ALL'); // ALL, LIVE, FINISHED, SCHEDULED
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [favorites, setFavorites] = useState([]);

    const [sortOption, setSortOption] = useState('LEAGUE'); // 'LEAGUE' or 'TIME'

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
            .select('*, country, country_flag')
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
        } else if (activeTab === 'FAVORITES') {
            filtered = filtered.filter(f => favorites.includes(f.id));
        }

        return filtered;
    };

    const getSortedGroups = () => {
        const filtered = filterFixtures();

        if ((activeTab === 'LIVE' || activeTab === 'ALL') && sortOption === 'TIME') {
            if (sortOption === 'TIME') {
                const favs = filtered.filter(f => favorites.includes(f.id));
                const others = filtered.filter(f => !favorites.includes(f.id));

                const sortFn = (a, b) => {
                    if (activeTab === 'LIVE') {
                        // Sort by Minute Descending
                        const minA = parseInt(a.minute) || 0;
                        const minB = parseInt(b.minute) || 0;
                        return minB - minA;
                    } else {
                        // Sort by Match Time Ascending
                        return new Date(a.match_time) - new Date(b.match_time);
                    }
                };

                favs.sort(sortFn);
                others.sort(sortFn);

                const sortedMatches = [...favs, ...others];

                if (sortedMatches.length === 0) return [];

                return [{
                    id: 'sorted-by-time',
                    country: activeTab === 'LIVE' ? 'Canlı' : 'Tümü',
                    flag: null,
                    league: 'Saate Göre Sıralı',
                    logo: null,
                    matches: sortedMatches
                }];
            }

            // Default: Group by League
            const grouped = filtered.reduce((acc, fixture) => {
                // Group by Country + League to avoid ambiguity (e.g. 'Cup' in multiple countries)
                const country = fixture.country || 'Dünya';
                const league = fixture.league || 'Diğer';
                const groupKey = `${country}-${league}`;

                if (!acc[groupKey]) {
                    acc[groupKey] = {
                        id: groupKey,
                        country: fixture.country,
                        flag: fixture.country_flag,
                        league: fixture.league,
                        logo: fixture.league_logo,
                        matches: []
                    };
                }
                acc[groupKey].matches.push(fixture);
                return acc;
            }, {});

            // Sort leagues: Favorites first, then Priority Leagues (optional), then A-Z
            return Object.values(grouped).sort((a, b) => {
                const aHasFav = a.matches.some(m => favorites.includes(m.id));
                const bHasFav = b.matches.some(m => favorites.includes(m.id));
                if (aHasFav && !bHasFav) return -1;
                if (!aHasFav && bHasFav) return 1;

                // Secondary sort: Country Name
                if (a.country < b.country) return -1;
                if (a.country > b.country) return 1;

                return 0;
            });
        };

        const sortedGroups = getSortedGroups();

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
                    <div className="header-top">
                        <div className="date-nav">
                            <button onClick={() => changeDate(-1)} className="nav-btn">◀</button>
                            <div className="current-date">
                                <span className="day">{selectedDate.toLocaleDateString('tr-TR', { weekday: 'long' })}</span>
                                <span className="full-date">{selectedDate.toLocaleDateString('tr-TR')}</span>
                            </div>
                            <button onClick={() => changeDate(1)} className="nav-btn">▶</button>
                        </div>

                        {(activeTab === 'LIVE' || activeTab === 'ALL') && (
                            <div className="sort-controls">
                                <button
                                    className={`sort-btn ${sortOption === 'LEAGUE' ? 'active' : ''}`}
                                    onClick={() => setSortOption('LEAGUE')}
                                >
                                    Lige Göre
                                </button>
                                <button
                                    className={`sort-btn ${sortOption === 'TIME' ? 'active' : ''}`}
                                    onClick={() => setSortOption('TIME')}
                                >
                                    Saate Göre
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="tabs">
                        {['ALL', 'LIVE', 'FINISHED', 'FAVORITES'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                            >
                                {tab === 'ALL' && 'TÜMÜ'}
                                {tab === 'LIVE' && 'CANLI'}
                                {tab === 'FINISHED' && 'BİTENLER'}
                                {tab === 'FAVORITES' && 'FAVORİLER'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Match List */}
                <div className="matches-list">
                    {loading ? (
                        <div className="loading">Yükleniyor...</div>
                    ) : sortedGroups.length === 0 ? (
                        <div className="empty-state">Maç bulunamadı.</div>
                    ) : (
                        sortedGroups.map((group) => (
                            <div key={group.id} className="league-group">
                                <div className="league-header">
                                    <div className="league-info">
                                        {group.flag && <img src={group.flag} alt={group.country} className="country-flag" />}
                                        <span className="country-name">{group.country && group.country !== 'Dünya' ? group.country.toUpperCase() + ' - ' : ''}</span>
                                        <span className="league-name">{group.league}</span>
                                    </div>
                                </div>
                                {group.matches.map((match) => (
                                    <div key={match.id} className={`match-row ${favorites.includes(match.id) ? 'favorite-row' : ''}`}>
                                        <div className="match-status">
                                            {match.status === 'LIVE' ? (
                                                <span className="live-minute">{match.minute}'</span>
                                            ) : match.status === 'FINISHED' ? (
                                                <span className="finished">MS</span>
                                            ) : (
                                                <span className="time">
                                                    {new Date(match.match_time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            )}
                                        </div>
                                        <div className="match-teams">
                                            <div className="team home">
                                                <span className={`team-name ${match.score && match.score !== '-' && parseInt(match.score.split('-')[0]) > parseInt(match.score.split('-')[1]) ? 'winner' : ''}`}>
                                                    {match.home_team}
                                                </span>
                                                {match.home_team_logo && <img src={match.home_team_logo} alt="" className="team-logo" />}
                                            </div>
                                            <div className="match-score">
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
                                            <div className="team away">
                                                {match.away_team_logo && <img src={match.away_team_logo} alt="" className="team-logo" />}
                                                <span className={`team-name ${match.score && match.score !== '-' && parseInt(match.score.split('-')[1]) > parseInt(match.score.split('-')[0]) ? 'winner' : ''}`}>
                                                    {match.away_team}
                                                </span>
                                            </div>
                                            <div className="match-actions-col">
                                                {/* Future: Add Odds Button Here */}
                                            </div>
                                        </div>
                                        <button
                                            className={`favorite-btn ${favorites.includes(match.id) ? 'active' : ''}`}
                                            onClick={() => toggleFavorite(match.id)}
                                        >
                                            ★
                                        </button>
                                    </div>
                                ))}
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

                .header-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                    position: relative;
                }

                .date-nav {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 1rem;
                    flex: 1;
                }

                .sort-controls {
                    position: absolute;
                    right: 0;
                    display: flex;
                    gap: 0.5rem;
                }

                .sort-btn {
                    background: #334155;
                    border: none;
                    color: #94a3b8;
                    padding: 0.25rem 0.75rem;
                    border-radius: 4px;
                    font-size: 0.8rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .sort-btn:hover {
                    background: #475569;
                    color: #fff;
                }

                .sort-btn.active {
                    background: #22c55e;
                    color: #fff;
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

                .league-info {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .country-flag {
                    width: 20px;
                    height: 15px;
                    object-fit: cover;
                    border-radius: 2px;
                    margin-right: 0.5rem;
                }

                .country-name {
                    color: #94a3b8;
                    font-weight: 600;
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
                    position: relative;
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

                .match-status {
                    width: 60px;
                    display: flex;
                    justify-content: center;
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

                .match-teams {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 1rem;
                }

                .team {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.95rem;
                    color: #e2e8f0;
                }

                .team.home {
                    justify-content: flex-end;
                    text-align: right;
                }

                .team.away {
                    justify-content: flex-start;
                    text-align: left;
                }
                
                .team.winner {
                    font-weight: 700;
                    color: #fff;
                }

                .team-logo {
                    width: 20px;
                    height: 20px;
                    object-fit: contain;
                }

                .match-score {
                    width: 60px;
                    display: flex;
                    justify-content: center;
                    font-weight: 700;
                    color: #22c55e;
                }

                .score-box {
                    display: flex;
                    gap: 0.25rem;
                }
                
                .live-score {
                    color: #ef4444;
                }

                .favorite-btn {
                    background: none;
                    border: none;
                    color: #475569;
                    font-size: 1.2rem;
                    cursor: pointer;
                    padding: 0.2rem;
                    margin-left: 0.5rem;
                }

                .favorite-btn:hover, .favorite-btn.active {
                    color: #fbbf24;
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
