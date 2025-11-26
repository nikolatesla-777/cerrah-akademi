"use client";

import Link from 'next/link';
import HeroSlider from '@/components/HeroSlider';
import BannerAd from '@/components/BannerAd';
import WinningPredictionsSlider from '@/components/WinningPredictionsSlider';

export default function Home() {
  return (
    <div className="landing-page">
      {/* Hero Slider */}
      <HeroSlider />

      {/* Banner Ad */}
      <BannerAd />

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Spor Analizlerinin <span className="highlight">Cerrahı</span> Olun
          </h1>
          <p className="hero-subtitle">
            Kendi analizlerinizi paylaşın, diğer cerrahlarla yarışın ve ödüller kazanın.
            Gerçek tahmincilerin buluşma noktası.
          </p>
          <div className="hero-actions">
            <Link href="/login" className="btn btn-primary btn-lg">
              Telegram ile Giriş Yap
            </Link>
            <Link href="/leaderboard" className="btn btn-outline btn-lg">
              Liderleri Gör
            </Link>
          </div>
        </div>
        <div className="hero-stats">
          <div className="stat-card">
            <span className="stat-value">500+</span>
            <span className="stat-label">Aktif Cerrah</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">%85</span>
            <span className="stat-label">Başarı Oranı</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">₺10K+</span>
            <span className="stat-label">Dağıtılan Ödül</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2 className="section-title">Neden Cerrah Akademi?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Keskin Analizler</h3>
            <p>Detaylı istatistiklerle desteklenen nokta atışı tahminler yapın.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏆</div>
            <h3>Rekabet ve Ödül</h3>
            <p>Liderlik tablosunda yükselin, haftalık ve aylık ödülleri kapın.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤝</div>
            <h3>Sosyal Platform</h3>
            <p>Diğer cerrahları takip edin, yorum yapın ve toplulukla etkileşime geçin.</p>
          </div>
        </div>
      </section>

      {/* Winning Predictions Section */}
      <WinningPredictionsSlider />

      <style jsx>{`
        .landing-page {
          padding-bottom: 4rem;
        }

        /* Hero Styles */
        .hero {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 4rem 1rem;
          gap: 3rem;
        }

        .hero-title {
          font-size: 2.5rem;
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 1.5rem;
        }

        .highlight {
          color: var(--primary);
          background: linear-gradient(120deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0) 100%);
          padding: 0 0.5rem;
          border-radius: 0.5rem;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: #a3a3a3;
          max-width: 600px;
          margin: 0 auto 2rem;
        }

        .hero-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        .btn-lg {
          padding: 0.75rem 2rem;
          font-size: 1.1rem;
        }

        .hero-stats {
          display: flex;
          gap: 2rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .stat-card {
          background: var(--surface);
          border: 1px solid var(--border);
          padding: 1.5rem;
          border-radius: 1rem;
          min-width: 160px;
          text-align: center;
        }

        .stat-value {
          display: block;
          font-size: 2rem;
          font-weight: 700;
          color: var(--primary);
          margin-bottom: 0.5rem;
        }

        .stat-label {
          color: #888;
          font-size: 0.9rem;
        }

        /* Features Styles */
        .features {
          padding: 4rem 1rem;
        }

        .section-title {
          text-align: center;
          font-size: 2rem;
          margin-bottom: 3rem;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .feature-card {
          background: var(--surface);
          border: 1px solid var(--border);
          padding: 2rem;
          border-radius: 1rem;
          transition: transform 0.2s;
        }

        .feature-card:hover {
          transform: translateY(-5px);
          border-color: var(--primary);
        }

        .feature-icon {
          font-size: 3rem;
          margin-bottom: 1.5rem;
        }

        .feature-card h3 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
        }

        .feature-card p {
          color: #a3a3a3;
          line-height: 1.6;
        }

        @media (min-width: 768px) {
          .hero {
            padding: 6rem 1rem;
          }
          
          .hero-title {
            font-size: 4rem;
          }
        }
      `}</style>
    </div>
  );
}
