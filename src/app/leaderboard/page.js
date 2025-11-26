"use client";

import Link from 'next/link';

export default function LeaderboardPage() {
  // Mock data - top 3 for podium
  const topThree = [
    { rank: 2, username: "bahisdoktoru", winRate: 72, profit: 9800, followers: 850, avatar: "B" },
    { rank: 1, username: "orancerrahi", winRate: 78, profit: 12500, followers: 1250, avatar: "O" },
    { rank: 3, username: "analizuzmani", winRate: 68, profit: 8500, followers: 620, avatar: "A" },
  ];

  // Rest of the leaderboard
  const restOfLeaders = [
    { rank: 4, username: "bankocu", winRate: 65, profit: 7200, followers: 480, trend: "same" },
    { rank: 5, username: "golmakinesi", winRate: 62, profit: 6400, followers: 390, trend: "up" },
    { rank: 6, username: "tahminuzmani", winRate: 60, profit: 5800, followers: 310, trend: "down" },
    { rank: 7, username: "betmaster", winRate: 58, profit: 5200, followers: 280, trend: "up" },
    { rank: 8, username: "sporanaliz", winRate: 56, profit: 4900, followers: 250, trend: "same" },
  ];

  return (
    <div className="leaderboard-container">
      {/* Header */}
      <div className="page-header">
        <h1 className="title">Liderlik Tablosu 🏆</h1>
        <p className="subtitle">En başarılı cerrahlar ve ödülleri</p>
      </div>

      {/* Podium - Top 3 */}
      <div className="podium-container">
        {topThree.map((leader) => (
          <div
            key={leader.rank}
            className={`podium-card rank-${leader.rank}`}
            style={{ order: leader.rank === 1 ? 2 : leader.rank === 2 ? 1 : 3 }}
          >
            <div className="podium-content">
              {/* Medal/Badge */}
              <div className={`medal medal-${leader.rank}`}>
                {leader.rank === 1 && '🥇'}
                {leader.rank === 2 && '🥈'}
                {leader.rank === 3 && '🥉'}
              </div>

              {/* Avatar */}
              <Link href={`/profile/${leader.username}`}>
                <div className="podium-avatar">
                  {leader.avatar}
                </div>
              </Link>

              {/* Name */}
              <Link href={`/profile/${leader.username}`} className="podium-username">
                {leader.username}
              </Link>

              {/* Stats Card */}
              <div className="stats-card">
                <div className="stat-item">
                  <span className="stat-label">Kazanç</span>
                  <span className="stat-value">₺{leader.profit.toLocaleString()}</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                  <span className="stat-label">Başarı</span>
                  <span className="stat-value success">%{leader.winRate}</span>
                </div>
              </div>

              {/* Prize Badge */}
              <div className="prize-badge">
                <span className="prize-icon">💎</span>
                <span className="prize-amount">
                  {leader.rank === 1 && '10.000 TL'}
                  {leader.rank === 2 && '5.000 TL'}
                  {leader.rank === 3 && '2.500 TL'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Countdown Timer */}
      <div className="countdown-section">
        <div className="countdown-icon">⏱️</div>
        <div className="countdown-text">
          <span className="countdown-label">Dönem Bitiş</span>
          <span className="countdown-timer">10g 23s 59d 29s</span>
        </div>
      </div>

      {/* Rest of Leaderboard - Table */}
      <div className="leaderboard-table-container">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th className="rank-col">#</th>
              <th className="user-col">Cerrah</th>
              <th className="followers-col">Takipçi</th>
              <th className="rate-col">Başarı</th>
              <th className="profit-col">Kazanç</th>
              <th className="trend-col">Trend</th>
            </tr>
          </thead>
          <tbody>
            {restOfLeaders.map((leader) => (
              <tr key={leader.rank}>
                <td className="rank-col">
                  <span className="rank-number">{leader.rank}</span>
                </td>
                <td className="user-col">
                  <Link href={`/profile/${leader.username}`} className="user-link">
                    <div className="user-avatar-small">
                      {leader.username[0].toUpperCase()}
                    </div>
                    <span className="username">{leader.username}</span>
                  </Link>
                </td>
                <td className="followers-col">{leader.followers.toLocaleString()}</td>
                <td className="rate-col success">%{leader.winRate}</td>
                <td className="profit-col">₺{leader.profit.toLocaleString()}</td>
                <td className="trend-col">
                  {leader.trend === 'up' && <span className="trend up">▲</span>}
                  {leader.trend === 'down' && <span className="trend down">▼</span>}
                  {leader.trend === 'same' && <span className="trend same">━</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .leaderboard-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }

        /* Header */
        .page-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .title {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .subtitle {
          color: #a3a3a3;
          font-size: 1.1rem;
        }

        /* Podium Container */
        .podium-container {
          display: flex;
          justify-content: center;
          align-items: flex-end;
          gap: 2rem;
          margin-bottom: 3rem;
          padding: 2rem 1rem;
        }

        .podium-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 1.5rem;
          padding: 2rem 1.5rem;
          min-width: 240px;
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
        }

        .podium-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        }

        .podium-card.rank-1 {
          transform: scale(1.1);
          border-color: #fbbf24;
          box-shadow: 0 10px 30px rgba(251, 191, 36, 0.3);
        }

        .podium-card.rank-1::before {
          background: linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%);
          height: 6px;
        }

        .podium-card.rank-2 {
          border-color: #94a3b8;
          box-shadow: 0 8px 20px rgba(148, 163, 184, 0.2);
        }

        .podium-card.rank-2::before {
          background: linear-gradient(90deg, #cbd5e1 0%, #94a3b8 100%);
        }

        .podium-card.rank-3 {
          border-color: #b45309;
          box-shadow: 0 8px 20px rgba(180, 83, 9, 0.2);
        }

        .podium-card.rank-3::before {
          background: linear-gradient(90deg, #f97316 0%, #b45309 100%);
        }

        .podium-card:hover {
          transform: scale(1.05);
          box-shadow: 0 15px 40px rgba(102, 126, 234, 0.3);
        }

        .podium-card.rank-1:hover {
          transform: scale(1.15);
        }

        .podium-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
        }

        /* Medal */
        .medal {
          font-size: 3rem;
          margin-bottom: 1rem;
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        /* Podium Avatar */
        .podium-avatar {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
          color: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          font-weight: 700;
          margin-bottom: 1rem;
          cursor: pointer;
          transition: transform 0.3s;
          border: 4px solid var(--surface);
          box-shadow: 0 8px 20px rgba(34, 197, 94, 0.3);
        }

        .rank-1 .podium-avatar {
          border-color: #fbbf24;
          box-shadow: 0 8px 20px rgba(251, 191, 36, 0.5);
        }

        .rank-2 .podium-avatar {
          border-color: #94a3b8;
          box-shadow: 0 8px 20px rgba(148, 163, 184, 0.4);
        }

        .rank-3 .podium-avatar {
          border-color: #b45309;
          box-shadow: 0 8px 20px rgba(180, 83, 9, 0.4);
        }

        .podium-avatar:hover {
          transform: scale(1.1) rotate(5deg);
        }

        /* Podium Username */
        .podium-username {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          transition: color 0.2s;
        }

        .podium-username:hover {
          color: var(--primary);
        }

        /* Stats Card */
        .stats-card {
          display: flex;
          gap: 1rem;
          width: 100%;
          background: var(--background);
          padding: 1rem;
          border-radius: 1rem;
          margin-bottom: 1rem;
        }

        .stat-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }

        .stat-label {
          font-size: 0.8rem;
          color: #888;
        }

        .stat-value {
          font-size: 1.1rem;
          font-weight: 700;
        }

        .stat-value.success {
          color: var(--primary);
        }

        .stat-divider {
          width: 1px;
          background: var(--border);
        }

        /* Prize Badge */
        .prize-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(34, 197, 94, 0.1);
          padding: 0.75rem 1.5rem;
          border-radius: 2rem;
          border: 1px solid rgba(34, 197, 94, 0.2);
        }

        .rank-1 .prize-badge {
          background: rgba(251, 191, 36, 0.1);
          border-color: rgba(251, 191, 36, 0.3);
        }

        .prize-icon {
          font-size: 1.2rem;
        }

        .prize-amount {
          font-weight: 700;
          color: var(--primary);
          font-size: 1.1rem;
        }

        .rank-1 .prize-amount {
          color: #fbbf24;
        }

        /* Countdown Section */
        .countdown-section {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 1.5rem;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 1rem;
          margin-bottom: 3rem;
        }

        .countdown-icon {
          font-size: 2rem;
        }

        .countdown-text {
          display: flex;
          flex-direction: column;
        }

        .countdown-label {
          font-size: 0.9rem;
          color: #888;
        }

        .countdown-timer {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--accent);
        }

        /* Table */
        .leaderboard-table-container {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 1rem;
          overflow: hidden;
        }

        .leaderboard-table {
          width: 100%;
          border-collapse: collapse;
        }

        th {
          text-align: left;
          padding: 1rem 1.5rem;
          color: #888;
          font-weight: 600;
          font-size: 0.9rem;
          border-bottom: 1px solid var(--border);
          background: var(--background);
        }

        td {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--border);
        }

        tr:last-child td {
          border-bottom: none;
        }

        tbody tr {
          transition: background 0.2s;
        }

        tbody tr:hover {
          background: var(--surface-hover);
        }

        .rank-col { width: 60px; text-align: center; }
        .rate-col { text-align: center; }
        .profit-col { text-align: right; }
        .followers-col { text-align: center; }
        .trend-col { width: 60px; text-align: center; }

        .rank-number {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--surface-hover);
          font-weight: 600;
        }

        .user-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          transition: color 0.2s;
        }

        .user-link:hover .username {
          color: var(--primary);
        }

        .user-avatar-small {
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

        .username {
          font-weight: 600;
        }

        .success { 
          color: var(--primary); 
          font-weight: 700;
        }

        .trend.up { color: var(--primary); font-size: 1.2rem; }
        .trend.down { color: var(--danger); font-size: 1.2rem; }
        .trend.same { color: #888; font-size: 1.2rem; }

        @media (max-width: 968px) {
          .podium-container {
            flex-direction: column;
            align-items: center;
          }

          .podium-card {
            width: 100%;
            max-width: 300px;
          }

          .podium-card.rank-1 {
            order: 1;
            transform: scale(1);
          }

          .podium-card.rank-2 {
            order: 2;
          }

          .podium-card.rank-3 {
            order: 3;
          }

          .leaderboard-table {
            font-size: 0.9rem;
          }

          th, td {
            padding: 0.75rem 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}
