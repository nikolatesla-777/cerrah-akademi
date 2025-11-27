"use client";

import { useState, useEffect } from 'react';
import { getPredictionTypes } from '@/lib/fixtures';

export default function PredictionTypeSelector({ selectedFixture, onSelectPrediction }) {
  const [selectedType, setSelectedType] = useState('');
  const [odds, setOdds] = useState(null);

  const predictionTypes = getPredictionTypes();

  useEffect(() => {
    // Reset when fixture changes
    setSelectedType('');
    setOdds(null);
  }, [selectedFixture]);

  const handleSelect = (type) => {
    setSelectedType(type);

    // Get odds for selected prediction type
    if (selectedFixture && selectedFixture.odds[type]) {
      const oddValue = selectedFixture.odds[type];
      setOdds(oddValue);
      onSelectPrediction({
        type,
        odds: oddValue
      });
    } else {
      setOdds(null);
      onSelectPrediction({ type, odds: null });
    }
  };

  return (
    <div className="prediction-selector">
      <label htmlFor="prediction-type">Tahmin Tipi</label>

      <div className="prediction-grid">
        {predictionTypes.map((type) => {
          const isAvailable = selectedFixture && selectedFixture.odds[type];
          const oddValue = isAvailable ? selectedFixture.odds[type] : null;

          return (
            <button
              type="button"
              key={type}
              className={`prediction-btn ${selectedType === type ? 'selected' : ''} ${!isAvailable ? 'disabled' : ''}`}
              onClick={() => isAvailable && handleSelect(type)}
              disabled={!isAvailable}
            >
              <span className="type-label">{type}</span>
              {oddValue && (
                <span className="type-odds">{oddValue.toFixed(2)}</span>
              )}
            </button>
          );
        })}
      </div>

      {!selectedFixture && (
        <p className="helper-text">Önce bir maç seçin</p>
      )}

      {selectedType && odds && (
        <div className="selected-info">
          <strong>Seçilen:</strong> {selectedType} @ {odds.toFixed(2)}
        </div>
      )}

      <style jsx>{`
        .prediction-selector {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        label {
          font-weight: 500;
          color: #d4d4d4;
        }

        .prediction-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 0.75rem;
        }

        .prediction-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0.75rem;
          background: var(--surface);
          border: 2px solid var(--border);
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
          color: var(--foreground);
        }

        .prediction-btn:hover:not(.disabled) {
          border-color: var(--primary);
          transform: translateY(-2px);
        }

        .prediction-btn.selected {
          border-color: var(--primary);
          background: rgba(34, 197, 94, 0.1);
        }

        .prediction-btn.disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .type-label {
          font-weight: 600;
          font-size: 0.9rem;
          margin-bottom: 0.25rem;
        }

        .type-odds {
          color: var(--accent);
          font-weight: 700;
          font-size: 1.1rem;
        }

        .helper-text {
          color: #888;
          font-size: 0.9rem;
          text-align: center;
          margin-top: 0.5rem;
        }

        .selected-info {
          background: var(--surface-hover);
          padding: 0.75rem;
          border-radius: 0.5rem;
          text-align: center;
          color: var(--primary);
        }
      `}</style>
    </div>
  );
}
