"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminLayout({ children }) {
    const pathname = usePathname();
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);

    // Simulated Auth Check
    useEffect(() => {
        // In a real app, check session/token here.
        // For now, we'll assume the user is "orancerrahi" (admin)
        // You can change this logic to check localStorage or a context
        const user = { username: "orancerrahi", role: "admin" };

        if (user.role !== 'admin') {
            router.push('/');
        } else {
            setAuthorized(true);
        }
    }, [router]);

    if (!authorized) return null;

    const menuItems = [
        { name: 'Dashboard', path: '/admin', icon: '📊' },
        { name: 'Kullanıcılar', path: '/admin/users', icon: '👥' },
        { name: 'Tahminler', path: '/admin/predictions', icon: '📝' },
        { name: 'Fikstür', path: '/admin/fixtures', icon: '📅' },
    ];

    return (
        <div className="admin-container">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <h2>Cerrah<span className="accent">Panel</span></h2>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`nav-item ${pathname === item.path ? 'active' : ''}`}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <Link href="/" className="back-home">
                        ← Siteye Dön
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-content">
                {children}
            </main>

            <style jsx>{`
        .admin-container {
          display: flex;
          min-height: 100vh;
          background: #0f172a; /* Darker background for admin */
          color: #fff;
        }

        .admin-sidebar {
          width: 260px;
          background: #1e293b;
          border-right: 1px solid rgba(255,255,255,0.1);
          display: flex;
          flex-direction: column;
          position: fixed;
          height: 100vh;
        }

        .sidebar-header {
          padding: 2rem;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .sidebar-header h2 {
          font-size: 1.5rem;
          font-weight: 700;
        }

        .accent {
          color: var(--primary);
        }

        .sidebar-nav {
          padding: 2rem 1rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border-radius: 0.75rem;
          color: #94a3b8;
          text-decoration: none;
          transition: all 0.2s;
          font-weight: 500;
        }

        .nav-item:hover {
          background: rgba(255,255,255,0.05);
          color: #fff;
        }

        .nav-item.active {
          background: var(--primary);
          color: #000;
        }

        .sidebar-footer {
          padding: 2rem;
          border-top: 1px solid rgba(255,255,255,0.05);
        }

        .back-home {
          color: #94a3b8;
          text-decoration: none;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: color 0.2s;
        }

        .back-home:hover {
          color: #fff;
        }

        .admin-content {
          flex: 1;
          margin-left: 260px;
          padding: 2rem;
          background: #0f172a;
        }
      `}</style>
        </div>
    );
}
