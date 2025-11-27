"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TelegramLogin from '@/components/TelegramLogin';
import { useAuth } from '@/components/LayoutShell';

export default function LoginPage() {
  const router = useRouter();
  const { login, user, loading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // States: 'idle', 'processing', 'error'
  const [status, setStatus] = useState('idle');
  const [loadingStep, setLoadingStep] = useState(''); // 'Telegram doğrulanıyor...', 'Abonelik kontrol ediliyor...'
  const [errorType, setErrorType] = useState(null); // 'subscription', 'generic'
  const [telegramUser, setTelegramUser] = useState(null); // Store user for retry

  const handleTelegramAuth = async (user) => {
    console.log('Telegram User:', user);

    if (!user) {
      setStatus('error');
      setErrorType('generic');
      return;
    }

    // Store user for retry mechanism
    setTelegramUser(user);

    setStatus('processing');
    setLoadingStep('Telegram kimliği doğrulanıyor...');

    try {
      // Simulate a short delay for better UX (so the user sees the step)
      await new Promise(r => setTimeout(r, 800));

      setLoadingStep('Kanal aboneliği kontrol ediliyor...');

      // 1. Check subscription status
      const res = await fetch('/api/check-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId: user.id })
      });

      const data = await res.json();

      if (data.isSubscribed) {
        setLoadingStep('Giriş yapılıyor...');
        await new Promise(r => setTimeout(r, 500)); // Smooth transition
        login(user);
      } else {
        setStatus('error');
        setErrorType('subscription');
      }
    } catch (err) {
      console.error('Login error:', err);
      setStatus('error');
      setErrorType('generic');
    }
  };

  const handleRetry = () => {
    if (telegramUser) {
      handleTelegramAuth(telegramUser);
    } else {
      // Fallback if user is lost (shouldn't happen), reset to idle
      setStatus('idle');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Giriş Yap</h1>
        <p className="auth-subtitle">Telegram hesabınızla hızlıca bağlanın.</p>

        {/* Login Widget */}
        <div className={`telegram-wrapper ${status === 'processing' ? 'opacity-50 pointer-events-none' : ''}`}>
          <TelegramLogin
            botName={process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME || "samplebot"}
            onAuth={handleTelegramAuth}
          />
        </div>

        {/* Error State: Subscription Required */}
        {status === 'error' && errorType === 'subscription' && (
          <div className="subscription-error-card">
            <div className="error-icon">🔒</div>
            <h3>Erişim Reddedildi</h3>
            <p>Giriş yapabilmek için resmi kanalımıza abone olmanız gerekmektedir.</p>
            <a href="https://t.me/cerrahvip" target="_blank" className="join-channel-btn">
              <span>📢</span> @cerrahvip Kanalına Katıl
            </a>
            <button onClick={handleRetry} className="retry-btn">
              Abone Oldum, Tekrar Dene
            </button>
          </div>
        )}

        {/* Error State: Generic */}
        {status === 'error' && errorType === 'generic' && (
          <div className="error-message">
            <p>Bir hata oluştu. Lütfen tekrar deneyin.</p>
            <button onClick={() => setStatus('idle')} className="text-sm underline mt-2">
              Tekrar Dene
            </button>
          </div>
        )}

        <div className="info-box">
          <p>
            <strong>Not:</strong> Bu özellik şu an demo modundadır. Gerçek bir bot adı
            yapılandırılana kadar çalışmayabilir.
          </p>
        </div>
      </div>

      {/* Loading Popup Overlay */}
      {status === 'processing' && (
        <div className="loading-overlay">
          <div className="loading-card">
            <div className="spinner"></div>
            <p className="loading-text">{loadingStep}</p>
          </div>
        </div>
      )}

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
          position: relative;
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
          transition: opacity 0.3s;
        }

        .error-message {
          color: var(--danger);
          margin-bottom: 1rem;
          background: rgba(239, 68, 68, 0.1);
          padding: 0.75rem;
          border-radius: 0.5rem;
        }

        /* Subscription Error Card */
        .subscription-error-card {
          background: rgba(239, 68, 68, 0.05);
          border: 1px solid rgba(239, 68, 68, 0.2);
          padding: 1.5rem;
          border-radius: 0.75rem;
          margin-bottom: 2rem;
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .error-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .subscription-error-card h3 {
          color: var(--danger);
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
        }

        .subscription-error-card p {
          color: #d1d5db;
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        .join-channel-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: #0088cc; /* Telegram Blue */
          color: white;
          padding: 0.75rem;
          border-radius: 0.5rem;
          text-decoration: none;
          font-weight: 600;
          margin-bottom: 0.75rem;
          transition: transform 0.2s;
        }

        .join-channel-btn:hover {
          transform: translateY(-2px);
          background: #0099e6;
        }

        .retry-btn {
          background: transparent;
          border: 1px solid var(--border);
          color: #a3a3a3;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 0.85rem;
          width: 100%;
          transition: all 0.2s;
        }

        .retry-btn:hover {
          border-color: var(--foreground);
          color: var(--foreground);
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

        /* Loading Overlay */
        .loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(4px);
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 1rem;
          z-index: 10;
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .loading-card {
          text-align: center;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255,255,255,0.1);
          border-radius: 50%;
          border-top-color: var(--primary);
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .loading-text {
          color: #fff;
          font-weight: 500;
          font-size: 0.95rem;
        }
      `}</style>
    </div>
  );
}
