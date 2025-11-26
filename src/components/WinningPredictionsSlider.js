"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function WinningPredictionsSlider() {
    // Mock Data for Winning Predictions (Sorted by Time)
    const winningPredictions = [
        {
            id: 1,
            user: "orancerrahi",
            match: "Galatasaray - Fenerbahçe",
            time: "20:00",
            date: "26 Kas",
            pick: "MS 1",
            odds: 2.10,
            league: "Süper Lig"
        },
        {
            id: 2,
            user: "bahisdoktoru",
            match: "Real Madrid - Barcelona",
            time: "22:00",
            date: "26 Kas",
            pick: "KG Var",
            odds: 1.70,
            league: "La Liga"
        },
        {
            id: 3,
            user: "analizuzmani",
            match: "Man City - Liverpool",
            time: "18:30",
            date: "26 Kas",
            pick: "Üst 2.5",
            odds: 1.85,
            league: "Premier League"
        },
        {
            id: 4,
            user: "bankocu",
            match: "Lakers - Warriors",
            time: "03:30",
            date: "27 Kas",
            pick: "Üst 220.5",
            odds: 1.85,
            league: "NBA"
        },
        {
            id: 5,
            user: "kazandiran",
            match: "Bayern - Dortmund",
            time: "19:30",
            date: "26 Kas",
            pick: "MS 1",
            odds: 1.55,
            league: "Bundesliga"
        }
    ];

    // Duplicate data for seamless infinite scroll
    const sliderData = [...winningPredictions, ...winningPredictions];

    return (
        <section className="winning-predictions">
            <div className="section-header">
                <h2 className="section-title">Kazanan Son Tahminler 🏆</h2>
                <p className="section-subtitle">Cerrahların nokta atışı analizleri.</p>
            </div>

            <div className="slider-container">
                <div className="predictions-track">
                    {sliderData.map((pred, index) => (
                        <Link href={`/prediction/${pred.id}`} key={`${pred.id}-${index}`} className="card-link">
                            <div className="prediction-card won">
                                <div className="card-header">
                                    <span className="league">{pred.league}</span>
                                    <div className="datetime">
                                        <span className="date">{pred.date}</span>
                                        <span className="time">{pred.time}</span>
                                    </div>
                                </div>
                                <h3 className="match-name">{pred.match}</h3>
                                <div className="pick-info">
                                    <span className="pick-label">{pred.pick}</span>
                                    <span className="odds">@{pred.odds.toFixed(2)}</span>
                                </div>
                                <div className="user-info">
                                    <span className="user-icon">👤</span>
                                    <span className="username">{pred.user}</span>
                                </div>
                                <div className="status-badge">KAZANDI</div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            <style jsx>{`
                .winning-predictions {
                    padding: 2rem 1rem;
                    max-width: 1200px;
                    margin: 0 auto;
                    overflow: hidden;
                }

                .section-header {
                    text-align: center;
                    margin-bottom: 2rem;
                }

                .section-title {
                    font-size: 2rem;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                    color: #fff;
                }

                .section-subtitle {
                    color: #a3a3a3;
                }

                .slider-container {
                    width: 100%;
                    overflow: hidden;
                    position: relative;
                }
                
                .slider-container::before,
                .slider-container::after {
                    content: "";
                    position: absolute;
                    top: 0;
                    width: 100px;
                    height: 100%;
                    z-index: 2;
                    pointer-events: none;
                }

                .slider-container::before {
                    left: 0;
                    background: linear-gradient(to right, #0f172a, transparent);
                }

                .slider-container::after {
                    right: 0;
                    background: linear-gradient(to left, #0f172a, transparent);
                }

                .predictions-track {
                    display: flex;
                    gap: 1.5rem;
                    width: max-content;
                    animation: scroll 40s linear infinite;
                    padding: 1rem 0; /* Space for shadow */
                }
                
                .predictions-track:hover {
                    animation-play-state: paused;
                }

                @keyframes scroll {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-50%);
                    }
                }

                .card-link {
                    text-decoration: none;
                    display: block;
                }

                .prediction-card {
                    background: #1e293b;
                    border: 1px solid rgba(34, 197, 94, 0.3);
                    border-radius: 1rem;
                    padding: 1.5rem;
                    position: relative;
                    overflow: hidden;
                    transition: transform 0.2s, box-shadow 0.2s;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    width: 300px; /* Fixed width */
                    flex-shrink: 0;
                    cursor: pointer;
                }

                .prediction-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 15px -3px rgba(34, 197, 94, 0.2);
                    border-color: rgba(34, 197, 94, 0.6);
                }

                .prediction-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: #22c55e;
                }

                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                    font-size: 0.85rem;
                    color: #94a3b8;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    padding-bottom: 0.75rem;
                }

                .league {
                    font-weight: 600;
                    color: #cbd5e1;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-size: 0.75rem;
                }

                .datetime {
                    display: flex;
                    gap: 0.5rem;
                    align-items: center;
                }

                .date {
                    color: #94a3b8;
                }

                .time {
                    color: #22c55e;
                    font-weight: 700;
                    background: rgba(34, 197, 94, 0.1);
                    padding: 0.1rem 0.4rem;
                    border-radius: 0.25rem;
                }

                .match-name {
                    font-size: 1.1rem;
                    font-weight: 600;
                    margin-bottom: 1rem;
                    color: #fff;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .pick-info {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: rgba(0, 0, 0, 0.2);
                    padding: 0.75rem;
                    border-radius: 0.5rem;
                    margin-bottom: 1rem;
                }

                .pick-label {
                    color: #cbd5e1;
                    font-weight: 500;
                }

                .odds {
                    color: #22c55e;
                    font-weight: 700;
                    font-size: 1.1rem;
                }

                .user-info {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.9rem;
                    color: #94a3b8;
                }

                .status-badge {
                    position: absolute;
                    bottom: 1rem;
                    right: 1rem;
                    background: rgba(34, 197, 94, 0.2);
                    color: #4ade80;
                    padding: 0.25rem 0.75rem;
                    border-radius: 1rem;
                    font-size: 0.75rem;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                }
            `}</style>
        </section>
    );
}
