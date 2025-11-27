"use client";

import { useState } from 'react';
import Link from 'next/link';
import MatchSearchAutocomplete from '@/components/MatchSearchAutocomplete';
import PredictionTypeSelector from '@/components/PredictionTypeSelector';
import { formatMatchName } from '@/lib/fixtures';
import { useAuth } from '@/components/LayoutShell';
import { savePrediction } from '@/lib/storage';

export default function SurgeryPage() {
  const { user } = useAuth();
  const [selectedFixture, setSelectedFixture] = useState(null);
  const [selectedPrediction, setSelectedPrediction] = useState(null);

  // Coupon State
  const [coupon, setCoupon] = useState([]);
  const [couponData, setCouponData] = useState({
    confidence: 5,
    analysis: ''
  });

  const [showLoginPopup, setShowLoginPopup] = useState(false);

  const handleCouponChange = (e) => {
    setCouponData({ ...couponData, [e.target.name]: e.target.value });
  };

  const addToCoupon = (e) => {
    e.preventDefault();

    if (!selectedFixture || !selectedPrediction) {
      alert('Lütfen maç ve tahmin seçin');
      return;
    }

    const newItem = {
      id: Date.now(), // Temporary ID
      match: formatMatchName(selectedFixture),
      league: selectedFixture.league,
      pick: selectedPrediction.type,
      odds: selectedPrediction.odds
    };

    setCoupon([...coupon, newItem]);

    // Reset form
    setSelectedFixture(null);
    setSelectedPrediction(null);
  };

  const removeFromCoupon = (id) => {
    setCoupon(coupon.filter(item => item.id !== id));
  };

  const handleSubmitCoupon = async () => {
    // Try to get user from context or localStorage
    const currentUser = user || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user')) : null);

    if (!currentUser) {
      setShowLoginPopup(true);
      return;
    }

    if (coupon.length === 0) {
      alert('Reçeteniz boş!');
      return;
    }

    if (!couponData.analysis.trim()) {
      alert('Lütfen reçete için bir analiz yazın.');
      return;
    }

    // Check subscription
    try {
      const res = await fetch('/api/check-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId: currentUser.id })
      });
      const data = await res.json();

      if (!data.isSubscribed) {
        alert('Tahmin paylaşabilmek için @cerrahvip kanalına abone olmalısınız!');
        window.open('https://t.me/cerrahvip', '_blank');
        return;
      }

      const finalCoupon = {
        id: Date.now(),
        user: currentUser.username || currentUser.first_name || "misafir_cerrah",
        rank: 1, // Mock rank
        items: coupon.map(item => ({
          match: item.match,
          pick: item.pick,
          odds: item.odds,
          date: "Bugün" // Mock date
        })),
        totalOdds: totalOdds,
        confidence: parseInt(couponData.confidence),
        analysis: couponData.analysis,
        likes: 0,
        comments: 0,
        time: "Az önce",
        status: "PENDING"
      };

      savePrediction(finalCoupon);
      console.log('Coupon submitted:', finalCoupon);
      alert('Reçete başarıyla paylaşıldı ve akışa düştü!');

      // Reset form
      setCoupon([]);
      setCouponData({ confidence: 5, analysis: '' });

    } catch (err) {
      console.error('Submission check error:', err);
      alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  // Calculate totals
  const totalOdds = coupon.reduce((acc, item) => acc * item.odds, 1);
  const stake = 10; // Fixed stake
  const potentialReturn = totalOdds * stake;

  return (
    <div className="surgery-container">
      <div className="page-header">
        <h1>Ameliyathane 🔪</h1>
        <p className="subtitle">Hastayı masaya yatırın ve reçeteyi hazırlayın.</p>
      </div>

      <div className="surgery-layout">
        {/* Left Column: Match Selection */}
        <div className="surgery-card form-section">
          <h2 className="section-title">Analiz Masası</h2>
          <form className="surgery-form">
            {/* Match Search */}
            <div className="form-group">
              <label>Maç Seçimi</label>
              <MatchSearchAutocomplete
                onSelectMatch={setSelectedFixture}
                selectedMatch={selectedFixture}
              />
              {selectedFixture && (
                <div className="selected-match-info">
                  <span className="league-tag">{selectedFixture.league}</span>
                  <span className="match-tag">{formatMatchName(selectedFixture)}</span>
                </div>
              )}
            </div>

            {/* Prediction Type Selector */}
            <div className="form-group">
              <PredictionTypeSelector
                selectedFixture={selectedFixture}
                onSelectPrediction={setSelectedPrediction}
              />
            </div>

            <button
              type="button"
              onClick={addToCoupon}
              className="btn btn-secondary btn-lg btn-block"
              disabled={!selectedFixture || !selectedPrediction}
            >
              Reçeteye Ekle ➕
            </button>
          </form>
        </div>

        {/* Right Column: Coupon (Prescription) */}
        <div className="coupon-section">
          <div className="coupon-card">
            <div className="coupon-header">
              <h3>Reçete 📝</h3>
              <span className="item-count">{coupon.length} Maç</span>
            </div>

            <div className="coupon-items">
              {coupon.length === 0 ? (
                <div className="empty-coupon">
                  <p>Henüz maç eklenmedi.</p>
                </div>
              ) : (
                coupon.map((item) => (
                  <div key={item.id} className="coupon-item">
                    <button
                      className="remove-btn"
                      onClick={() => removeFromCoupon(item.id)}
                    >
                      ✕
                    </button>
                    <div className="item-header">
                      <span className="item-match">{item.match}</span>
                    </div>
                    <div className="item-details">
                      <span className="item-pick">{item.pick}</span>
                      <span className="item-odds">@{item.odds.toFixed(2)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Global Analysis & Confidence for Coupon */}
            {coupon.length > 0 && (
              <div className="coupon-analysis-section">
                <div className="form-group">
                  <label htmlFor="confidence" className="small-label">Güven Seviyesi</label>
                  <div className="range-container">
                    <input
                      type="range"
                      id="confidence"
                      name="confidence"
                      min="1"
                      max="10"
                      value={couponData.confidence}
                      onChange={handleCouponChange}
                      className="range-input"
                    />
                    <span className="range-value">{couponData.confidence}/10</span>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="analysis" className="small-label">Reçete Notları</label>
                  <textarea
                    id="analysis"
                    name="analysis"
                    value={couponData.analysis}
                    onChange={handleCouponChange}
                    placeholder="Bu reçete için genel analiziniz..."
                    rows="3"
                    className="coupon-textarea"
                  ></textarea>
                </div>
              </div>
            )}

            <div className="coupon-footer">
              <div className="coupon-summary">
                <div className="summary-row">
                  <span>Toplam Oran:</span>
                  <span className="value highlight">{coupon.length > 0 ? totalOdds.toFixed(2) : '0.00'}</span>
                </div>
                <div className="summary-row">
                  <span>Sabit Bahis:</span>
                  <span className="value">{stake} Birim</span>
                </div>
                <div className="summary-row total">
                  <span>Olası Kazanç:</span>
                  <span className="value win">{coupon.length > 0 ? potentialReturn.toFixed(2) : '0.00'} Puan</span>
                </div>
              </div>

              <button
                onClick={handleSubmitCoupon}
                className="btn btn-primary btn-lg btn-block submit-btn"
                disabled={coupon.length === 0}
              >
                Reçeteyi Onayla (Paylaş)
              </button>
            </div>
          </div>
        </div>
      </div>

      {showLoginPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <button className="close-btn" onClick={() => setShowLoginPopup(false)}>✕</button>
            <div className="lock-icon">🔒</div>
            <h2>Bu alanı kullanmak için giriş yapmalısınız</h2>
            <p>Tahmin yapmak ve paylaşmak için Telegram ile giriş yapın.</p>
            <Link href="/login" className="login-btn">
              Giriş Yap
            </Link>
          </div>
        </div>
      )}

      <style jsx>{`
        .surgery-container {
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          padding: 0 1rem;
        }

        .page-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .subtitle {
          color: #a3a3a3;
          margin-top: 0.5rem;
        }

        .surgery-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }

        @media (min-width: 1024px) {
          .surgery-layout {
            grid-template-columns: 2fr 1fr;
          }
        }

        .surgery-card {
          background: var(--surface);
          border: 1px solid var(--border);
          padding: 2rem;
          border-radius: 1rem;
        }

        .section-title {
          font-size: 1.25rem;
          margin-bottom: 1.5rem;
          color: #fff;
          border-bottom: 1px solid var(--border);
          padding-bottom: 1rem;
        }

        .surgery-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        label {
          font-weight: 500;
          color: #d4d4d4;
        }

        .small-label {
            font-size: 0.85rem;
            color: #94a3b8;
        }

        .selected-match-info {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.5rem;
          flex-wrap: wrap;
        }

        .league-tag,
        .match-tag {
          background: var(--surface-hover);
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-size: 0.9rem;
          border: 1px solid var(--border);
        }

        .league-tag {
          color: var(--accent);
          font-weight: 600;
        }

        .match-tag {
          color: var(--primary);
          font-weight: 600;
        }

        .range-container {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .range-input {
          flex: 1;
          accent-color: var(--primary);
        }

        .range-value {
          font-weight: 700;
          color: var(--primary);
          min-width: 3rem;
        }

        .btn-block {
          width: 100%;
          margin-top: 1rem;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Coupon Styles */
        .coupon-card {
          background: #1e293b;
          border: 1px solid var(--border);
          border-radius: 1rem;
          overflow: hidden;
          position: sticky;
          top: 2rem;
        }

        .coupon-header {
          background: rgba(0,0,0,0.2);
          padding: 1rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border);
        }

        .coupon-header h3 {
          margin: 0;
          font-size: 1.1rem;
        }

        .item-count {
          background: var(--primary);
          color: #000;
          padding: 0.2rem 0.6rem;
          border-radius: 1rem;
          font-size: 0.8rem;
          font-weight: 700;
        }

        .coupon-items {
          padding: 1rem;
          min-height: 100px;
          max-height: 400px;
          overflow-y: auto;
        }

        .empty-coupon {
          text-align: center;
          color: #64748b;
          padding: 2rem 0;
          font-style: italic;
        }

        .coupon-item {
          background: rgba(255,255,255,0.05);
          border-radius: 0.5rem;
          padding: 0.75rem;
          margin-bottom: 0.75rem;
          position: relative;
          border: 1px solid transparent;
          transition: border-color 0.2s;
        }

        .coupon-item:hover {
          border-color: rgba(255,255,255,0.1);
        }

        .remove-btn {
          position: absolute;
          top: 0.25rem;
          right: 0.25rem;
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          font-size: 1rem;
          padding: 0.25rem;
        }

        .remove-btn:hover {
          color: #ef4444;
        }

        .item-header {
          margin-bottom: 0.5rem;
          padding-right: 1.5rem;
        }

        .item-match {
          font-size: 0.9rem;
          font-weight: 600;
          color: #e2e8f0;
        }

        .item-details {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .item-pick {
          color: #94a3b8;
          font-size: 0.85rem;
        }

        .item-odds {
          color: var(--primary);
          font-weight: 700;
        }

        .coupon-analysis-section {
            padding: 1rem;
            background: rgba(0,0,0,0.1);
            border-top: 1px solid var(--border);
        }

        .coupon-textarea {
            background: rgba(255,255,255,0.05);
            border: 1px solid var(--border);
            padding: 0.75rem;
            border-radius: 0.5rem;
            color: var(--foreground);
            font-size: 0.9rem;
            width: 100%;
            resize: vertical;
            font-family: inherit;
        }

        .coupon-textarea:focus {
            outline: none;
            border-color: var(--primary);
        }

        .coupon-footer {
          background: rgba(0,0,0,0.2);
          padding: 1.5rem;
          border-top: 1px solid var(--border);
        }

        .coupon-summary {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          color: #94a3b8;
          font-size: 0.9rem;
        }

        .summary-row.total {
          margin-top: 0.5rem;
          padding-top: 0.5rem;
          border-top: 1px solid rgba(255,255,255,0.1);
          color: #fff;
          font-weight: 700;
          font-size: 1.1rem;
        }

        .value.highlight {
          color: var(--accent);
        }

        .value.win {
          color: var(--primary);
        }

        .submit-btn {
          margin-top: 0;
        }

        /* Popup Styles */
        .popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          backdrop-filter: blur(5px);
        }

        .popup-content {
          background: #0f172a;
          padding: 2rem;
          border-radius: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          text-align: center;
          max-width: 400px;
          width: 90%;
          position: relative;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        .close-btn {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: none;
          border: none;
          color: #94a3b8;
          font-size: 1.5rem;
          cursor: pointer;
        }

        .lock-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .popup-content h2 {
          font-size: 1.2rem;
          margin-bottom: 0.5rem;
          color: #fff;
        }

        .popup-content p {
          color: #94a3b8;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
        }

        .login-btn {
          background: var(--primary);
          color: #000;
          padding: 0.75rem 2rem;
          border-radius: 0.5rem;
          font-weight: 600;
          text-decoration: none;
          display: inline-block;
          transition: transform 0.2s;
        }

        .login-btn:hover {
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}
