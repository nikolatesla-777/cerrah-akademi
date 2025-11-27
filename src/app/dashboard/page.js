"use client";

import Link from 'next/link';

import { useAuth } from '@/components/LayoutShell';

export default function DashboardPage() {
  const { user } = useAuth();

  // Mock data
  const stats = {
    winRate: 78,
    totalProfit: 12500,
    activeCoupons: 3,
    rank: 42
  };

  const activePredictions = [
    { id: 1, match: "Galatasaray - Fenerbahçe", time: "20:00", pick: "MS 1", odds: 2.10, status: "pending" },
    { id: 2, match: "Lakers - Warriors", time: "03:30", pick: "Üst 220.5", odds: 1.85, status: "pending" },
    { id: 3, match: "Real Madrid - Barcelona", time: "22:00", pick: "KG Var", odds: 1.70, status: "pending" },
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="welcome-text">
          <h1>Hoşgeldin, <span className="username">{user?.first_name || user?.username || 'Cerrah'}</span></h1>
          <p className="subtitle">Bugün kazanmaya hazır mısın?</p>
        </div>
        <Link href="/surgery" className="new-prediction-btn">
          <span className="icon">+</span> Yeni Tahmin
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card success-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <div className="stat-label">Başarı Oranı</div>
            <div className="stat-value">%{stats.winRate}</div>
          </div>
          <div className="stat-glow"></div>
        </div>
        <div className="stat-card profit-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-label">Toplam Kazanç</div>
            <div className="stat-value">₺{stats.totalProfit.toLocaleString()}</div>
          </div>
          <div className="stat-glow"></div>
        </div>
        <div className="stat-card active-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-content">
            <div className="stat-label">Aktif Kupon</div>
            <div className="stat-value">{stats.activeCoupons}</div>
          </div>
          <div className="stat-glow"></div>
        </div>
        <div className="stat-card rank-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-content">
            <div className="stat-label">Sıralama</div>
            <div className="stat-value">#{stats.rank}</div>
          </div>
          <div className="stat-glow"></div>
        </div>
      </div>

      {/* Active Predictions */}
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Aktif Tahminler</h2>
          <Link href="/profile/orancerrahi" className="view-all-link">Tümünü Gör →</Link>
        </div>

        <div className="predictions-list">
          {activePredictions.map((pred) => (
            <Link key={pred.id} href={`/prediction/${pred.id}`} className="prediction-link">
              <div className="prediction-card">
                <div className="match-info">
                  <div className="match-time">{pred.time}</div>
                  <div className="match-name">{pred.match}</div>
                  <div className="prediction-meta">
                    <span className="pick-badge">{pred.pick}</span>
                    <span className="odds-badge">@{pred.odds.toFixed(2)}</span>
                  </div>
                </div>
                <div className="status-container">
                  <div className="status-badge pending">
                    <span className="pulse"></span>
                    Bekliyor
                  </div>
                  <div className="arrow-icon">→</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <style jsx>{`
        .dashboard-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 3rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .welcome-text h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          background: linear-gradient(to right, #fff, #ccc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .username {
          background: linear-gradient(to right, var(--primary), #4ade80);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .subtitle {
          color: #888;
          font-size: 1.1rem;
        }

        .new-prediction-btn {
          background: var(--primary);
          color: #000;
          padding: 1rem 2rem;
          border-radius: 1rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s;
          box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
        }

        .new-prediction-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 30px rgba(34, 197, 94, 0.5);
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
          margin-bottom: 4rem;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 1.5rem;
          border-radius: 1.5rem;
          position: relative;
          overflow: hidden;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          border-color: rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.05);
        }

        .stat-icon {
          font-size: 2rem;
          background: rgba(255, 255, 255, 0.05);
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 1rem;
        }

        .stat-label {
          color: #888;
          font-size: 0.9rem;
          margin-bottom: 0.25rem;
        }

        .stat-value {
          font-size: 1.8rem;
          font-weight: 700;
          color: #fff;
        }

        .success-card .stat-value { color: var(--primary); }
        .profit-card .stat-value { color: #fbbf24; }
        .active-card .stat-value { color: #60a5fa; }
        .rank-card .stat-value { color: #f472b6; }

        /* Active Predictions */
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 1.5rem;
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 700;
        }

        .view-all-link {
          color: #888;
          font-size: 0.9rem;
          transition: color 0.2s;
        }

        .view-all-link:hover {
          color: #fff;
        }

        .predictions-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .prediction-link {
          text-decoration: none;
        }

        .prediction-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 1.5rem;
          border-radius: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.3s;
        }

        .prediction-card:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.1);
          transform: translateX(5px);
        }

        .match-time {
          font-size: 0.85rem;
          color: var(--primary);
          margin-bottom: 0.25rem;
          font-weight: 600;
        }

        .match-name {
          font-weight: 600;
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
          color: #fff;
        }

        .prediction-meta {
          display: flex;
          gap: 0.75rem;
        }

        .pick-badge {
          background: rgba(255, 255, 255, 0.1);
          padding: 0.25rem 0.75rem;
          border-radius: 0.5rem;
          font-size: 0.9rem;
          color: #ddd;
        }

        .odds-badge {
          color: var(--accent);
          font-weight: 700;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
        }

        .status-container {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .status-badge {
          padding: 0.5rem 1rem;
          border-radius: 2rem;
          font-size: 0.85rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .status-badge.pending {
          background: rgba(251, 191, 36, 0.1);
          color: #fbbf24;
          border: 1px solid rgba(251, 191, 36, 0.2);
        }

        .pulse {
          width: 8px;
          height: 8px;
          background: currentColor;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .arrow-icon {
          color: #444;
          font-size: 1.2rem;
          transition: transform 0.3s;
        }

        .prediction-card:hover .arrow-icon {
          transform: translateX(5px);
          color: #fff;
        }

        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
          100% { opacity: 1; transform: scale(1); }
        }

        @media (max-width: 768px) {
          .dashboard-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1.5rem;
          }
          
          .new-prediction-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
