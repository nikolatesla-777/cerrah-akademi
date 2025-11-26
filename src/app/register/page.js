"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TelegramLogin from '@/components/TelegramLogin';

export default function RegisterPage() {
    const router = useRouter();
    const [error, setError] = useState(null);

    const handleTelegramAuth = (user) => {
        console.log('Telegram User (Register):', user);
        // Here you would typically send this data to your backend to create a new user

        if (user) {
            // Store user info (in real app, use secure session/cookie)
            localStorage.setItem('user', JSON.stringify(user));
            router.push('/dashboard');
        } else {
            setError('Kayıt başarısız oldu.');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1 className="auth-title">Kayıt Ol</h1>
                <p className="auth-subtitle">Telegram ile saniyeler içinde hesabınızı oluşturun.</p>

                <div className="telegram-wrapper">
                    {/* 
            IMPORTANT: Replace 'samplebot' with your actual Telegram Bot Name 
            created via @BotFather. The domain must also be whitelisted in the bot settings.
          */}
                    <TelegramLogin botName="samplebot" onAuth={handleTelegramAuth} />
                </div>

                {error && <p className="error-message">{error}</p>}

                <div className="info-box">
                    <p>
                        <strong>Not:</strong> Kayıt olarak <Link href="/terms" className="link">Kullanım Koşulları</Link>'nı kabul etmiş olursunuz.
                    </p>
                </div>

                <div className="auth-footer">
                    <p>Zaten hesabınız var mı? <Link href="/login" className="link">Giriş Yap</Link></p>
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
          margin-bottom: 1.5rem;
        }

        .auth-footer {
          margin-top: 1rem;
          font-size: 0.9rem;
          color: #a3a3a3;
        }

        .link {
          color: var(--primary);
          text-decoration: none;
          font-weight: 500;
        }

        .link:hover {
          text-decoration: underline;
        }
      `}</style>
        </div>
    );
}
