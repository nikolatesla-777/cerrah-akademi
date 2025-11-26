"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/LayoutShell';

export default function FeedPage() {
  const { user } = useAuth();
  const [showLoginPopup, setShowLoginPopup] = useState(false);

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
      time: "2 saat önce",
      status: "WON" // KAZANDI
    },
    {
      id: 2,
      user: "bahisdoktoru",
      match: "Lakers - Warriors",
      pick: "Üst 220.5",
      odds: 1.85,
      confidence: 8,
      analysis: "İki takım da tempolu oynuyor. Curry ve LeBron düellosunda sayılar havada uçuşur.",
      likes: 89,
      comments: 12,
      time: "4 saat önce",
      status: "PENDING" // BEKLİYOR
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
      time: "5 saat önce",
      status: "LOST" // KAYBETTİ
    },
    {
      id: 4,
      user: "bankocu",
      rank: 5,
      match: "Beşiktaş - Trabzonspor",
      pick: "MS 0",
      odds: 3.20,
      confidence: 6,
      analysis: "İki takım da formsuz. Beraberlik kokan bir maç.",
      likes: 32,
      comments: 5,
      time: "1 saat önce",
      status: "PENDING" // BEKLİYOR
    }
  ];

  return (
    <div className="feed-container">
      <div className="page-header">
        <h1>Akış 📱</h1>
        <p className="subtitle">Diğer cerrahların analizlerini inceleyin.</p>
      </div>

      <div className="feed-list">
        {posts.map((post) => {
          const isLocked = !user && post.status === 'PENDING';

          return (
            <div key={post.id} className={`feed-card-wrapper ${isLocked ? 'locked' : ''}`}>
              {isLocked && (
                <div className="card-overlay">
                  <div className="lock-icon">🔒</div>
                  <h3>Bu içeriği görmek için giriş yapmalısınız</h3>
                  <p>Tahminleri görmek ve yarışmaya katılmak için Telegram ile giriş yapın.</p>
                  <Link href="/login" className="login-btn">
                    Giriş Yap
                  </Link>
                </div>
              )}

              <div className={`feed-card ${isLocked ? 'blurred' : ''}`}>
                <div className="card-header">
                  <div className="user-info">
                    <Link href={user ? `/profile/${post.user}` : '#'} className={!user ? 'disabled-link' : ''}>
                      <div className="avatar">{post.user[0].toUpperCase()}</div>
                    </Link>
                    <div className="user-details">
                      <Link href={user ? `/profile/${post.user}` : '#'} className={`username-link ${!user ? 'disabled-link' : ''}`}>
                        <span className="username">{post.user}</span>
                      </Link>
                      <span className="user-rank">#{post.rank || '-'} Cerrah</span>
                    </div>
                  </div>
                  <div className="header-right">
                    <span className="time">{post.time}</span>
                    {post.status === 'WON' && <span className="status-badge won">KAZANDI</span>}
                    {post.status === 'LOST' && <span className="status-badge lost">KAYBETTİ</span>}
                    {post.status === 'PENDING' && <span className="status-badge pending">BEKLİYOR</span>}
                  </div>
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
            </div>
          );
        })}
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

        .feed-card-wrapper {
          position: relative;
          border-radius: 1rem;
          overflow: hidden;
        }

        .feed-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 1rem;
          padding: 1.5rem;
          transition: filter 0.3s;
        }

        .feed-card.blurred {
          filter: blur(8px);
          opacity: 0.6;
          pointer-events: none;
          user-select: none;
        }

        .card-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 10;
          text-align: center;
          background: rgba(15, 23, 42, 0.95);
          padding: 2rem;
          border-radius: 1rem;
          border: 1px solid rgba(255,255,255,0.1);
          width: 90%;
          max-width: 400px;
          backdrop-filter: blur(4px);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
        }

        .lock-icon { font-size: 3rem; margin-bottom: 1rem; }
        .card-overlay h3 { font-size: 1.1rem; margin-bottom: 0.5rem; color: #fff; }
        .card-overlay p { color: #94a3b8; margin-bottom: 1.5rem; font-size: 0.9rem; }
        
        .login-btn {
            background: var(--primary);
            color: #000;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-weight: 600;
            text-decoration: none;
            display: inline-block;
            transition: transform 0.2s;
        }

        .login-btn:hover {
            transform: translateY(-2px);
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

        .username-link:not(.disabled-link):hover .username {
          color: var(--primary);
          text-decoration: underline;
        }

        .disabled-link {
          pointer-events: none;
          text-decoration: none;
        }

        .username {
          font-weight: 600;
        }

        .user-rank {
          font-size: 0.8rem;
          color: #888;
        }

        .header-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.25rem;
        }

        .time {
          font-size: 0.8rem;
          color: #888;
        }

        .status-badge {
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.1rem 0.4rem;
          border-radius: 0.25rem;
          text-transform: uppercase;
        }

        .status-badge.won { background: rgba(34, 197, 94, 0.2); color: #4ade80; }
        .status-badge.lost { background: rgba(239, 68, 68, 0.2); color: #f87171; }
        .status-badge.pending { background: rgba(234, 179, 8, 0.2); color: #facc15; }

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
