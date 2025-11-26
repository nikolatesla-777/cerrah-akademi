"use client";

import { useState } from 'react';
import Link from 'next/link';
import MatchSearchAutocomplete from '@/components/MatchSearchAutocomplete';
import PredictionTypeSelector from '@/components/PredictionTypeSelector';
import { formatMatchName } from '@/lib/fixtures';
import { useAuth } from '@/components/LayoutShell';

export default function SurgeryPage() {
  const { user } = useAuth();
  const [selectedFixture, setSelectedFixture] = useState(null);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [formData, setFormData] = useState({
    confidence: 5,
    analysis: ''
  });
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!user) {
      setShowLoginPopup(true);
      return;
    }

    if (!selectedFixture || !selectedPrediction) {
      alert('Lütfen maç ve tahmin seçin');
      return;
    }

    const surgeryData = {
      match: formatMatchName(selectedFixture),
      league: selectedFixture.league,
      pick: selectedPrediction.type,
      odds: selectedPrediction.odds,
      confidence: formData.confidence,
      analysis: formData.analysis
    };

    console.log('Surgery started:', surgeryData);
    alert('Ameliyat başarılı! (Demo mode - gerçekte backend\'e kaydedilecek)');

    // Reset form
    setSelectedFixture(null);
    setSelectedPrediction(null);
    setFormData({ confidence: 5, analysis: '' });
  };

  return (
    <div className="surgery-container">
      <div className="page-header">
        <h1>Ameliyathane 🔪</h1>
        <p className="subtitle">Hastayı masaya yatırın ve analizinizi yapın.</p>
      </div>

      <div className="surgery-card">
        <form onSubmit={handleSubmit} className="surgery-form">
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

          {/* Confidence Level */}
          <div className="form-group">
            <label htmlFor="confidence">Güven Seviyesi (1-10)</label>
            <div className="range-container">
              <input
                type="range"
                id="confidence"
                name="confidence"
                min="1"
                max="10"
                value={formData.confidence}
                onChange={handleChange}
                className="range-input"
              />
              <span className="range-value">{formData.confidence}/10</span>
            </div>
          </div>

          {/* Analysis Notes */}
          <div className="form-group">
            <label htmlFor="analysis">Analiz Notları</label>
            <textarea
              id="analysis"
              name="analysis"
              value={formData.analysis}
              onChange={handleChange}
              placeholder="Neden bu tahmini seçtiniz? İstatistikler, sakatlıklar..."
              rows="5"
              required
            ></textarea>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg btn-block"
            disabled={!selectedFixture || !selectedPrediction}
          >
            Ameliyatı Başlat (Paylaş)
          </button>
        </form>
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
          max-width: 800px;
          margin: 0 auto;
          position: relative;
        }

        .page-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .subtitle {
          color: #a3a3a3;
          margin-top: 0.5rem;
        }

        .surgery-card {
          background: var(--surface);
          border: 1px solid var(--border);
          padding: 2rem;
          border-radius: 1rem;
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

        textarea {
          background: var(--background);
          border: 1px solid var(--border);
          padding: 0.75rem;
          border-radius: 0.5rem;
          color: var(--foreground);
          font-size: 1rem;
          transition: border-color 0.2s;
          font-family: inherit;
          resize: vertical;
        }

        textarea:focus {
          outline: none;
          border-color: var(--primary);
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
