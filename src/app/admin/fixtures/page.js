"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminFixturesPage() {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [botStatus, setBotStatus] = useState('');

  useEffect(() => {
    fetchFixtures();
  }, []);

  const fetchFixtures = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('fixtures')
      .select('*')
      .order('match_time', { ascending: true });

    if (error) console.error('Error fetching fixtures:', error);
    else setFixtures(data || []);
    setLoading(false);
  };

  const runBot = async (type) => {
    setBotStatus(`Running ${type} Bot...`);
    try {
      const res = await fetch(`/api/bots/${type}`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setBotStatus(`✅ ${type} Bot: ${data.message}`);
        fetchFixtures(); // Refresh list
      } else {
        setBotStatus(`❌ Error: ${data.error}`);
      }
    } catch (e) {
      setBotStatus(`❌ Error: ${e.message}`);
    }
  };

  return (
    <div className="admin-fixtures-page">
      <div className="page-header">
        <h1>Fikstür ve Bot Yönetimi 🤖</h1>
        <div className="bot-controls">
          <button className="btn-bot" onClick={() => runBot('fixtures')}>
            📅 Fikstür Çek
          </button>
          <button className="btn-bot" onClick={() => runBot('odds')}>
            📈 Oran Güncelle
          </button>
          <button className="btn-bot" onClick={() => runBot('results')}>
            🏁 Sonuç Kontrol
          </button>
        </div>
      </div>

      {botStatus && <div className="status-message">{botStatus}</div>}

      <div className="fixtures-table-container card">
        <table className="fixtures-table">
          <thead>
            <tr>
              <th>Tarih</th>
              <th>Maç</th>
              <th>Lig</th>
              <th>Oranlar (1-X-2)</th>
              <th>Skor</th>
              <th>Durum</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="text-center">Yükleniyor...</td></tr>
            ) : fixtures.length === 0 ? (
              <tr><td colSpan="6" className="text-center">Henüz maç yok. Botu çalıştırın!</td></tr>
            ) : fixtures.map(f => (
              <tr key={f.id}>
                <td>{new Date(f.match_time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</td>
                <td>
                  <div className="match-teams">
                    <span className="home">{f.home_team}</span>
                    <span className="vs">-</span>
                    <span className="away">{f.away_team}</span>
                  </div>
                </td>
                <td>{f.league}</td>
                <td>
                  <div className="odds-display">
                    <span>{f.odds?.['1']}</span>
                    <span>{f.odds?.['X']}</span>
                    <span>{f.odds?.['2']}</span>
                  </div>
                </td>
                <td className="font-bold">{f.score || '-'}</td>
                <td>
                  <span className={`badge status-${f.status.toLowerCase()}`}>
                    {f.status === 'NOT_STARTED' ? 'Bekliyor' : f.status === 'FINISHED' ? 'Bitti' : f.status}
                  </span>
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
                .bot-controls {
                    display: flex;
                    gap: 1rem;
                }
                .btn-bot {
                    background: #3b82f6;
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 0.5rem;
                    font-weight: bold;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .btn-bot:hover {
                    background: #2563eb;
                }
                .status-message {
                    background: rgba(255,255,255,0.1);
                    padding: 1rem;
                    border-radius: 0.5rem;
                    margin-bottom: 2rem;
                    border-left: 4px solid var(--primary);
                }
                .fixtures-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .fixtures-table th, .fixtures-table td {
                    padding: 1rem;
                    text-align: left;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                }
                .match-teams {
                    display: flex;
                    gap: 0.5rem;
                    align-items: center;
                }
                .odds-display {
                    display: flex;
                    gap: 0.5rem;
                    font-family: monospace;
                    color: var(--primary);
                }
                .badge {
                    padding: 0.25rem 0.5rem;
                    border-radius: 0.25rem;
                    font-size: 0.8rem;
                }
                .status-not_started { background: rgba(255,255,255,0.1); color: #ccc; }
                .status-finished { background: rgba(34, 197, 94, 0.2); color: #4ade80; }
            `}</style>
    </div>
  );
}
