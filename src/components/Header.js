"use client";

import Link from 'next/link';

export default function Header() {
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
          <Link href="/login" className="btn btn-primary btn-sm">Giriş Yap</Link>
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
        }
        
        .btn-sm {
          padding: 0.4rem 0.8rem;
          font-size: 0.8rem;
        }
      `}</style>
    </header>
  );
}
