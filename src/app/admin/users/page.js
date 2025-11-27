"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    // Fetch users sorted by last_seen_at (newest first)
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('last_seen_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
    } else {
      setUsers(data);
    }
    setLoading(false);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    const { error } = await supabase
      .from('users')
      .update({
        role: editingUser.role,
        rank: editingUser.rank
      })
      .eq('id', editingUser.id);

    if (error) {
      alert('Güncelleme başarısız: ' + error.message);
    } else {
      alert('Kullanıcı güncellendi!');
      setEditingUser(null);
      fetchUsers();
    }
  };

  const isToday = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  return (
    <div className="admin-users-page">
      <div className="page-header">
        <h1>Kullanıcı Yönetimi 👥</h1>
        <p>Toplam Kullanıcı: {users.length}</p>
      </div>

      <div className="users-table-container card">
        <table className="users-table">
          <thead>
            <tr>
              <th>Kullanıcı</th>
              <th>Rütbe / Rol</th>
              <th>Son Görülme</th>
              <th>Giriş</th>
              <th>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="text-center">Yükleniyor...</td></tr>
            ) : users.map(user => (
              <tr key={user.id} className={isToday(user.last_seen_at) ? 'active-today' : ''}>
                <td>
                  <div className="user-cell">
                    <div className="avatar-small">{user.display_name?.[0] || '?'}</div>
                    <div>
                      <div className="font-bold">{user.display_name}</div>
                      <div className="text-sm text-gray-400">@{user.username}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="badge rank">{user.rank}</span>
                  <span className={`badge role ${user.role === 'Admin' ? 'admin' : ''}`}>{user.role}</span>
                </td>
                <td>
                  {new Date(user.last_seen_at).toLocaleString('tr-TR')}
                  {isToday(user.last_seen_at) && <span className="today-badge">BUGÜN</span>}
                </td>
                <td>{user.login_count}</td>
                <td>
                  <button
                    className="btn-edit"
                    onClick={() => setEditingUser(user)}
                  >
                    Düzenle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="modal-overlay">
          <div className="modal card">
            <h2>Kullanıcı Düzenle: {editingUser.display_name}</h2>
            <form onSubmit={handleUpdateUser}>
              <div className="form-group">
                <label>Rol (Yetki)</label>
                <select
                  value={editingUser.role}
                  onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}
                >
                  <option value="Çaylak">Çaylak</option>
                  <option value="Cerrah">Cerrah</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label>Rütbe (Görünen İsim)</label>
                <input
                  type="text"
                  value={editingUser.rank}
                  onChange={e => setEditingUser({ ...editingUser, rank: e.target.value })}
                  placeholder="Örn: Cerrah Paşa"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setEditingUser(null)}>İptal</button>
                <button type="submit" className="btn-save">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
                .admin-users-page {
                    max-width: 1200px;
                    margin: 0 auto;
                }
                .page-header {
                    margin-bottom: 2rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .users-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .users-table th, .users-table td {
                    padding: 1rem;
                    text-align: left;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                }
                .users-table th {
                    color: #888;
                    font-weight: 500;
                }
                .user-cell {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .avatar-small {
                    width: 32px;
                    height: 32px;
                    background: var(--primary);
                    color: #000;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                }
                .badge {
                    padding: 0.2rem 0.5rem;
                    border-radius: 0.25rem;
                    font-size: 0.8rem;
                    margin-right: 0.5rem;
                    background: rgba(255,255,255,0.1);
                }
                .badge.role.admin {
                    background: rgba(239, 68, 68, 0.2);
                    color: #f87171;
                }
                .today-badge {
                    background: var(--primary);
                    color: #000;
                    font-size: 0.7rem;
                    padding: 0.1rem 0.3rem;
                    border-radius: 0.2rem;
                    margin-left: 0.5rem;
                    font-weight: bold;
                }
                .active-today {
                    background: rgba(34, 197, 94, 0.05);
                }
                .btn-edit {
                    background: transparent;
                    border: 1px solid rgba(255,255,255,0.2);
                    color: #fff;
                    padding: 0.3rem 0.8rem;
                    border-radius: 0.3rem;
                    cursor: pointer;
                }
                .btn-edit:hover {
                    background: rgba(255,255,255,0.1);
                }

                /* Modal */
                .modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 100;
                    backdrop-filter: blur(5px);
                }
                .modal {
                    width: 100%;
                    max-width: 400px;
                    padding: 2rem;
                }
                .form-group {
                    margin-bottom: 1.5rem;
                }
                .form-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    color: #ccc;
                }
                .form-group input, .form-group select {
                    width: 100%;
                    padding: 0.75rem;
                    background: rgba(0,0,0,0.2);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 0.5rem;
                    color: #fff;
                }
                .modal-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                }
                .btn-cancel {
                    background: transparent;
                    border: none;
                    color: #888;
                    cursor: pointer;
                }
                .btn-save {
                    background: var(--primary);
                    color: #000;
                    border: none;
                    padding: 0.5rem 1.5rem;
                    border-radius: 0.5rem;
                    font-weight: bold;
                    cursor: pointer;
                }
            `}</style>
    </div>
  );
}
