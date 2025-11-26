"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function UserManagementPage() {
    // Mock Users Data
    const [users, setUsers] = useState([
        { id: 1, username: "bahisdoktoru", role: "user", status: "active", joined: "2023-10-15", balance: 9800 },
        { id: 2, username: "orancerrahi", role: "admin", status: "active", joined: "2023-09-01", balance: 12500 },
        { id: 3, username: "analizuzmani", role: "user", status: "active", joined: "2023-11-02", balance: 8500 },
        { id: 4, username: "spammer123", role: "user", status: "banned", joined: "2023-11-20", balance: 0 },
        { id: 5, username: "bankocu", role: "user", status: "active", joined: "2023-10-25", balance: 7200 },
    ]);

    const toggleBan = (id) => {
        setUsers(users.map(user => {
            if (user.id === id) {
                return { ...user, status: user.status === 'active' ? 'banned' : 'active' };
            }
            return user;
        }));
    };

    return (
        <div className="users-page">
            <div className="page-header">
                <h1 className="page-title">Kullanıcı Yönetimi</h1>
                <div className="search-box">
                    <input type="text" placeholder="Kullanıcı ara..." className="search-input" />
                </div>
            </div>

            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Kullanıcı Adı</th>
                            <th>Rol</th>
                            <th>Kayıt Tarihi</th>
                            <th>Bakiye</th>
                            <th>Durum</th>
                            <th>İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>#{user.id}</td>
                                <td>
                                    <div className="user-cell">
                                        <div className="avatar-circle">{user.username[0].toUpperCase()}</div>
                                        <span className="username">{user.username}</span>
                                    </div>
                                </td>
                                <td>
                                    <span className={`role-badge ${user.role}`}>{user.role}</span>
                                </td>
                                <td>{user.joined}</td>
                                <td>₺{user.balance.toLocaleString()}</td>
                                <td>
                                    <span className={`status-badge ${user.status}`}>
                                        {user.status === 'active' ? 'Aktif' : 'Yasaklı'}
                                    </span>
                                </td>
                                <td>
                                    <div className="actions">
                                        <Link href={`/profile/${user.username}`} className="action-btn view" title="Profili Gör">
                                            👁️
                                        </Link>
                                        {user.role !== 'admin' && (
                                            <button
                                                className={`action-btn ${user.status === 'active' ? 'ban' : 'unban'}`}
                                                onClick={() => toggleBan(user.id)}
                                                title={user.status === 'active' ? 'Yasakla' : 'Yasağı Kaldır'}
                                            >
                                                {user.status === 'active' ? '🚫' : '✅'}
                                            </button>
                                        )}
                                    </div>
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

        .search-input {
          background: #1e293b;
          border: 1px solid rgba(255,255,255,0.1);
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          color: #fff;
          width: 300px;
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

        .user-cell {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .avatar-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--primary);
          color: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.9rem;
        }

        .role-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .role-badge.admin { background: rgba(168, 85, 247, 0.2); color: #c084fc; }
        .role-badge.user { background: rgba(148, 163, 184, 0.2); color: #cbd5e1; }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .status-badge.active { background: rgba(34, 197, 94, 0.2); color: #4ade80; }
        .status-badge.banned { background: rgba(248, 113, 113, 0.2); color: #f87171; }

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
          background: rgba(255,255,255,0.05);
          font-size: 1rem;
          text-decoration: none;
        }

        .action-btn:hover {
          background: rgba(255,255,255,0.1);
          transform: scale(1.1);
        }

        .action-btn.ban:hover { background: rgba(248, 113, 113, 0.2); }
        .action-btn.unban:hover { background: rgba(34, 197, 94, 0.2); }
      `}</style>
        </div>
    );
}
