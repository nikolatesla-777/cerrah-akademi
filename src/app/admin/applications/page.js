"use client";

import { useState } from 'react';

export default function ApplicationsPage() {
    // Mock Applications Data
    const [applications, setApplications] = useState([
        { id: 1, user: "yeni_cerrah", date: "2023-11-27", status: "pending", note: "Yarışmaya katılmak istiyorum, analizlerime güveniyorum." },
        { id: 2, user: "futbol_adami", date: "2023-11-26", status: "pending", note: "Daha önce başka platformlarda derecelerim var." },
        { id: 3, user: "basket_guru", date: "2023-11-25", status: "approved", note: "NBA uzmanıyım." },
        { id: 4, user: "acemi_sans", date: "2023-11-25", status: "rejected", note: "Denemek istiyorum." },
    ]);

    const handleAction = (id, action) => {
        const status = action === 'approve' ? 'approved' : 'rejected';
        const confirmMsg = action === 'approve'
            ? 'Bu kullanıcıyı "Yarışmacı" olarak onaylamak istiyor musunuz?'
            : 'Bu başvuruyu reddetmek istiyor musunuz?';

        if (confirm(confirmMsg)) {
            setApplications(applications.map(app => {
                if (app.id === id) {
                    return { ...app, status: status };
                }
                return app;
            }));
        }
    };

    return (
        <div className="applications-page">
            <div className="page-header">
                <h1 className="page-title">Yarışma Başvuruları 📋</h1>
            </div>

            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Kullanıcı</th>
                            <th>Tarih</th>
                            <th>Not</th>
                            <th>Durum</th>
                            <th>İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        {applications.map((app) => (
                            <tr key={app.id}>
                                <td>
                                    <span className="username">{app.user}</span>
                                </td>
                                <td className="date">{app.date}</td>
                                <td className="note">{app.note}</td>
                                <td>
                                    <span className={`status-badge ${app.status}`}>
                                        {app.status === 'pending' && 'Bekliyor'}
                                        {app.status === 'approved' && 'Onaylandı'}
                                        {app.status === 'rejected' && 'Reddedildi'}
                                    </span>
                                </td>
                                <td>
                                    {app.status === 'pending' && (
                                        <div className="actions">
                                            <button
                                                className="action-btn approve"
                                                onClick={() => handleAction(app.id, 'approve')}
                                                title="Onayla"
                                            >
                                                ✅
                                            </button>
                                            <button
                                                className="action-btn reject"
                                                onClick={() => handleAction(app.id, 'reject')}
                                                title="Reddet"
                                            >
                                                ❌
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
          margin-bottom: 2rem;
        }

        .page-title {
          font-size: 1.8rem;
          font-weight: 700;
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

        .username {
          font-weight: 600;
          color: #fff;
        }

        .date {
          font-size: 0.85rem;
          color: #94a3b8;
        }
        
        .note {
            font-size: 0.9rem;
            max-width: 300px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .status-badge.pending { background: rgba(251, 191, 36, 0.2); color: #fbbf24; }
        .status-badge.approved { background: rgba(34, 197, 94, 0.2); color: #4ade80; }
        .status-badge.rejected { background: rgba(248, 113, 113, 0.2); color: #f87171; }

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

        .action-btn.approve { background: rgba(34, 197, 94, 0.2); }
        .action-btn.approve:hover { background: rgba(34, 197, 94, 0.4); }

        .action-btn.reject { background: rgba(248, 113, 113, 0.2); }
        .action-btn.reject:hover { background: rgba(248, 113, 113, 0.4); }
      `}</style>
        </div>
    );
}
