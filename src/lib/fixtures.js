// Helper functions for fixtures

// Get all available prediction types
export function getPredictionTypes() {
    return [
        "MS 1",
        "MS X",
        "MS 2",
        "KG Var",
        "KG Yok",
        "Üst 2.5",
        "Alt 2.5",
        "Üst 3.5",
        "Alt 3.5",
        "MS 1 & KG Var",
        "MS 2 & KG Var"
    ];
}

// Format match display name
export function formatMatchName(fixture) {
    if (!fixture) return '';
    // Handle both camelCase (mock) and snake_case (Supabase)
    const home = fixture.homeTeam || fixture.home_team;
    const away = fixture.awayTeam || fixture.away_team;
    return `${home} - ${away}`;
}
