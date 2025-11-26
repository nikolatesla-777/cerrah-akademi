"use client";

import Link from 'next/link';

export default function Sidebar() {
    const navItems = [
        { label: 'Panel', href: '/dashboard', icon: '📊' },
        { label: 'Ameliyathane', href: '/surgery', icon: '🔪' },
        { label: 'Akış', href: '/feed', icon: '📱' },
        { label: 'Liderlik', href: '/leaderboard', icon: '🏆' },
    ];

    return (
        <aside className="sidebar">
            <nav className="nav">
                <ul>
                    {navItems.map((item) => (
                        <li key={item.href}>
                            <Link href={item.href} className="nav-link">
                                <span className="nav-icon">{item.icon}</span>
                                <span className="nav-label">{item.label}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            <style jsx>{`
        .sidebar {
          width: 240px;
          height: calc(100vh - 64px);
          position: sticky;
          top: 64px;
          border-right: 1px solid var(--border);
          background: var(--background);
          padding: 1.5rem 1rem;
          display: none; /* Hidden on mobile by default */
        }

        @media (min-width: 768px) {
          .sidebar {
            display: block;
          }
        }

        .nav ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          color: #a3a3a3;
          transition: all 0.2s;
        }

        .nav-link:hover {
          background: var(--surface-hover);
          color: var(--foreground);
        }

        .nav-icon {
          font-size: 1.25rem;
        }
      `}</style>
        </aside>
    );
}
