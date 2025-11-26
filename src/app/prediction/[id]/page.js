"use client";

import { use } from 'react';
import Link from 'next/link';

export default function PredictionDetailPage({ params }) {
    const { id } = use(params);

    // Mock data - gerçekte API'den çekilecek
    const prediction = {
        id: parseInt(id),
        match: "Galatasaray - Fenerbahçe",
        league: "Süper Lig",
        pick: "MS 1",
        odds: 2.10,
        confidence: 9,
        analysis: "Galatasaray evinde çok güçlü bir performans sergiliyor. Son 5 maçta sadece 1 gol yedi. Fenerbahçe'nin savunma hattında sakatlık problemleri var. Icardi ve Zaha'nın formdaki gidişatı ev sahibine büyük avantaj sağlıyor. İstatistiksel olarak Galatasaray'ın kazanma olasılığı %65 civarında.",
        user: "orancerrahi",
        userRank: 1,
        date: "2025-11-25T19:00:00",
        status: "pending", // pending, won, lost
        likes: 124,
        comments: [
            { id: 1, user: "bahisdoktoru", text: "Harika analiz! Katılıyorum.", time: "1 saat önce" },
            { id: 2, user: "analizuzmani", text: "Fenerbahçe'nin sakatlık durumu gerçekten kritik.", time: "30 dk önce" }
        ]
    };

    return (
        <div className="prediction-detail">
            <div className="detail-header">
                <Link href="/" className="back-btn">← Ana Sayfa</Link>
                <span className={`status-badge ${prediction.status}`}>
                    {prediction.status === 'pending' && 'Bekliyor'}
                    {prediction.status === 'won' && 'Kazandı'}
                    {prediction.status === 'lost' && 'Kaybetti'}
                </span>
            </div>

            <div className="match-card card">
                <div className="match-header">
                    <h1>{prediction.match}</h1>
                    <span className="league-badge">{prediction.league}</span>
                </div>

                <div className="prediction-info">
                    <div className="info-item">
                        <span className="label">Tahmin</span>
                        <span className="value pick">{prediction.pick}</span>
                    </div>
                    <div className="info-item">
                        <span className="label">Oran</span>
                        <span className="value odds">@{prediction.odds.toFixed(2)}</span>
                    </div>
                    <div className="info-item">
                        <span className="label">Güven</span>
                        <span className="value confidence">{prediction.confidence}/10</span>
                    </div>
                </div>

                <div className="confidence-bar">
                    <div className="progress-bg">
                        <div
                            className="progress-fill"
                            style={{ width: `${prediction.confidence * 10}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            <div className="analysis-card card">
                <h2>Analiz</h2>
                <p className="analysis-text">{prediction.analysis}</p>
            </div>

            <div className="author-card card">
                <div className="author-info">
                    <Link href={`/profile/${prediction.user}`}>
                        <div className="avatar">{prediction.user[0].toUpperCase()}</div>
                    </Link>
                    <div className="author-details">
                        <Link href={`/profile/${prediction.user}`} className="username-link">
                            <span className="username">{prediction.user}</span>
                        </Link>
                        <span className="rank">#{prediction.userRank} Cerrah</span>
                    </div>
                </div>
                <button className="btn btn-primary">Takip Et</button>
            </div>

            <div className="interactions-card card">
                <div className="interactions">
                    <button className="interaction-btn">
                        ❤️ {prediction.likes} Beğeni
                    </button>
                    <span className="interaction-btn">
                        💬 {prediction.comments.length} Yorum
                    </span>
                </div>
            </div>

            <div className="comments-card card">
                <h2>Yorumlar ({prediction.comments.length})</h2>
                <div className="comments-list">
                    {prediction.comments.map((comment) => (
                        <div key={comment.id} className="comment">
                            <div className="comment-header">
                                <span className="comment-user">{comment.user}</span>
                                <span className="comment-time">{comment.time}</span>
                            </div>
                            <p className="comment-text">{comment.text}</p>
                        </div>
                    ))}
                </div>

                <div className="comment-form">
                    <textarea
                        placeholder="Yorumunuzu yazın..."
                        rows="3"
                    />
                    <button className="btn btn-primary">Yorum Yap</button>
                </div>
            </div>

            <style jsx>{`
        .prediction-detail {
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .detail-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .back-btn {
          color: var(--primary);
          font-weight: 500;
          transition: opacity 0.2s;
        }

        .back-btn:hover {
          opacity: 0.8;
        }

        .status-badge {
          padding: 0.5rem 1rem;
          border-radius: 2rem;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .status-badge.pending {
          background: rgba(245, 158, 11, 0.1);
          color: var(--accent);
          border: 1px solid rgba(245, 158, 11, 0.2);
        }

        .status-badge.won {
          background: rgba(34, 197, 94, 0.1);
          color: var(--primary);
          border: 1px solid rgba(34, 197, 94, 0.2);
        }

        .status-badge.lost {
          background: rgba(239, 68, 68, 0.1);
          color: var(--danger);
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .match-card {
          padding: 2rem;
        }

        .match-header {
          margin-bottom: 1.5rem;
        }

        .match-header h1 {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .league-badge {
          background: var(--surface-hover);
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-size: 0.9rem;
          color: #888;
        }

        .prediction-info {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .info-item {
          text-align: center;
        }

        .info-item .label {
          display: block;
          color: #888;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }

        .info-item .value {
          display: block;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .value.pick {
          color: var(--foreground);
        }

        .value.odds {
          color: var(--accent);
        }

        .value.confidence {
          color: var(--primary);
        }

        .confidence-bar {
          margin-top: 1rem;
        }

        .progress-bg {
          height: 8px;
          background: var(--surface-hover);
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: var(--primary);
          transition: width 0.3s;
        }

        .analysis-card {
          padding: 2rem;
        }

        .analysis-card h2 {
          margin-bottom: 1rem;
          font-size: 1.25rem;
        }

        .analysis-text {
          color: #d4d4d4;
          line-height: 1.7;
          font-size: 1.05rem;
        }

        .author-card {
          padding: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .author-info {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: var(--primary);
          color: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.5rem;
          cursor: pointer;
        }

        .author-details {
          display: flex;
          flex-direction: column;
        }

        .username-link:hover .username {
          color: var(--primary);
        }

        .username {
          font-weight: 600;
          font-size: 1.1rem;
        }

        .rank {
          color: #888;
          font-size: 0.9rem;
        }

        .interactions-card {
          padding: 1.5rem;
        }

        .interactions {
          display: flex;
          gap: 2rem;
        }

        .interaction-btn {
          background: transparent;
          border: none;
          color: #a3a3a3;
          cursor: pointer;
          font-size: 1rem;
          transition: color 0.2s;
        }

        .interaction-btn:hover {
          color: var(--foreground);
        }

        .comments-card {
          padding: 2rem;
        }

        .comments-card h2 {
          margin-bottom: 1.5rem;
          font-size: 1.25rem;
        }

        .comments-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .comment {
          background: var(--background);
          padding: 1rem;
          border-radius: 0.5rem;
        }

        .comment-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .comment-user {
          font-weight: 600;
        }

        .comment-time {
          color: #888;
          font-size: 0.85rem;
        }

        .comment-text {
          color: #d4d4d4;
          line-height: 1.5;
        }

        .comment-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .comment-form textarea {
          background: var(--background);
          border: 1px solid var(--border);
          padding: 0.75rem;
          border-radius: 0.5rem;
          color: var(--foreground);
          font-family: inherit;
          resize: vertical;
        }

        .comment-form textarea:focus {
          outline: none;
          border-color: var(--primary);
        }

        @media (max-width: 768px) {
          .prediction-info {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .author-card {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }
        }
      `}</style>
        </div>
    );
}
