"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function BulletinPage() {
    const [fixtures, setFixtures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showLiveOnly, setShowLiveOnly] = useState(false);

    useEffect(() => {
        fetchFixtures();

        // Realtime Subscription
        const channel = supabase
            .channel('public:fixtures')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'fixtures' }, (payload) => {
                console.log('Change received!', payload);
                fetchFixtures(); // Refresh data on any change
            })
            .subscribe();

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

    const filteredFixtures = showLiveOnly
        ? fixtures.filter(f => f.status === 'LIVE')
        : fixtures;

    // Group by League
    const groupedFixtures = filteredFixtures.reduce((acc, fixture) => {
        const league = fixture.league || 'Diğer';
        if (!acc[league]) acc[league] = [];
        acc[league].push(fixture);
        return acc;
    }, {});

    return (
        <div className="bulletin-page">
            <div className="page-header">
                <h1>İddaa Bülteni 📅</h1>
                <div className="filter-controls">
                    <label className="toggle-switch">
                        <input
                            type="checkbox"
                            checked={showLiveOnly}
                            onChange={() => setShowLiveOnly(!showLiveOnly)}
                        />
                        <span className="slider"></span>
                        <span className="label-text">Sadece Canlı</span>
                    </label>
                </div>
            </div>

            {loading ? (
                <div className="loading">Yükleniyor...</div>
            ) : Object.keys(groupedFixtures).length === 0 ? (
                <div className="empty-state">
                    {showLiveOnly ? 'Şu an canlı maç yok.' : 'Bültende maç bulunamadı.'}
                </div>
            ) : (
                <div className="fixtures-list">
                    {Object.entries(groupedFixtures).map(([league, matches]) => (
                        <div key={league} className="league-group">
                            <h2 className="league-title">{league}</h2>
                            <div className="matches-grid">
                                {matches.map(match => (
                                    <div key={match.id} className={`match-card ${match.status === 'LIVE' ? 'live' : ''}`}>
                                        <div className="match-header">
                                            <span className="match-time">
                                                {match.status === 'LIVE' ? (
                                                    <span className="live-indicator">CANLI</span>
                                                ) : (
                                                    new Date(match.match_time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
                                                )}
                                            </span>
                                            {match.status === 'FINISHED' && <span className="finished-indicator">MS</span>}
                                        </div>

                                        <div className="match-teams">
                                            <div className="team home">
                                                <span className="team-name">{match.home_team}</span>
                                                <span className="team-score">{match.score ? match.score.split('-')[0] : '-'}</span>
                                            </div>
                                            <div className="team away">
                                                <span className="team-name">{match.away_team}</span>
                                                <span className="team-score">{match.score ? match.score.split('-')[1] : '-'}</span>
                                            </div>
                                        </div>

                                        <div className="match-odds">
                                            <div className="odd-item">
                                                <span className="odd-label">1</span>
                                                <span className="odd-value">{match.odds?.['1'] || '-'}</span>
                                            </div>
                                            <div className="odd-item">
                                                <span className="odd-label">X</span>
                                                <span className="odd-value">{match.odds?.['X'] || '-'}</span>
                                            </div>
                                            <div className="odd-item">
                                                <span className="odd-label">2</span>
                                                <span className="odd-value">{match.odds?.['2'] || '-'}</span>
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
                    max-width: 800px;
                    margin: 0 auto;
                }
                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }
                .loading, .empty-state {
                    text-align: center;
                    padding: 3rem;
                    color: #888;
                    background: rgba(255,255,255,0.05);
                    border-radius: 1rem;
                }
                
                /* Toggle Switch */
                .toggle-switch {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                }
                .toggle-switch input { display: none; }
                .slider {
                    width: 40px;
                    height: 20px;
                    background: #334155;
                    border-radius: 20px;
                    position: relative;
                    transition: 0.3s;
                }
                .slider:before {
                    content: "";
                    position: absolute;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: white;
                    top: 2px;
                    left: 2px;
                    transition: 0.3s;
                }
                input:checked + .slider { background: var(--primary); }
                input:checked + .slider:before { transform: translateX(20px); }
                .label-text { font-weight: 500; }

                /* League Group */
                .league-group {
                    margin-bottom: 2rem;
                }
                .league-title {
                    font-size: 1.1rem;
                    color: #94a3b8;
                    margin-bottom: 1rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                }

                /* Match Card */
                .matches-grid {
                    display: grid;
                    gap: 1rem;
                }
                .match-card {
                    background: #1e293b;
                    border-radius: 0.75rem;
                    padding: 1rem;
                    border: 1px solid rgba(255,255,255,0.05);
                    transition: transform 0.2s;
                }
                .match-card:hover {
                    transform: translateY(-2px);
                    border-color: rgba(255,255,255,0.1);
                }
                .match-card.live {
                    border-color: rgba(239, 68, 68, 0.5);
                    background: rgba(239, 68, 68, 0.05);
                }

                .match-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 0.75rem;
                    font-size: 0.85rem;
                    color: #94a3b8;
                }
                .live-indicator {
                    color: #ef4444;
                    font-weight: bold;
                    animation: pulse 1.5s infinite;
                }
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.5; }
                    100% { opacity: 1; }
                }

                .match-teams {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    margin-bottom: 1rem;
                }
                .team {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .team-name { font-weight: 600; font-size: 1rem; }
                .team-score { font-weight: 700; font-size: 1.1rem; width: 30px; text-align: center; }

                .match-odds {
                    display: flex;
                    gap: 0.5rem;
                    padding-top: 0.75rem;
                    border-top: 1px solid rgba(255,255,255,0.05);
                }
                .odd-item {
                    flex: 1;
                    background: rgba(0,0,0,0.2);
                    padding: 0.4rem;
                    border-radius: 0.4rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    font-size: 0.8rem;
                }
                .odd-label { color: #64748b; margin-bottom: 0.1rem; }
                .odd-value { color: var(--primary); font-weight: bold; }
            `}</style>
        </div>
    );
}
