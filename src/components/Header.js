"use client";

import Link from 'next/link';

export default function Header({ user, logout }) {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <Link href="/">
            <span className="logo-icon">🩺</span>
            <span className="logo-text">Cerrah Akademi</span>
          </Link>
        </div>

        <div className="user-actions">
          {user ? (
            <div className="user-profile">
              <span className="welcome-text">Hoşgeldin, <strong>{user.first_name}</strong></span>
              <button onClick={logout} className="btn btn-outline btn-sm">Çıkış</button>
            </div>
          ) : (
            <Link href="/login" className="btn btn-primary btn-sm">Giriş Yap</Link>
          )}
        </div>
      </div>

      <style jsx>{`
        .header {
          height: 64px;
          border-bottom: 1px solid var(--border);
          background: var(--surface);
          position: sticky;
          top: 0;
          z-index: 50;
        }
        
        .header-content {
          max-width: 1400px;
          margin: 0 auto;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.5rem;
        }
        
        .logo a {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 700;
          font-size: 1.25rem;
        }
        
        .logo-icon {
          font-size: 1.5rem;
        }
        
        .user-actions {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .welcome-text {
          font-size: 0.9rem;
          color: #a3a3a3;
        }

        .welcome-text strong {
          color: var(--foreground);
        }
        
        .btn-sm {
          padding: 0.4rem 0.8rem;
          font-size: 0.8rem;
        }

        .btn-outline {
          background: transparent;
          border: 1px solid var(--border);
          color: #a3a3a3;
        }

        .btn-outline:hover {
          border-color: var(--foreground);
          color: var(--foreground);
        }
      `}</style>
    </header>
  );
}
