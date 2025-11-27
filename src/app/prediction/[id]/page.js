"use client";

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { getPredictions, updatePrediction } from '@/lib/storage';
import { useAuth } from '@/components/LayoutShell';

export default function PredictionDetailPage({ params }) {
  const { id } = use(params);
  const { user } = useAuth();
  const [prediction, setPrediction] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPrediction = () => {
      const allPredictions = getPredictions();
      // Try to find in local storage first
      const found = allPredictions.find(p => p.id === parseInt(id));

      if (found) {
        setPrediction(found);
      } else {
        // Fallback to mock data if not found in local (for demo purposes if needed, or just handle not found)
        // For now, let's just set loading false and handle "not found" in UI
      }
      setLoading(false);
    };

    loadPrediction();

    // Listen for updates
    window.addEventListener('prediction-updated', loadPrediction);
    return () => window.removeEventListener('prediction-updated', loadPrediction);
  }, [id]);

  const handleCommentSubmit = () => {
    if (!user) {
      alert('Yorum yapmak için giriş yapmalısınız.');
      return;
    }

    if (!commentText.trim()) return;

    const newComment = {
      id: Date.now(),
      user: user.username || user.first_name,
      text: commentText,
      time: "Az önce"
    };

    const updatedPrediction = {
      ...prediction,
      comments: [...(prediction.comments || []), newComment]
    };

    updatePrediction(updatedPrediction);
    setPrediction(updatedPrediction);
    setCommentText('');
  };

  if (loading) return <div className="p-8 text-center">Yükleniyor...</div>;
  if (!prediction) return <div className="p-8 text-center">Reçete bulunamadı.</div>;

  return (
    <div className="prediction-detail">
      <div className="detail-header">
        <Link href="/feed" className="back-btn">← Akışa Dön</Link>
        <span className={`status-badge ${prediction.status}`}>
          {prediction.status === 'PENDING' && 'Bekliyor'}
          {prediction.status === 'WON' && 'Kazandı'}
          {prediction.status === 'LOST' && 'Kaybetti'}
        </span>
      </div>

      <div className="match-card card">
        {/* Render items if it's a coupon with multiple items */}
        {prediction.items && prediction.items.length > 0 ? (
          <div className="coupon-items-list">
            {prediction.items.map((item, idx) => (
              <div key={idx} className="coupon-list-item">
                <div className="match-info">
                  <span className="match-date">{item.date}</span>
                  <span className="match-name">{item.match}</span>
                </div>
                <div className="pick-info">
                  <span className="badge pick">{item.pick}</span>
                  <span className="badge odds">{item.odds.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Fallback for single match structure if any
          <div className="match-header">
            <h1>{prediction.match}</h1>
            <span className="league-badge">{prediction.league}</span>
            <div className="prediction-info">
              <div className="info-item">
                <span className="label">Tahmin</span>
                <span className="value pick">{prediction.pick}</span>
              </div>
              <div className="info-item">
                <span className="label">Oran</span>
                <span className="value odds">@{prediction.odds?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        <div className="prediction-info-footer" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
          <div className="info-item">
            <span className="label">Toplam Oran</span>
            <span className="value odds">@{prediction.totalOdds?.toFixed(2)}</span>
          </div>
          <div className="info-item">
            <span className="label">Güven</span>
            <span className="value confidence">{prediction.confidence}/10</span>
          </div>
        </div>

        <div className="confidence-bar">
          <div className="progress-bg">
            <div
              className="progress-fill"
              style={{ width: `${prediction.confidence * 10}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="analysis-card card">
        <h2>Analiz</h2>
        <p className="analysis-text">{prediction.analysis}</p>
      </div>

      <div className="author-card card">
        <div className="author-info">
          <Link href={`/profile/${prediction.username}`}>
            <div className="avatar">
              {prediction.displayName ? prediction.displayName[0].toUpperCase() : (prediction.username ? prediction.username[0].toUpperCase() : '?')}
            </div>
          </Link>
          <div className="author-details">
            <Link href={`/profile/${prediction.username}`} className="username-link">
              <span className="username">{prediction.displayName || prediction.username}</span>
            </Link>
            <span className="rank">@{prediction.username}</span>
          </div>
        </div>
        {/* <button className="btn btn-primary">Takip Et</button> */}
      </div>

      <div className="interactions-card card">
        <div className="interactions">
          <button
            className={`interaction-btn ${prediction.isLiked ? 'liked' : ''}`}
            onClick={() => {
              const updated = {
                ...prediction,
                likes: prediction.isLiked ? prediction.likes - 1 : prediction.likes + 1,
                isLiked: !prediction.isLiked
              };
              updatePrediction(updated);
              setPrediction(updated);
            }}
          >
            <span>{prediction.isLiked ? '❤️' : '🤍'}</span> {prediction.likes} Beğeni
          </button>
          <span className="interaction-btn">
            💬 {prediction.comments ? prediction.comments.length : 0} Yorum
          </span>
        </div>
      </div>

      <div className="comments-card card">
        <h2>Yorumlar ({prediction.comments ? prediction.comments.length : 0})</h2>
        <div className="comments-list">
          {prediction.comments && prediction.comments.map((comment) => (
            <div key={comment.id} className="comment">
              <div className="comment-header">
                <span className="comment-user">@{comment.user}</span>
                <span className="comment-time">{comment.time}</span>
              </div>
              <p className="comment-text">{comment.text}</p>
            </div>
          ))}
          {(!prediction.comments || prediction.comments.length === 0) && (
            <p style={{ color: '#888', fontStyle: 'italic' }}>Henüz yorum yapılmamış. İlk yorumu sen yap!</p>
          )}
        </div>

        <div className="comment-form">
          {user ? (
            <>
              <textarea
                placeholder="Yorumunuzu yazın..."
                rows="3"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <button
                className="btn btn-primary"
                onClick={handleCommentSubmit}
                disabled={!commentText.trim()}
              >
                Yorum Yap
              </button>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem' }}>
              <p style={{ marginBottom: '1rem', color: '#ccc' }}>Yorum yapmak için giriş yapmalısınız.</p>
              <Link href="/login" className="btn btn-primary">Giriş Yap</Link>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .prediction-detail {
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .detail-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .back-btn {
          color: var(--primary);
          font-weight: 500;
          transition: opacity 0.2s;
        }

        .back-btn:hover {
          opacity: 0.8;
        }

        .status-badge {
          padding: 0.5rem 1rem;
          border-radius: 2rem;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .status-badge.PENDING {
          background: rgba(245, 158, 11, 0.1);
          color: var(--accent);
          border: 1px solid rgba(245, 158, 11, 0.2);
        }

        .status-badge.WON {
          background: rgba(34, 197, 94, 0.1);
          color: var(--primary);
          border: 1px solid rgba(34, 197, 94, 0.2);
        }

        .status-badge.LOST {
          background: rgba(239, 68, 68, 0.1);
          color: var(--danger);
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .match-card {
          padding: 2rem;
        }

        .coupon-items-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            margin-bottom: 1rem;
        }

        .coupon-list-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 1rem;
            border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .coupon-list-item:last-child {
            border-bottom: none;
        }

        .match-info {
            display: flex;
            flex-direction: column;
        }

        .match-date {
            font-size: 0.8rem;
            color: var(--primary);
            font-family: monospace;
        }

        .match-name {
            font-weight: 500;
            font-size: 1rem;
        }

        .pick-info {
            display: flex;
            gap: 0.5rem;
        }

        .badge {
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
            font-size: 0.9rem;
            font-weight: 600;
        }

        .badge.pick { background: var(--surface-hover); color: var(--foreground); }
        .badge.odds { background: rgba(245, 158, 11, 0.1); color: var(--accent); }


        .prediction-info-footer .info-item {
          text-align: center;
        }

        .prediction-info-footer .label {
          display: block;
          color: #888;
          font-size: 0.9rem;
          margin-bottom: 0.2rem;
        }

        .prediction-info-footer .value {
          display: block;
          font-size: 1.2rem;
          font-weight: 700;
        }

        .value.odds {
          color: var(--accent);
        }

        .value.confidence {
          color: var(--primary);
        }

        .confidence-bar {
          margin-top: 1rem;
        }

        .progress-bg {
          height: 8px;
          background: var(--surface-hover);
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: var(--primary);
          transition: width 0.3s;
        }

        .analysis-card {
          padding: 2rem;
        }

        .analysis-card h2 {
          margin-bottom: 1rem;
          font-size: 1.25rem;
        }

        .analysis-text {
          color: #d4d4d4;
          line-height: 1.7;
          font-size: 1.05rem;
        }

        .author-card {
          padding: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .author-info {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: var(--primary);
          color: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.5rem;
          cursor: pointer;
        }

        .author-details {
          display: flex;
          flex-direction: column;
        }

        .username-link:hover .username {
          color: var(--primary);
        }

        .username {
          font-weight: 600;
          font-size: 1.1rem;
        }

        .rank {
          color: #888;
          font-size: 0.9rem;
        }

        .interactions-card {
          padding: 1.5rem;
        }

        .interactions {
          display: flex;
          gap: 2rem;
        }

        .interaction-btn {
          background: transparent;
          border: none;
          color: #a3a3a3;
          cursor: pointer;
          font-size: 1rem;
          transition: color 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .interaction-btn.liked {
            color: #ef4444;
        }

        .interaction-btn:hover {
          color: var(--foreground);
        }

        .comments-card {
          padding: 2rem;
        }

        .comments-card h2 {
          margin-bottom: 1.5rem;
          font-size: 1.25rem;
        }

        .comments-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .comment {
          background: var(--background);
          padding: 1rem;
          border-radius: 0.5rem;
        }

        .comment-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .comment-user {
          font-weight: 600;
          color: var(--primary);
        }

        .comment-time {
          color: #888;
          font-size: 0.85rem;
        }

        .comment-text {
          color: #d4d4d4;
          line-height: 1.5;
        }

        .comment-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .comment-form textarea {
          background: var(--background);
          border: 1px solid var(--border);
          padding: 0.75rem;
          border-radius: 0.5rem;
          color: var(--foreground);
          font-family: inherit;
          resize: vertical;
        }

        .comment-form textarea:focus {
          outline: none;
          border-color: var(--primary);
        }
        
        .btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .author-card {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}
