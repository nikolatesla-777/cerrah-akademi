"use client";

export default function AdminDashboard() {
    // Mock Stats
    const stats = [
        { label: 'Toplam Kullanıcı', value: '1,245', change: '+12%', icon: '👥', color: 'blue' },
        { label: 'Aktif Tahminler', value: '42', change: '-5%', icon: '📝', color: 'yellow' },
        { label: 'Toplam Gelir', value: '₺45,200', change: '+24%', icon: '💰', color: 'green' },
        { label: 'Bekleyen Onay', value: '8', change: '⚠️', icon: '⏳', color: 'orange' },
    ];

    return (
        <div className="admin-dashboard">
            <h1 className="page-title">Dashboard</h1>

            {/* Stats Grid */}
            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div key={index} className={`stat-card ${stat.color}`}>
                        <div className="stat-icon">{stat.icon}</div>
                        <div className="stat-info">
                            <span className="stat-label">{stat.label}</span>
                            <div className="stat-value-row">
                                <span className="stat-value">{stat.value}</span>
                                <span className={`stat-change ${stat.change.includes('+') ? 'positive' : 'negative'}`}>
                                    {stat.change}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity Section (Placeholder for now) */}
            <div className="recent-activity">
                <h2 className="section-title">Son Aktiviteler</h2>
                <div className="activity-list">
                    <div className="activity-item">
                        <span className="time">10:42</span>
                        <p><strong>bahisdoktoru</strong> yeni bir tahmin paylaştı: <em>Galatasaray - Fenerbahçe</em></p>
                    </div>
                    <div className="activity-item">
                        <span className="time">09:15</span>
                        <p><strong>yeni_uye_123</strong> kayıt oldu.</p>
                    </div>
                    <div className="activity-item">
                        <span className="time">Dün</span>
                        <p><strong>admin</strong> 3 tahmini sonuçlandırdı.</p>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .page-title {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 2rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .stat-card {
          background: #1e293b;
          padding: 1.5rem;
          border-radius: 1rem;
          border: 1px solid rgba(255,255,255,0.05);
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          background: rgba(255,255,255,0.05);
        }

        .stat-card.blue .stat-icon { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
        .stat-card.green .stat-icon { background: rgba(34, 197, 94, 0.2); color: #4ade80; }
        .stat-card.yellow .stat-icon { background: rgba(251, 191, 36, 0.2); color: #fbbf24; }
        .stat-card.orange .stat-icon { background: rgba(249, 115, 22, 0.2); color: #fb923c; }

        .stat-info {
          flex: 1;
        }

        .stat-label {
          color: #94a3b8;
          font-size: 0.9rem;
          display: block;
          margin-bottom: 0.25rem;
        }

        .stat-value-row {
          display: flex;
          align-items: baseline;
          gap: 0.75rem;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #fff;
        }

        .stat-change {
          font-size: 0.85rem;
          font-weight: 600;
          padding: 0.1rem 0.4rem;
          border-radius: 0.25rem;
        }

        .stat-change.positive { color: #4ade80; background: rgba(74, 222, 128, 0.1); }
        .stat-change.negative { color: #f87171; background: rgba(248, 113, 113, 0.1); }

        .recent-activity {
          background: #1e293b;
          border-radius: 1rem;
          padding: 1.5rem;
          border: 1px solid rgba(255,255,255,0.05);
        }

        .section-title {
          font-size: 1.2rem;
          margin-bottom: 1.5rem;
          color: #e2e8f0;
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .activity-item {
          display: flex;
          gap: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .activity-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .time {
          color: #64748b;
          font-size: 0.9rem;
          min-width: 60px;
        }

        p {
          color: #cbd5e1;
          font-size: 0.95rem;
          margin: 0;
        }

        strong { color: #fff; }
        em { color: var(--primary); font-style: normal; }
      `}</style>
        </div>
    );
}
