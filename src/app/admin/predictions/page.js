"use client";

import { useState } from 'react';

export default function PredictionManagementPage() {
  // Mock Predictions Data
  const [predictions, setPredictions] = useState([
    { id: 1, user: "orancerrahi", match: "Galatasaray - Fenerbahçe", pick: "MS 1", odds: 2.10, status: "pending", date: "2023-11-26 20:00" },
    { id: 2, user: "bahisdoktoru", match: "Real Madrid - Barcelona", pick: "KG Var", odds: 1.70, status: "pending", date: "2023-11-26 22:00" },
    { id: 3, user: "analizuzmani", match: "Man City - Liverpool", pick: "Üst 2.5", odds: 1.85, status: "pending", date: "2023-11-26 18:30" },
    { id: 4, user: "bankocu", match: "Lakers - Warriors", pick: "Üst 220.5", odds: 1.85, status: "won", date: "2023-11-25 03:30" },
    { id: 5, user: "kaybeden", match: "Celtics - Heat", pick: "MS 2", odds: 2.50, status: "lost", date: "2023-11-25 02:00" },
  ]);

  const [filter, setFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const filteredPredictions = predictions.filter(pred => {
    if (filter === 'all') return true;
    if (filter === 'pending') return pred.status === 'pending';
    if (filter === 'resolved') return ['won', 'lost'].includes(pred.status);
    return true;
  });

  const handleResult = (id, result) => {
    if (confirm(`Bu tahmini ${result === 'won' ? 'KAZANDI' : 'KAYBETTİ'} olarak işaretlemek istediğinize emin misiniz?`)) {
      setPredictions(predictions.map(pred => {
        if (pred.id === id) {
          return { ...pred, status: result };
        }
        return pred;
      }));
    }
  };

  const handleDelete = (id) => {
    if (confirm('Bu tahmini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
      setPredictions(predictions.filter(pred => pred.id !== id));
    }
  };

  const startEdit = (pred) => {
    setEditingId(pred.id);
    setEditForm(pred);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = () => {
    setPredictions(predictions.map(pred => pred.id === editingId ? editForm : pred));
    setEditingId(null);
    setEditForm({});
    alert('Tahmin güncellendi!');
  };

  return (
    <div className="predictions-page">
      <div className="page-header">
        <h1 className="page-title">Tahmin Yönetimi</h1>
        <div className="filter-tabs">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Tümü
          </button>
          <button
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Bekleyenler
          </button>
          <button
            className={`filter-btn ${filter === 'resolved' ? 'active' : ''}`}
            onClick={() => setFilter('resolved')}
          >
            Sonuçlananlar
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Kullanıcı</th>
              <th>Maç</th>
              <th>Seçim</th>
              <th>Oran</th>
              <th>Tarih</th>
              <th>Durum</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filteredPredictions.map((pred) => (
              <tr key={pred.id} className={editingId === pred.id ? 'editing-row' : ''}>
                <td>#{pred.id}</td>
                <td>
                  <span className="username">{pred.user}</span>
                </td>
                <td>
                  {editingId === pred.id ? (
                    <input
                      value={editForm.match}
                      onChange={e => setEditForm({ ...editForm, match: e.target.value })}
                      className="edit-input"
                    />
                  ) : pred.match}
                </td>
                <td>
                  {editingId === pred.id ? (
                    <input
                      value={editForm.pick}
                      onChange={e => setEditForm({ ...editForm, pick: e.target.value })}
                      className="edit-input short"
                    />
                  ) : (
                    <span className="pick-badge">{pred.pick}</span>
                  )}
                </td>
                <td className="odds">
                  {editingId === pred.id ? (
                    <input
                      type="number"
                      value={editForm.odds}
                      onChange={e => setEditForm({ ...editForm, odds: parseFloat(e.target.value) })}
                      className="edit-input short"
                      step="0.01"
                    />
                  ) : `@${pred.odds.toFixed(2)}`}
                </td>
                <td className="date">{pred.date}</td>
                <td>
                  <span className={`status-badge ${pred.status}`}>
                    {pred.status === 'pending' && 'Bekliyor'}
                    {pred.status === 'won' && 'Kazandı'}
                    {pred.status === 'lost' && 'Kaybetti'}
                  </span>
                </td>
                <td>
                  {editingId === pred.id ? (
                    <div className="actions">
                      <button onClick={saveEdit} className="action-btn save" title="Kaydet">💾</button>
                      <button onClick={cancelEdit} className="action-btn cancel" title="İptal">🚫</button>
                    </div>
                  ) : (
                    <div className="actions">
                      {pred.status === 'pending' && (
                        <>
                          <button
                            className="action-btn win"
                            onClick={() => handleResult(pred.id, 'won')}
                            title="Kazandı"
                          >
                            ✅
                          </button>
                          <button
                            className="action-btn lose"
                            onClick={() => handleResult(pred.id, 'lost')}
                            title="Kaybetti"
                          >
                            ❌
                          </button>
                        </>
                      )}
                      <button
                        className="action-btn edit"
                        onClick={() => startEdit(pred)}
                        title="Düzenle"
                      >
                        ✏️
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => handleDelete(pred.id)}
                        title="Sil"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .page-title {
          font-size: 1.8rem;
          font-weight: 700;
        }

        .filter-tabs {
          display: flex;
          gap: 0.5rem;
          background: #1e293b;
          padding: 0.25rem;
          border-radius: 0.5rem;
        }

        .filter-btn {
          background: transparent;
          border: none;
          color: #94a3b8;
          padding: 0.5rem 1rem;
          border-radius: 0.25rem;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .filter-btn:hover {
          color: #fff;
        }

        .filter-btn.active {
          background: rgba(255,255,255,0.1);
          color: #fff;
        }

        .table-container {
          background: #1e293b;
          border-radius: 1rem;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.05);
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
        }

        th {
          text-align: left;
          padding: 1rem 1.5rem;
          background: rgba(0,0,0,0.2);
          color: #94a3b8;
          font-weight: 600;
          font-size: 0.9rem;
        }

        td {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          color: #cbd5e1;
        }

        tr:last-child td {
          border-bottom: none;
        }
        
        .editing-row {
            background: rgba(59, 130, 246, 0.1);
        }

        .edit-input {
            background: rgba(0,0,0,0.2);
            border: 1px solid rgba(255,255,255,0.2);
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
            color: #fff;
            font-size: 0.9rem;
            width: 100%;
        }
        
        .edit-input.short {
            width: 80px;
        }

        .username {
          font-weight: 600;
          color: #fff;
        }

        .pick-badge {
          background: rgba(255,255,255,0.1);
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.85rem;
        }

        .odds {
          font-weight: 700;
          color: var(--primary);
        }

        .date {
          font-size: 0.85rem;
          color: #94a3b8;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .status-badge.pending { background: rgba(251, 191, 36, 0.2); color: #fbbf24; }
        .status-badge.won { background: rgba(34, 197, 94, 0.2); color: #4ade80; }
        .status-badge.lost { background: rgba(248, 113, 113, 0.2); color: #f87171; }

        .actions {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          width: 32px;
          height: 32px;
          border-radius: 0.5rem;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 1rem;
        }

        .action-btn:hover {
          transform: scale(1.1);
        }

        .action-btn.win { background: rgba(34, 197, 94, 0.2); }
        .action-btn.win:hover { background: rgba(34, 197, 94, 0.4); }

        .action-btn.lose { background: rgba(248, 113, 113, 0.2); }
        .action-btn.lose:hover { background: rgba(248, 113, 113, 0.4); }
        
        .action-btn.edit { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
        .action-btn.delete { background: rgba(248, 113, 113, 0.2); color: #f87171; }
        
        .action-btn.save { background: rgba(34, 197, 94, 0.2); color: #4ade80; }
        .action-btn.cancel { background: rgba(248, 113, 113, 0.2); color: #f87171; }
      `}</style>
    </div>
  );
}
