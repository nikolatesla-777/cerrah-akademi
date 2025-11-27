"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Real Auth Check
  useEffect(() => {
    // Check localStorage for user
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/');
      return;
    }

    try {
      const user = JSON.parse(storedUser);
      if (user.role !== 'Admin') {
        alert('Bu alana giriş yetkiniz yok!');
        router.push('/');
      } else {
        setAuthorized(true);
      }
    } catch (e) {
      router.push('/');
    }
  }, [router]);

  if (!authorized) return null;

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: '📊' },
    { name: 'Kullanıcılar', path: '/admin/users', icon: '👥' },
    { name: 'Tahminler', path: '/admin/predictions', icon: '📝' },
    { name: 'Fikstür', path: '/admin/fixtures', icon: '📅' },
    { name: 'Başvurular', path: '/admin/applications', icon: '📋' },
    { name: 'İçerik', path: '/admin/content', icon: '🖼️' },
  ];

  return (
    <div className="admin-container">
      {/* Mobile Header */}
      <div className="mobile-header">
        <button
          className="mobile-toggle"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          ☰
        </button>
        <span className="mobile-title">Cerrah<span className="accent">Panel</span></span>
      </div>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          {!isCollapsed && <h2>Cerrah<span className="accent">Panel</span></h2>}
          <button
            className="collapse-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Genişlet" : "Daralt"}
          >
            {isCollapsed ? '»' : '«'}
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`nav-item ${pathname === item.path ? 'active' : ''}`}
              title={isCollapsed ? item.name : ''}
              onClick={() => setIsMobileOpen(false)} // Close mobile menu on click
            >
              <span className="nav-icon">{item.icon}</span>
              {!isCollapsed && <span className="nav-text">{item.name}</span>}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <Link href="/" className="back-home">
            <span className="nav-icon">←</span>
            {!isCollapsed && <span className="nav-text">Siteye Dön</span>}
          </Link>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div className="mobile-overlay" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* Main Content */}
      <main className={`admin-content ${isCollapsed ? 'expanded' : ''}`}>
        {children}
      </main>

      <style jsx>{`
        .admin-container {
          display: flex;
          min-height: 100vh;
          background: #0f172a;
          color: #fff;
          position: relative;
        }

        /* Mobile Header */
        .mobile-header {
            display: none;
            align-items: center;
            padding: 1rem;
            background: #1e293b;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 40;
            height: 60px;
        }

        .mobile-toggle {
            background: none;
            border: none;
            color: #fff;
            font-size: 1.5rem;
            cursor: pointer;
            margin-right: 1rem;
        }

        .mobile-title {
            font-weight: 700;
            font-size: 1.2rem;
        }

        /* Sidebar */
        .admin-sidebar {
          width: 260px;
          background: #1e293b;
          border-right: 1px solid rgba(255,255,255,0.1);
          display: flex;
          flex-direction: column;
          position: fixed;
          height: 100vh;
          transition: width 0.3s ease, transform 0.3s ease;
          z-index: 50;
        }

        .admin-sidebar.collapsed {
            width: 80px;
        }

        .sidebar-header {
          padding: 1.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 80px;
        }

        .sidebar-header h2 {
          font-size: 1.5rem;
          font-weight: 700;
          white-space: nowrap;
          overflow: hidden;
        }

        .accent {
          color: var(--primary);
        }

        .collapse-btn {
            background: rgba(255,255,255,0.05);
            border: none;
            color: #94a3b8;
            width: 30px;
            height: 30px;
            border-radius: 0.5rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            transition: all 0.2s;
        }

        .collapse-btn:hover {
            background: rgba(255,255,255,0.1);
            color: #fff;
        }
        
        .admin-sidebar.collapsed .collapse-btn {
            margin: 0 auto;
        }

        .sidebar-nav {
          padding: 2rem 1rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          overflow-x: hidden;
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
          white-space: nowrap;
        }

        .nav-item:hover {
          background: rgba(255,255,255,0.05);
          color: #fff;
        }

        .nav-item.active {
          background: var(--primary);
          color: #000;
        }
        
        .admin-sidebar.collapsed .nav-item {
            justify-content: center;
            padding: 1rem 0;
        }

        .nav-icon {
            font-size: 1.2rem;
            min-width: 24px;
            text-align: center;
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
          white-space: nowrap;
        }
        
        .admin-sidebar.collapsed .back-home {
            justify-content: center;
        }

        .back-home:hover {
          color: #fff;
        }

        /* Main Content */
        .admin-content {
          flex: 1;
          margin-left: 260px;
          padding: 2rem;
          background: #0f172a;
          transition: margin-left 0.3s ease;
          min-height: 100vh;
        }

        .admin-content.expanded {
            margin-left: 80px;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
            .mobile-header {
                display: flex;
            }

            .admin-sidebar {
                transform: translateX(-100%);
                width: 260px !important; /* Always full width on mobile when open */
            }

            .admin-sidebar.mobile-open {
                transform: translateX(0);
            }

            .collapse-btn {
                display: none; /* Hide collapse button on mobile */
            }

            .admin-content {
                margin-left: 0 !important;
                padding-top: 80px; /* Space for mobile header */
            }

            .mobile-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
                z-index: 45;
                backdrop-filter: blur(2px);
            }
        }
      `}</style>
    </div>
  );
}
