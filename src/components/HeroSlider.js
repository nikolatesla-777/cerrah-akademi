"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      title: "Cerrah Akademi'ye Hoşgeldiniz",
      subtitle: "En iyi tipsterların buluşma noktası",
      cta: "Hemen Başla",
      link: "/login",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    },
    {
      id: 2,
      title: "Haftalık Ödüller Kazanın",
      subtitle: "Liderlik tablosunda yükselerek ödüller kazanın",
      cta: "Liderleri Görüntüle",
      link: "/leaderboard",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
    },
    {
      id: 3,
      title: "Profesyonel Analizler",
      subtitle: "İstatistik destekli, keskin tahminler yapın",
      cta: "Keşfet",
      link: "/feed",
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="hero-slider">
      <div className="slider-container">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`slide ${index === currentSlide ? 'active' : ''}`}
            style={{ background: slide.gradient }}
          >
            <div className="slide-content">
              <h2 className="slide-title">{slide.title}</h2>
              <p className="slide-subtitle">{slide.subtitle}</p>
              <Link href={slide.link} className="btn btn-primary btn-lg">
                {slide.cta}
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="slider-dots">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      <style jsx>{`
        .hero-slider {
          position: relative;
          width: 100%;
          height: 400px;
          overflow: hidden;
          border-radius: 1rem;
          margin-bottom: 3rem;
        }

        .slider-container {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .slide {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          transition: opacity 0.8s ease-in-out;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .slide.active {
          opacity: 1;
          z-index: 1;
        }

        .slide-content {
          text-align: center;
          color: white;
          z-index: 2;
          padding: 2rem;
        }

        .slide-title {
          font-size: 3rem;
          font-weight: 800;
          margin-bottom: 1rem;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }

        .slide-subtitle {
          font-size: 1.5rem;
          margin-bottom: 2rem;
          opacity: 0.95;
          text-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
        }

        .slider-dots {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 10px;
          z-index: 3;
        }

        .dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.5);
          border: none;
          cursor: pointer;
          transition: all 0.3s;
        }

        .dot.active {
          background: white;
          width: 30px;
          border-radius: 6px;
        }

        @media (max-width: 768px) {
          .hero-slider {
            height: 300px;
          }

          .slide-title {
            font-size: 2rem;
          }

          .slide-subtitle {
            font-size: 1.1rem;
          }
        }
      `}</style>
    </div>
  );
}
