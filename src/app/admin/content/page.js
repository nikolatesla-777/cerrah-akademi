"use client";

import { useState } from 'react';

export default function ContentManagementPage() {
    // Mock Slider Data
    const [slides, setSlides] = useState([
        { id: 1, title: "Haftanın Maçı", description: "Galatasaray - Fenerbahçe derbisi için özel oranlar!", image: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&q=80&w=1000", link: "/prediction/1" },
        { id: 2, title: "Kazandıranlar Kulübü", description: "En çok kazandıran cerrahları takip et.", image: "https://images.unsplash.com/photo-1560253023-3ec5d502959f?auto=format&fit=crop&q=80&w=1000", link: "/leaderboard" },
    ]);

    const [newSlide, setNewSlide] = useState({
        title: '',
        description: '',
        image: '',
        link: ''
    });

    const [isEditing, setIsEditing] = useState(null);

    const handleAddSlide = (e) => {
        e.preventDefault();
        const slide = {
            id: slides.length + 1,
            ...newSlide
        };
        setSlides([...slides, slide]);
        setNewSlide({ title: '', description: '', image: '', link: '' });
        alert('Slayt başarıyla eklendi!');
    };

    const handleDeleteSlide = (id) => {
        if (confirm('Bu slaytı silmek istediğinize emin misiniz?')) {
            setSlides(slides.filter(slide => slide.id !== id));
        }
    };

    const startEdit = (slide) => {
        setIsEditing(slide.id);
        setNewSlide(slide);
    };

    const cancelEdit = () => {
        setIsEditing(null);
        setNewSlide({ title: '', description: '', image: '', link: '' });
    };

    const handleUpdateSlide = (e) => {
        e.preventDefault();
        setSlides(slides.map(slide => slide.id === isEditing ? { ...newSlide, id: isEditing } : slide));
        setIsEditing(null);
        setNewSlide({ title: '', description: '', image: '', link: '' });
        alert('Slayt güncellendi!');
    };

    return (
        <div className="content-page">
            <div className="page-header">
                <h1 className="page-title">İçerik Yönetimi (Slider)</h1>
            </div>

            <div className="content-grid">
                {/* Add/Edit Slide Form */}
                <div className="card form-card">
                    <h2 className="card-title">{isEditing ? 'Slaytı Düzenle' : 'Yeni Slayt Ekle'}</h2>
                    <form onSubmit={isEditing ? handleUpdateSlide : handleAddSlide} className="slide-form">
                        <div className="form-group">
                            <label>Başlık</label>
                            <input
                                type="text"
                                placeholder="Örn: Haftanın Maçı"
                                value={newSlide.title}
                                onChange={(e) => setNewSlide({ ...newSlide, title: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Açıklama</label>
                            <textarea
                                placeholder="Kısa açıklama..."
                                value={newSlide.description}
                                onChange={(e) => setNewSlide({ ...newSlide, description: e.target.value })}
                                required
                                rows="3"
                            />
                        </div>
                        <div className="form-group">
                            <label>Görsel URL</label>
                            <input
                                type="url"
                                placeholder="https://..."
                                value={newSlide.image}
                                onChange={(e) => setNewSlide({ ...newSlide, image: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Yönlendirme Linki</label>
                            <input
                                type="text"
                                placeholder="/leaderboard veya https://..."
                                value={newSlide.link}
                                onChange={(e) => setNewSlide({ ...newSlide, link: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="submit-btn">
                                {isEditing ? 'Güncelle' : 'Ekle'}
                            </button>
                            {isEditing && (
                                <button type="button" onClick={cancelEdit} className="cancel-btn">
                                    İptal
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Slides List */}
                <div className="card list-card">
                    <h2 className="card-title">Aktif Slaytlar</h2>
                    <div className="slides-list">
                        {slides.map((slide) => (
                            <div key={slide.id} className="slide-item">
                                <div className="slide-preview">
                                    <img src={slide.image} alt={slide.title} />
                                </div>
                                <div className="slide-info">
                                    <h3>{slide.title}</h3>
                                    <p>{slide.description}</p>
                                    <span className="link-badge">{slide.link}</span>
                                </div>
                                <div className="slide-actions">
                                    <button onClick={() => startEdit(slide)} className="action-btn edit" title="Düzenle">✏️</button>
                                    <button onClick={() => handleDeleteSlide(slide.id)} className="action-btn delete" title="Sil">🗑️</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style jsx>{`
        .page-header {
          margin-bottom: 2rem;
        }

        .page-title {
          font-size: 1.8rem;
          font-weight: 700;
        }

        .content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        @media (max-width: 1024px) {
          .content-grid {
            grid-template-columns: 1fr;
          }
        }

        .card {
          background: #1e293b;
          border-radius: 1rem;
          padding: 1.5rem;
          border: 1px solid rgba(255,255,255,0.05);
        }

        .card-title {
          font-size: 1.2rem;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .slide-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        label {
          font-size: 0.9rem;
          color: #94a3b8;
        }

        input, textarea {
          background: rgba(0,0,0,0.2);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 0.75rem;
          border-radius: 0.5rem;
          color: #fff;
          font-size: 1rem;
          font-family: inherit;
        }

        input:focus, textarea:focus {
          outline: none;
          border-color: var(--primary);
        }

        .form-actions {
            display: flex;
            gap: 1rem;
            margin-top: 1rem;
        }

        .submit-btn {
          flex: 1;
          background: var(--primary);
          color: #000;
          border: none;
          padding: 1rem;
          border-radius: 0.5rem;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .cancel-btn {
            background: rgba(255,255,255,0.1);
            color: #fff;
            border: none;
            padding: 1rem;
            border-radius: 0.5rem;
            font-weight: 600;
            cursor: pointer;
        }

        .submit-btn:hover {
          transform: translateY(-2px);
        }

        .slides-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          max-height: 600px;
          overflow-y: auto;
        }

        .slide-item {
          background: rgba(255,255,255,0.03);
          padding: 1rem;
          border-radius: 0.75rem;
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .slide-preview {
            width: 80px;
            height: 60px;
            border-radius: 0.5rem;
            overflow: hidden;
            flex-shrink: 0;
        }

        .slide-preview img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .slide-info {
            flex: 1;
            min-width: 0;
        }

        .slide-info h3 {
            font-size: 1rem;
            margin-bottom: 0.25rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .slide-info p {
            font-size: 0.85rem;
            color: #94a3b8;
            margin-bottom: 0.5rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .link-badge {
            font-size: 0.75rem;
            background: rgba(255,255,255,0.1);
            padding: 0.1rem 0.4rem;
            border-radius: 0.25rem;
            color: var(--primary);
        }

        .slide-actions {
            display: flex;
            gap: 0.5rem;
        }

        .action-btn {
            width: 32px;
            height: 32px;
            border-radius: 0.5rem;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 1rem;
        }

        .action-btn.edit { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
        .action-btn.delete { background: rgba(248, 113, 113, 0.2); color: #f87171; }

        .action-btn:hover {
            transform: scale(1.1);
        }
      `}</style>
        </div>
    );
}
