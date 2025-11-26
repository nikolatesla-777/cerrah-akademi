"use client";

import { use, useState } from 'react';
import Link from 'next/link';

export default function ProfilePage({ params }) {
    // Unwrap params using React.use()
    const { username } = use(params);

    const [isFollowing, setIsFollowing] = useState(false);

    // Mock data based on username
    const user = {
        username: decodeURIComponent(username),
        rank: 1,
        followers: 1250,
        following: 45,
        bio: "Spor analisti ve veri bilimci. İstatistikler yalan söylemez. 🏀⚽️",
        stats: {
            winRate: 78,
            totalProfit: 12500,
            roi: 15.4,
            totalBets: 142
        },
        history: [
            { id: 101, match: "Galatasaray - Fenerbahçe", pick: "MS 1", odds: 2.10, result: "won", date: "23 Kas" },
            { id: 102, match: "Lakers - Warriors", pick: "Üst 220.5", odds: 1.85, result: "lost", date: "22 Kas" },
            { id: 103, match: "Real Madrid - Barcelona", pick: "KG Var", odds: 1.70, result: "won", date: "21 Kas" },
            { id: 104, match: "Arsenal - Chelsea", pick: "MS 1", odds: 1.95, result: "won", date: "20 Kas" },
            { id: 105, match: "Bayern - Dortmund", pick: "Üst 3.5", odds: 2.05, result: "pending", date: "Bugün" },
        ]
    };

    const toggleFollow = () => {
        setIsFollowing(!isFollowing);
    };

    return (
        <div className="profile-container">
            {/* Profile Header */}
            <div className="profile-header card">
                <div className="profile-info">
                    <div className="avatar-lg">
                        {user.username[0].toUpperCase()}
                    </div>
                    <div className="user-meta">
                        <h1 className="username-lg">{user.username}</h1>
                        <div className="rank-badge">#{user.rank} Cerrah</div>
                        <p className="bio">{user.bio}</p>
                        <div className="social-stats">
                            <span><strong>{user.followers}</strong> Takipçi</span>
                            <span><strong>{user.following}</strong> Takip</span>
                        </div>
                    </div>
                </div>
                <div className="profile-actions">
                    <button
                        className={`btn ${isFollowing ? 'btn-outline' : 'btn-primary'} btn-lg`}
                        onClick={toggleFollow}
                    >
                        {isFollowing ? 'Takibi Bırak' : 'Takip Et'}
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="stats-overview">
                <div className="stat-box card">
                    <div className="label">Başarı</div>
                    <div className="value success">%{user.stats.winRate}</div>
                </div>
                <div className="stat-box card">
                    <div className="label">Kazanç</div>
                    <div className="value">₺{user.stats.totalProfit}</div>
                </div>
                <div className="stat-box card">
                    <div className="label">ROI</div>
                    <div className="value accent">%{user.stats.roi}</div>
                </div>
                <div className="stat-box card">
                    <div className="label">Toplam</div>
                    <div className="value">{user.stats.totalBets}</div>
                </div>
            </div>

            {/* Prediction History */}
            <div className="history-section">
                <h2 className="section-title">Ameliyat Geçmişi</h2>
                <div className="history-list">
                    {user.history.map((item) => (
                        <div key={item.id} className={`history-card card ${item.result}`}>
                            <div className="match-date">
                                <span className="date">{item.date}</span>
                                <span className={`result-badge ${item.result}`}>
                                    {item.result === 'won' && 'Kazandı'}
                                    {item.result === 'lost' && 'Kaybetti'}
                                    {item.result === 'pending' && 'Bekliyor'}
                                </span>
                            </div>
                            <div className="match-details">
                                <div className="match-name">{item.match}</div>
                                <div className="pick-info">
                                    <span className="pick">{item.pick}</span>
                                    <span className="odds">@{item.odds.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
        .profile-container {
          max-width: 800px;
          margin: 0 auto;
        }

        .profile-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1.5rem;
        }

        .profile-info {
          display: flex;
          gap: 1.5rem;
          align-items: center;
        }

        .avatar-lg {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: var(--primary);
          color: #000;
          font-size: 3rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 4px solid var(--surface);
          box-shadow: 0 0 0 2px var(--primary);
        }

        .username-lg {
          font-size: 1.75rem;
          margin-bottom: 0.25rem;
        }

        .rank-badge {
          display: inline-block;
          background: var(--surface-hover);
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.85rem;
          color: #a3a3a3;
          margin-bottom: 0.5rem;
        }

        .bio {
          color: #d4d4d4;
          margin-bottom: 0.75rem;
          max-width: 400px;
        }

        .social-stats {
          display: flex;
          gap: 1rem;
          font-size: 0.9rem;
          color: #a3a3a3;
        }

        .social-stats strong {
          color: var(--foreground);
        }

        .stats-overview {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          margin-bottom: 3rem;
        }

        .stat-box {
          text-align: center;
          padding: 1.25rem;
        }

        .stat-box .label {
          color: #888;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }

        .stat-box .value {
          font-size: 1.5rem;
          font-weight: 700;
        }

        .value.success { color: var(--primary); }
        .value.accent { color: var(--accent); }

        .section-title {
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .history-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .history-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem;
          border-left: 4px solid transparent;
        }

        .history-card.won { border-left-color: var(--primary); }
        .history-card.lost { border-left-color: var(--danger); }
        .history-card.pending { border-left-color: var(--accent); }

        .match-date {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          min-width: 100px;
        }

        .date {
          color: #888;
          font-size: 0.85rem;
        }

        .result-badge {
          font-size: 0.8rem;
          font-weight: 600;
        }

        .result-badge.won { color: var(--primary); }
        .result-badge.lost { color: var(--danger); }
        .result-badge.pending { color: var(--accent); }

        .match-details {
          flex: 1;
          text-align: right;
        }

        .match-name {
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .pick-info {
          color: #a3a3a3;
          font-size: 0.95rem;
        }

        .odds {
          color: var(--accent);
          font-weight: 600;
          margin-left: 0.5rem;
        }

        @media (max-width: 600px) {
          .profile-header {
            flex-direction: column;
            text-align: center;
          }
          
          .profile-info {
            flex-direction: column;
          }
          
          .match-details {
            text-align: left;
            margin-top: 0.5rem;
          }
          
          .history-card {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
        </div>
    );
}
