"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar({ isCollapsed, toggleCollapse, isMobileOpen, closeMobileMenu }) {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Panel', path: '/dashboard', icon: '📊' },
    { name: 'Ameliyathane', path: '/surgery', icon: '🔪' },
    { name: 'Akış', path: '/feed', icon: '📱' },
    // { name: 'Bülten', path: '/bulletin', icon: '📅' }, // Removed per user request
    { name: 'Liderlik', path: '/leaderboard', icon: '🏆' },
    { name: 'İçerik Yönetimi', path: '/admin/content', icon: '📝' },
    { name: 'Kullanıcılar', path: '/admin/users', icon: '👥' },
  ];

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <button
          className="collapse-btn"
          onClick={toggleCollapse}
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
            onClick={closeMobileMenu}
            title={isCollapsed ? item.name : ''}
          >
            <span className="nav-icon">{item.icon}</span>
            {!isCollapsed && <span className="nav-text">{item.name}</span>}
          </Link>
        ))}
      </nav>

      <style jsx>{`
        .sidebar {
          width: 260px;
          background: #1e293b;
          border-right: 1px solid rgba(255,255,255,0.1);
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 64px; /* Below header */
          bottom: 0;
          left: 0;
          transition: width 0.3s ease, transform 0.3s ease;
          z-index: 50;
        }

        .sidebar.collapsed {
            width: 80px;
        }

        .sidebar-header {
            padding: 1rem;
            display: flex;
            justify-content: flex-end;
        }
        
        .sidebar.collapsed .sidebar-header {
            justify-content: center;
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

        .sidebar-nav {
          padding: 1rem;
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
        
        .sidebar.collapsed .nav-item {
            justify-content: center;
            padding: 1rem 0;
        }

        .nav-icon {
            font-size: 1.2rem;
            min-width: 24px;
            text-align: center;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
            .sidebar {
                top: 0; /* Full height on mobile */
                transform: translateX(-100%);
                width: 260px !important;
                border-right: none;
            }

            .sidebar.mobile-open {
                transform: translateX(0);
            }

            .collapse-btn {
                display: none;
            }
            
            .sidebar-header {
                display: none;
            }
            
            .sidebar-nav {
                padding-top: 80px; /* Space for mobile header */
            }
        }
      `}</style>
    </aside>
  );
}
