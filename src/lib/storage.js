export const STORAGE_KEY = 'cerrah_predictions';

export const getPredictions = () => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
};

export const savePrediction = (prediction) => {
    if (typeof window === 'undefined') return;
    const current = getPredictions();
    const updated = [prediction, ...current];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new Event('prediction-updated'));

    return updated;
};
