"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function ActivePredictionsTabs() {
  const [activeTab, setActiveTab] = useState('football');

  const predictions = {
    football: [
      { id: 1, match: "Galatasaray - Fenerbahçe", time: "20:00", pick: "MS 1", odds: 2.10, user: "orancerrahi" },
      { id: 2, match: "Real Madrid - Barcelona", time: "22:00", pick: "KG Var", odds: 1.70, user: "bahisdoktoru" },
      { id: 3, match: "Man City - Liverpool", time: "18:30", pick: "Üst 2.5", odds: 1.85, user: "analizuzmani" },
    ],
    basketball: [
      { id: 4, match: "Lakers - Warriors", time: "03:30", pick: "Üst 220.5", odds: 1.85, user: "orancerrahi" },
      { id: 5, match: "Celtics - Heat", time: "02:00", pick: "MS 1", odds: 1.95, user: "bahisdoktoru" },
      { id: 6, match: "Efes - Fenerbahçe", time: "20:30", pick: "Alt 165.5", odds: 1.90, user: "bankocu" },
    ]
  };

  return (
    <div className="predictions-tabs">
      <h2 className="section-title">Bugünün Aktif Tahminleri</h2>

      <div className="tabs-header">
        <button
          className={`tab-btn ${activeTab === 'football' ? 'active' : ''}`}
          onClick={() => setActiveTab('football')}
        >
          ⚽ Futbol
        </button>
        <button
          className={`tab-btn ${activeTab === 'basketball' ? 'active' : ''}`}
          onClick={() => setActiveTab('basketball')}
        >
          🏀 Basketbol
        </button>
      </div>

      <div className="slider-container">
        <div className="slider-track">
          {/* Double the array to create seamless loop */}
          {[...predictions[activeTab], ...predictions[activeTab], ...predictions[activeTab]].map((pred, index) => (
            <Link key={`${pred.id}-${index}`} href={`/prediction/${pred.id}`} className="prediction-link">
              <div className="prediction-card card">
                <div className="match-time">{pred.time}</div>
                <div className="match-name">{pred.match}</div>
                <div className="prediction-details">
                  <span className="pick-badge">{pred.pick}</span>
                  <span className="odds-value">@{pred.odds.toFixed(2)}</span>
                </div>
                <div className="predictor">
                  <span className="user-icon">👤</span>
                  <span className="username">{pred.user}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <style jsx>{`
        .predictions-tabs {
          padding: 3rem 0;
          max-width: 1200px;
          margin: 0 auto;
          overflow: hidden;
          position: relative;
        }

        .slider-container {
          width: 100%;
          overflow: hidden;
          position: relative;
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }
        .section-title {
          text-align: center;
          font-size: 2rem;
          margin-bottom: 2rem;
          padding: 0 1rem;
          width: 100%;
        }

        .tabs-header {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          margin-bottom: 3rem;
          width: 100%;
        }

        .tab-btn {
          background: var(--surface);
          border: 2px solid var(--border);
          color: var(--foreground);
          padding: 0.75rem 2rem;
          border-radius: 2rem;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .tab-btn:hover {
          border-color: var(--primary);
        }

        .tab-btn.active {
          background: var(--primary);
          color: #000;
          border-color: var(--primary);
        }

        .slider-container {
          width: 100%;
          overflow: hidden;
          position: relative;
        }

        .slider-container::before,
        .slider-container::after {
          content: none;
        }

        .slider-track {
          display: flex;
          gap: 1.5rem;
          width: max-content;
          animation: scroll 30s linear infinite;
          padding: 1rem 0;
        }

        .slider-track:hover {
          animation-play-state: paused;
        }

        .prediction-link {
          text-decoration: none;
          display: block;
          flex-shrink: 0;
        }

        .prediction-card {
          padding: 1.5rem;
          transition: transform 0.2s;
          width: 300px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 1rem;
        }

        .prediction-card:hover {
          transform: translateY(-5px);
          border-color: var(--primary);
          box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }

        .match-time {
          font-size: 0.85rem;
          color: var(--primary);
          margin-bottom: 0.5rem;
          font-weight: 600;
        }

        .match-name {
          font-weight: 700;
          font-size: 1.1rem;
          margin-bottom: 1rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .prediction-details {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border);
        }

        .pick-badge {
          background: var(--surface-hover);
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-weight: 600;
        }

        .odds-value {
          color: var(--accent);
          font-weight: 700;
          font-size: 1.2rem;
        }

        .predictor {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #888;
          font-size: 0.9rem;
        }

        .username {
          font-weight: 500;
        }

        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
      `}</style>
    </div>
  );
}
