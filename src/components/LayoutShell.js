"use client";

import { useState, useEffect, createContext, useContext } from 'react';
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useRouter, usePathname } from 'next/navigation';
import { syncUser } from '@/lib/storage';

// ... inside LayoutShell component
useEffect(() => {
  const checkUser = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (!parsedUser.role) {
        parsedUser.role = 'Çaylak';
        // Auto-assign Admin role to specific users
        const adminUsernames = ['maxxiim777', 'kerafibey']; // Add authorized usernames here
        if (adminUsernames.includes(parsedUser.username) || parsedUser.first_name === 'Admin') {
          parsedUser.role = 'Admin';
        }
      }
      setUser(parsedUser);
      // Sync to Supabase
      syncUser(parsedUser);
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  checkUser();

  window.addEventListener('storage', checkUser);
  // Custom event for same-tab login/logout updates if needed
  window.addEventListener('auth-change', checkUser);

  return () => {
    window.removeEventListener('storage', checkUser);
    window.removeEventListener('auth-change', checkUser);
  };
}, []);

const login = (userData) => {
  // Assign default role on login
  let role = 'Çaylak';
  const adminUsernames = ['maxxiim777', 'kerafibey'];
  if (adminUsernames.includes(userData.username) || userData.first_name === 'Admin') {
    role = 'Admin';
  }

  const userWithRole = { ...userData, username: userData.username || 'kerafibey', role };
  localStorage.setItem('user', JSON.stringify(userWithRole));
  setUser(userWithRole);
  window.dispatchEvent(new Event('auth-change'));
  router.push('/dashboard');
};

const logout = () => {
  localStorage.removeItem('user');
  setUser(null);
  window.dispatchEvent(new Event('auth-change'));
  router.push('/login');
};

return (
  <AuthContext.Provider value={{ user, login, logout, loading }}>
    {/* Mobile Header */}
    <div className="mobile-header">
      <button
        className="mobile-toggle"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        ☰
      </button>
      <span className="mobile-title">Cerrah<span className="accent">Akademi</span></span>
    </div>

    {/* Desktop Header (Hidden on mobile) */}
    <div className="desktop-header-wrapper">
      <Header user={user} logout={logout} />
    </div>

    <div className="layout-wrapper">
      <Sidebar
        isCollapsed={isCollapsed}
        toggleCollapse={() => setIsCollapsed(!isCollapsed)}
        isMobileOpen={isMobileOpen}
        closeMobileMenu={() => setIsMobileOpen(false)}
        user={user}
      />

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div className="mobile-overlay" onClick={() => setIsMobileOpen(false)} />
      )}

      <main className={`main-content ${isCollapsed ? 'expanded' : ''}`}>
        {children}
      </main>
    </div>

    <style jsx global>{`
        .layout-wrapper {
          display: flex;
          min-height: calc(100vh - 64px);
          position: relative;
        }
        
        .main-content {
          flex: 1;
          padding: 2rem;
          max-width: 100%;
          margin-left: 260px; /* Sidebar width */
          transition: margin-left 0.3s ease;
        }

        .main-content.expanded {
            margin-left: 80px; /* Collapsed sidebar width */
        }

        /* Mobile Header */
        .mobile-header {
            display: none;
            align-items: center;
            padding: 1rem;
            background: #0f172a;
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
            color: #fff;
        }

        .accent {
            color: var(--primary);
        }

        .desktop-header-wrapper {
            display: block;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
            .mobile-header {
                display: flex;
            }

            .desktop-header-wrapper {
                display: none; /* Hide standard header on mobile if desired, or adjust */
            }

            .layout-wrapper {
                margin-top: 60px; /* Space for mobile header */
            }

            .main-content {
                margin-left: 0 !important;
                padding: 1rem;
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
  </AuthContext.Provider>
);
}
