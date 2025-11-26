"use client";

import { useState } from 'react';

export default function FixtureManagementPage() {
  const [fixtures, setFixtures] = useState([
    { id: 1, home: "Galatasaray", away: "Fenerbahçe", date: "2023-11-26", time: "20:00", league: "Süper Lig" },
    { id: 2, home: "Real Madrid", away: "Barcelona", date: "2023-11-26", time: "22:00", league: "La Liga" },
    { id: 3, home: "Man City", away: "Liverpool", date: "2023-11-26", time: "18:30", league: "Premier League" },
  ]);

  const [newFixture, setNewFixture] = useState({
    home: '',
    away: '',
    date: '',
    time: '',
    league: ''
  });

  const [isEditing, setIsEditing] = useState(null);

  const handleAddFixture = (e) => {
    e.preventDefault();
    const fixture = {
      id: fixtures.length + 1,
      ...newFixture
    };
    setFixtures([...fixtures, fixture]);
    setNewFixture({ home: '', away: '', date: '', time: '', league: '' });
    alert('Maç başarıyla eklendi!');
  };

  const handleDeleteFixture = (id) => {
    if (confirm('Bu maçı silmek istediğinize emin misiniz?')) {
      setFixtures(fixtures.filter(f => f.id !== id));
    }
  };

  const startEdit = (fixture) => {
    setIsEditing(fixture.id);
    setNewFixture(fixture);
  };

  const cancelEdit = () => {
    setIsEditing(null);
    setNewFixture({ home: '', away: '', date: '', time: '', league: '' });
  };

  const handleUpdateFixture = (e) => {
    e.preventDefault();
    setFixtures(fixtures.map(f => f.id === isEditing ? { ...newFixture, id: isEditing } : f));
    setIsEditing(null);
    setNewFixture({ home: '', away: '', date: '', time: '', league: '' });
    alert('Maç güncellendi!');
  };

  return (
    <div className="fixtures-page">
      <div className="page-header">
        <h1 className="page-title">Fikstür Yönetimi</h1>
      </div>

      <div className="content-grid">
        {/* Add/Edit Fixture Form */}
        <div className="card form-card">
          <h2 className="card-title">{isEditing ? 'Maçı Düzenle' : 'Yeni Maç Ekle'}</h2>
          <form onSubmit={isEditing ? handleUpdateFixture : handleAddFixture} className="fixture-form">
            <div className="form-group">
              <label>Lig</label>
              <input
                type="text"
                placeholder="Örn: Süper Lig"
                value={newFixture.league}
                onChange={(e) => setNewFixture({ ...newFixture, league: e.target.value })}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Ev Sahibi</label>
                <input
                  type="text"
                  placeholder="Takım Adı"
                  value={newFixture.home}
                  onChange={(e) => setNewFixture({ ...newFixture, home: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Deplasman</label>
                <input
                  type="text"
                  placeholder="Takım Adı"
                  value={newFixture.away}
                  onChange={(e) => setNewFixture({ ...newFixture, away: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Tarih</label>
                <input
                  type="date"
                  value={newFixture.date}
                  onChange={(e) => setNewFixture({ ...newFixture, date: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Saat</label>
                <input
                  type="time"
                  value={newFixture.time}
                  onChange={(e) => setNewFixture({ ...newFixture, time: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn">
                {isEditing ? 'Güncelle' : 'Maçı Ekle'}
              </button>
              {isEditing && (
                <button type="button" onClick={cancelEdit} className="cancel-btn">
                  İptal
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Existing Fixtures List */}
        <div className="card list-card">
          <h2 className="card-title">Ekli Maçlar</h2>
          <div className="fixtures-list">
            {fixtures.map((fixture) => (
              <div key={fixture.id} className="fixture-item">
                <div className="fixture-info">
                  <span className="league-badge">{fixture.league}</span>
                  <div className="teams">
                    <span className="team home">{fixture.home}</span>
                    <span className="vs">vs</span>
                    <span className="team away">{fixture.away}</span>
                  </div>
                </div>
                <div className="fixture-meta">
                  <div className="meta-info">
                    <span className="date">{fixture.date}</span>
                    <span className="time">{fixture.time}</span>
                  </div>
                  <div className="fixture-actions">
                    <button onClick={() => startEdit(fixture)} className="action-btn edit" title="Düzenle">✏️</button>
                    <button onClick={() => handleDeleteFixture(fixture.id)} className="action-btn delete" title="Sil">🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .page-header {
          margin-bottom: 2rem;
        }

        .page-title {
          font-size: 1.8rem;
          font-weight: 700;
        }

        .content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        @media (max-width: 1024px) {
          .content-grid {
            grid-template-columns: 1fr;
          }
        }

        .card {
          background: #1e293b;
          border-radius: 1rem;
          padding: 1.5rem;
          border: 1px solid rgba(255,255,255,0.05);
        }

        .card-title {
          font-size: 1.2rem;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .fixture-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-row {
          display: flex;
          gap: 1rem;
        }

        .form-group {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        label {
          font-size: 0.9rem;
          color: #94a3b8;
        }

        input {
          background: rgba(0,0,0,0.2);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 0.75rem;
          border-radius: 0.5rem;
          color: #fff;
          font-size: 1rem;
        }

        input:focus {
          outline: none;
          border-color: var(--primary);
        }

        .form-actions {
            display: flex;
            gap: 1rem;
            margin-top: 1rem;
        }

        .submit-btn {
          flex: 1;
          background: var(--primary);
          color: #000;
          border: none;
          padding: 1rem;
          border-radius: 0.5rem;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .cancel-btn {
            background: rgba(255,255,255,0.1);
            color: #fff;
            border: none;
            padding: 1rem;
            border-radius: 0.5rem;
            font-weight: 600;
            cursor: pointer;
        }

        .submit-btn:hover {
          transform: translateY(-2px);
        }

        .fixtures-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          max-height: 500px;
          overflow-y: auto;
        }

        .fixture-item {
          background: rgba(255,255,255,0.03);
          padding: 1rem;
          border-radius: 0.75rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .fixture-info {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .league-badge {
          font-size: 0.75rem;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .teams {
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .vs {
          color: #64748b;
          font-size: 0.8rem;
        }

        .fixture-meta {
          text-align: right;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          align-items: flex-end;
        }
        
        .meta-info {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
            font-size: 0.9rem;
            color: #94a3b8;
            text-align: right;
        }

        .time {
          color: var(--primary);
          font-weight: 700;
        }
        
        .fixture-actions {
            display: flex;
            gap: 0.5rem;
        }
        
        .action-btn {
            width: 28px;
            height: 28px;
            border-radius: 0.5rem;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 0.9rem;
        }

        .action-btn.edit { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
        .action-btn.delete { background: rgba(248, 113, 113, 0.2); color: #f87171; }

        .action-btn:hover {
            transform: scale(1.1);
        }
      `}</style>
    </div>
  );
}
