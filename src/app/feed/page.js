"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/LayoutShell';

export default function FeedPage() {
  const { user } = useAuth();
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  // Mock data - Coupons
  const posts = [
    {
      id: 1,
      user: "cerrah_pasa",
      rank: 1,
      items: [
        { match: "Galatasaray - Fenerbahçe", pick: "MS 1", odds: 2.10 },
        { match: "Beşiktaş - Trabzonspor", pick: "KG Var", odds: 1.75 },
        { match: "Adana Demir - Samsunspor", pick: "Üst 2.5", odds: 1.60 }
      ],
      totalOdds: 5.88,
      confidence: 9,
      analysis: "Derbide ev sahibi avantajı ağır basıyor. Beşiktaş maçında iki takım da gol bulur. Adana'da gol yağmuru bekliyorum. Banko kuponumdur.",
      likes: 124,
      comments: 45,
      time: "2 saat önce",
      status: "PENDING" // BEKLİYOR
    },
    {
      id: 2,
      user: "analiz_krali",
      rank: 2,
      items: [
        { match: "Lakers - Warriors", pick: "Üst 220.5", odds: 1.85 },
        { match: "Celtics - Heat", pick: "MS 1 (-5.5)", odds: 1.90 }
      ],
      totalOdds: 3.51,
      confidence: 8,
      analysis: "NBA gecesi için yüksek güvenli ikili. Lakers maçında tempo, Celtics maçında fark bekliyorum.",
      likes: 89,
      comments: 12,
      time: "4 saat önce",
      status: "WON" // KAZANDI
    },
    {
      id: 3,
      user: "risk_sever",
      rank: 5,
      items: [
        { match: "Man City - Liverpool", pick: "MS X", odds: 3.50 },
        { match: "Arsenal - Chelsea", pick: "MS 2", odds: 4.20 },
        { match: "Real Madrid - Barcelona", pick: "KG Yok", odds: 2.10 },
        { match: "Bayern - Dortmund", pick: "Üst 3.5", odds: 2.05 }
      ],
      totalOdds: 63.28,
      confidence: 4,
      analysis: "Sürpriz arayanlar için sistem kuponu. İngiltere'de beraberlik ve sürpriz galibiyet, El Clasico'da kısır maç bekliyorum.",
      likes: 32,
      comments: 5,
      time: "5 saat önce",
      status: "LOST" // KAYBETTİ
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
          const potentialReturn = post.totalOdds * 10;

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
                    <div className="status-container">
                      {post.status === 'WON' && (
                        <>
                          <span className="points-won">+{potentialReturn.toFixed(2)} Puan</span>
                          <span className="status-badge won">KAZANDI</span>
                        </>
                      )}
                      {post.status === 'LOST' && <span className="status-badge lost">KAYBETTİ</span>}
                      {post.status === 'PENDING' && <span className="status-badge pending">BEKLİYOR</span>}
                    </div>
                  </div>
                </div>

                {/* Analysis Container */}
                <div className="analysis-container">
                  <p className="analysis-text">{post.analysis}</p>
                </div>

                <div className="prediction-details">
                  <div className="coupon-items-list">
                    {post.items.map((item, idx) => (
                      <div key={idx} className="coupon-list-item">
                        <span className="match-name">{item.match}</span>
                        <div className="pick-info">
                          <span className="badge pick">{item.pick}</span>
                          <span className="badge odds">{item.odds.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="coupon-summary-row">
                    <span className="total-odds-label">Toplam Oran:</span>
                    <span className="total-odds-value">{post.totalOdds.toFixed(2)}</span>
                  </div>
                </div>

                {/* Confidence Container */}
                <div className="confidence-container">
                  <div className="confidence-header">
                    <span className="confidence-label">Güven Seviyesi</span>
                    <span className="confidence-value">{post.confidence}/10</span>
                  </div>
                  <div className="progress-bg">
                    <div
                      className="progress-fill"
                      style={{ width: `${post.confidence * 10}%` }}
                    ></div>
                  </div>
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

        .status-container {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .points-won {
          color: var(--primary);
          font-weight: 700;
          font-size: 0.9rem;
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

        /* Analysis Container */
        .analysis-container {
          background: rgba(255, 255, 255, 0.03);
          border-left: 3px solid var(--primary);
          padding: 1rem;
          border-radius: 0 0.5rem 0.5rem 0;
          margin-bottom: 1.5rem;
        }

        .analysis-text {
          color: #e2e8f0;
          line-height: 1.6;
          font-size: 0.95rem;
          font-style: italic;
        }

        .prediction-details {
          background: var(--background);
          padding: 1rem;
          border-radius: 0.75rem;
          margin-bottom: 1rem;
          border: 1px solid rgba(255,255,255,0.05);
        }

        .coupon-items-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .coupon-list-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .coupon-list-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .match-name {
          font-size: 0.95rem;
          font-weight: 500;
        }

        .pick-info {
          display: flex;
          gap: 0.5rem;
        }

        .badge {
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .badge.pick { background: var(--surface-hover); color: var(--foreground); }
        .badge.odds { background: rgba(245, 158, 11, 0.1); color: var(--accent); }

        .coupon-summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 0.5rem;
          padding-top: 0.75rem;
          border-top: 1px solid rgba(255,255,255,0.1);
        }

        .total-odds-label {
          color: #94a3b8;
          font-size: 0.9rem;
        }

        .total-odds-value {
          color: var(--accent);
          font-weight: 700;
          font-size: 1.1rem;
        }

        /* Confidence Container */
        .confidence-container {
          background: rgba(255, 255, 255, 0.03);
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .confidence-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .confidence-label {
          font-size: 0.85rem;
          color: #94a3b8;
          font-weight: 500;
        }

        .confidence-value {
          font-size: 0.9rem;
          color: var(--primary);
          font-weight: 700;
        }

        .progress-bg {
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: var(--primary);
          border-radius: 4px;
          transition: width 0.5s ease-out;
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
