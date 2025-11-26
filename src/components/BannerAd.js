"use client";

export default function BannerAd() {
    return (
        <div className="banner-ad">
            <div className="banner-content">
                <span className="banner-icon">🎁</span>
                <p className="banner-text">
                    <strong>Yeni Üyelere Özel:</strong> İlk 100 tahmin için %20 kazanç bonusu!
                </p>
                <button className="banner-cta">Detaylar</button>
            </div>

            <style jsx>{`
        .banner-ad {
          width: 100%;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          padding: 1rem 1.5rem;
          margin-bottom: 2rem;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .banner-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .banner-icon {
          font-size: 1.5rem;
        }

        .banner-text {
          color: white;
          margin: 0;
          font-size: 1rem;
        }

        .banner-text strong {
          font-weight: 700;
        }

        .banner-cta {
          background: white;
          color: #667eea;
          border: none;
          padding: 0.5rem 1.5rem;
          border-radius: 2rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .banner-cta:hover {
          transform: scale(1.05);
        }

        @media (max-width: 768px) {
          .banner-ad {
            padding: 0.75rem 1rem;
          }

          .banner-text {
            font-size: 0.9rem;
          }
        }
      `}</style>
        </div>
    );
}
