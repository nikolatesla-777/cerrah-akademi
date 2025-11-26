"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function FeedPage() {
    // Mock data
    const posts = [
        {
            id: 1,
            user: "orancerrahi",
            rank: 1,
            match: "Galatasaray - Fenerbahçe",
            pick: "MS 1",
            odds: 2.10,
            confidence: 9,
            analysis: "Galatasaray evinde çok güçlü. Fenerbahçe'nin savunma eksikleri var. Icardi faktörüyle ev sahibi kazanır.",
            likes: 124,
            comments: 45,
            time: "2 saat önce"
        },
        {
            id: 2,
            user: "bahisdoktoru",
            rank: 2,
            match: "Lakers - Warriors",
            pick: "Üst 220.5",
            odds: 1.85,
            confidence: 8,
            analysis: "İki takım da tempolu oynuyor. Curry ve LeBron düellosunda sayılar havada uçuşur.",
            likes: 89,
            comments: 12,
            time: "4 saat önce"
        },
        {
            id: 3,
            user: "analizuzmani",
            rank: 3,
            match: "Man City - Liverpool",
            pick: "KG Var",
            odds: 1.65,
            confidence: 7,
            analysis: "Klopp ve Guardiola maçları her zaman gollü geçer. İki takım da skora katkı yapar.",
            likes: 56,
            comments: 8,
            time: "5 saat önce"
        }
    ];

    return (
        <div className="feed-container">
            <div className="page-header">
                <h1>Akış 📱</h1>
                <p className="subtitle">Diğer cerrahların analizlerini inceleyin.</p>
            </div>

            <div className="feed-list">
                {posts.map((post) => (
                    <div key={post.id} className="feed-card">
                        <div className="card-header">
                            <div className="user-info">
                                <Link href={`/profile/${post.user}`}>
                                    <div className="avatar">{post.user[0].toUpperCase()}</div>
                                </Link>
                                <div className="user-details">
                                    <Link href={`/profile/${post.user}`} className="username-link">
                                        <span className="username">{post.user}</span>
                                    </Link>
                                    <span className="user-rank">#{post.rank} Cerrah</span>
                                </div>
                            </div>
                            <span className="time">{post.time}</span>
                        </div>

                        <div className="prediction-details">
                            <div className="match-info">
                                <h3>{post.match}</h3>
                                <div className="badges">
                                    <span className="badge pick">{post.pick}</span>
                                    <span className="badge odds">{post.odds.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="confidence-bar">
                                <div className="confidence-label">Güven: {post.confidence}/10</div>
                                <div className="progress-bg">
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${post.confidence * 10}%` }}
                                    ></div>
                                </div>
                            </div>

                            <p className="analysis-text">{post.analysis}</p>
                        </div>

                        <div className="card-actions">
                            <button className="action-btn">
                                <span>❤️</span> {post.likes}
                            </button>
                            <button className="action-btn">
                                <span>💬</span> {post.comments}
                            </button>
                            <button className="action-btn share">
                                <span>↗️</span> Paylaş
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <style jsx>{`
        .feed-container {
          max-width: 700px;
          margin: 0 auto;
        }

        .page-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .subtitle {
          color: #a3a3a3;
          margin-top: 0.5rem;
        }

        .feed-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .feed-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 1rem;
          padding: 1.5rem;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .user-info {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--primary);
          color: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }

        .user-details {
          display: flex;
          flex-direction: column;
        }

        .username-link:hover .username {
          color: var(--primary);
          text-decoration: underline;
        }

        .username {
          font-weight: 600;
        }

        .user-rank {
          font-size: 0.8rem;
          color: #888;
        }

        .time {
          font-size: 0.8rem;
          color: #888;
        }

        .prediction-details {
          background: var(--background);
          padding: 1rem;
          border-radius: 0.75rem;
          margin-bottom: 1rem;
        }

        .match-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .match-info h3 {
          font-size: 1.1rem;
          font-weight: 600;
        }

        .badges {
          display: flex;
          gap: 0.5rem;
        }

        .badge {
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .badge.pick { background: var(--surface-hover); color: var(--foreground); }
        .badge.odds { background: rgba(245, 158, 11, 0.1); color: var(--accent); }

        .confidence-bar {
          margin-bottom: 1rem;
        }

        .confidence-label {
          font-size: 0.8rem;
          color: #888;
          margin-bottom: 0.25rem;
        }

        .progress-bg {
          height: 6px;
          background: var(--surface-hover);
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: var(--primary);
        }

        .analysis-text {
          color: #d4d4d4;
          line-height: 1.5;
          font-size: 0.95rem;
        }

        .card-actions {
          display: flex;
          gap: 1rem;
          border-top: 1px solid var(--border);
          padding-top: 1rem;
        }

        .action-btn {
          background: transparent;
          border: none;
          color: #a3a3a3;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          transition: color 0.2s;
        }

        .action-btn:hover {
          color: var(--foreground);
        }

        .share {
          margin-left: auto;
        }
      `}</style>
        </div>
    );
}
