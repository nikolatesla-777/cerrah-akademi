"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TelegramLogin from '@/components/TelegramLogin';
import { useAuth } from '@/components/LayoutShell';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState(null);

  const handleTelegramAuth = (user) => {
    console.log('Telegram User:', user);

    if (user) {
      // Use the login function from context to update global state immediately
      login(user);
    } else {
      setError('Giriş başarısız oldu.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Giriş Yap</h1>
        <p className="auth-subtitle">Telegram hesabınızla hızlıca bağlanın.</p>

        <div className="telegram-wrapper">
          {/* 
            IMPORTANT: The bot name is now loaded from environment variables.
            Make sure NEXT_PUBLIC_TELEGRAM_BOT_NAME is set in .env.local
          */}
          <TelegramLogin
            botName={process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME || "samplebot"}
            onAuth={handleTelegramAuth}
          />
        </div>

        {error && <p className="error-message">{error}</p>}

        <div className="info-box">
          <p>
            <strong>Not:</strong> Bu özellik şu an demo modundadır. Gerçek bir bot adı
            yapılandırılana kadar çalışmayabilir.
          </p>
        </div>
      </div>

      <style jsx>{`
        .auth-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: calc(100vh - 200px);
          padding: 2rem 1rem;
        }

        .auth-card {
          background: var(--surface);
          border: 1px solid var(--border);
          padding: 2.5rem;
          border-radius: 1rem;
          width: 100%;
          max-width: 400px;
          text-align: center;
        }

        .auth-title {
          font-size: 1.75rem;
          margin-bottom: 0.5rem;
        }

        .auth-subtitle {
          color: #a3a3a3;
          margin-bottom: 2rem;
        }

        .telegram-wrapper {
          display: flex;
          justify-content: center;
          margin-bottom: 2rem;
          min-height: 50px;
        }

        .error-message {
          color: var(--danger);
          margin-bottom: 1rem;
        }

        .info-box {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.2);
          padding: 1rem;
          border-radius: 0.5rem;
          font-size: 0.85rem;
          color: #93c5fd;
          text-align: left;
        }
      `}</style>
    </div>
  );
}
