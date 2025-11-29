"use client";

import { useState, useEffect } from 'react';
import { getPredictionTypes } from '@/lib/fixtures';

export default function PredictionTypeSelector({ selectedFixture, onSelectPrediction }) {
  const [selectedType, setSelectedType] = useState('');
  const [activeCategory, setActiveCategory] = useState('MAIN'); // MAIN, GOALS, OTHER

  useEffect(() => {
    setSelectedType('');
  }, [selectedFixture]);

  const handleSelect = (type, value) => {
    setSelectedType(type);
    onSelectPrediction({
      type,
      odds: value
    });
  };

  if (!selectedFixture) {
    return <p className="helper-text">Önce bir maç seçin</p>;
  }

  const odds = selectedFixture.odds || {};

  // Group odds by category
  const categories = {
    MAIN: ['MS 1', 'MS X', 'MS 2', '1X', '12', 'X2'],
    GOALS: ['2.5 Üst', '2.5 Alt', 'KG Var', 'KG Yok'],
  };

  const renderButtons = (categoryKeys) => {
    return categoryKeys.map(key => {
      const val = odds[key];
      return (
        <button
          type="button"
          key={key}
          className={`prediction-btn ${selectedType === key ? 'selected' : ''} ${!val ? 'disabled' : ''}`}
          onClick={() => val && handleSelect(key, val)}
          disabled={!val}
        >
          <span className="type-label">{key}</span>
          <span className="type-odds">{val ? parseFloat(val).toFixed(2) : '-'}</span>
        </button>
      );
    });
  };

  return (
    <div className="prediction-selector">
      <div className="category-tabs">
        <button
          type="button"
          className={`tab-btn ${activeCategory === 'MAIN' ? 'active' : ''}`}
          onClick={() => setActiveCategory('MAIN')}
        >
          Maç Sonucu
        </button>
        <button
          type="button"
          className={`tab-btn ${activeCategory === 'GOALS' ? 'active' : ''}`}
          onClick={() => setActiveCategory('GOALS')}
        >
          Gol / KG
        </button>
      </div>

      <div className="prediction-grid">
        {activeCategory === 'MAIN' && renderButtons(categories.MAIN)}
        {activeCategory === 'GOALS' && renderButtons(categories.GOALS)}
      </div>

      {selectedType && (
        <div className="selected-info">
          <strong>Seçilen:</strong> {selectedType} @ {odds[selectedType]?.toFixed(2)}
        </div>
      )}

      <style jsx>{`
        .prediction-selector {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .category-tabs {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 0.5rem;
            border-bottom: 1px solid var(--border);
            padding-bottom: 0.5rem;
        }

        .tab-btn {
            background: none;
            border: none;
            color: #888;
            padding: 0.5rem 1rem;
            cursor: pointer;
            font-weight: 600;
            transition: color 0.2s;
        }

        .tab-btn.active {
            color: var(--primary);
            border-bottom: 2px solid var(--primary);
        }

        .prediction-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 0.75rem;
        }

        .prediction-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0.75rem;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
          color: var(--foreground);
        }

        .prediction-btn:hover:not(.disabled) {
          border-color: var(--primary);
          background: var(--surface-hover);
        }

        .prediction-btn.selected {
          border-color: var(--primary);
          background: rgba(34, 197, 94, 0.1);
          box-shadow: 0 0 0 1px var(--primary);
        }

        .prediction-btn.disabled {
          opacity: 0.4;
          cursor: not-allowed;
          background: rgba(0,0,0,0.2);
        }

        .type-label {
          font-weight: 600;
          font-size: 0.85rem;
          margin-bottom: 0.25rem;
        }

        .type-odds {
          color: var(--accent);
          font-weight: 700;
          font-size: 1rem;
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
          margin-top: 0.5rem;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
