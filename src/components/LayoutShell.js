"use client";

import Header from "./Header";
import Sidebar from "./Sidebar";

export default function LayoutShell({ children }) {
    return (
        <>
            <Header />
            <div className="layout-wrapper">
                <Sidebar />
                <main className="main-content">
                    {children}
                </main>
            </div>

            <style jsx global>{`
        .layout-wrapper {
          display: flex;
          min-height: calc(100vh - 64px);
        }
        
        .main-content {
          flex: 1;
          padding: 2rem;
          max-width: 100%;
        }
      `}</style>
        </>
    );
}
