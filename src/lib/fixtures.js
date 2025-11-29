// Mock football fixtures data with odds
// In production, this would fetch from a real API like The Odds API or SportRadar

export const mockFixtures = [
    // Turkish Super Lig
    {
        id: 1,
        homeTeam: "Galatasaray",
        awayTeam: "Fenerbahçe",
        league: "Süper Lig",
        date: "2025-11-25T19:00:00",
        odds: {
            "MS 1": 2.10,
            "MS X": 3.40,
            "MS 2": 3.80,
            "KG Var": 1.65,
            "KG Yok": 2.30,
            "Üst 2.5": 1.75,
            "Alt 2.5": 2.15,
            "MS 1 & KG Var": 2.90,
            "MS 2 & KG Var": 5.20
        }
    },
    {
        id: 2,
        homeTeam: "Beşiktaş",
        awayTeam: "Trabzonspor",
        league: "Süper Lig",
        date: "2025-11-25T19:30:00",
        odds: {
            "MS 1": 1.95,
            "MS X": 3.50,
            "MS 2": 4.20,
            "KG Var": 1.70,
            "KG Yok": 2.20,
            "Üst 2.5": 1.80,
            "Alt 2.5": 2.05
        }
    },
    // La Liga
    {
        id: 3,
        homeTeam: "Real Madrid",
        awayTeam: "Barcelona",
        league: "La Liga",
        date: "2025-11-25T21:00:00",
        odds: {
            "MS 1": 2.30,
            "MS X": 3.20,
            "MS 2": 3.10,
            "KG Var": 1.70,
            "KG Yok": 2.20,
            "Üst 2.5": 1.65,
            "Alt 2.5": 2.35
        }
    },
    {
        id: 4,
        homeTeam: "Atletico Madrid",
        awayTeam: "Sevilla",
        league: "La Liga",
        date: "2025-11-25T19:00:00",
        odds: {
            "MS 1": 1.75,
            "MS X": 3.60,
            "MS 2": 5.00,
            "KG Var": 1.85,
            "KG Yok": 2.00,
            "Üst 2.5": 1.90,
            "Alt 2.5": 1.95
        }
    },
    // Premier League
    {
        id: 5,
        homeTeam: "Man City",
        awayTeam: "Liverpool",
        league: "Premier League",
        date: "2025-11-25T17:30:00",
        odds: {
            "MS 1": 2.05,
            "MS X": 3.50,
            "MS 2": 3.60,
            "KG Var": 1.60,
            "KG Yok": 2.40,
            "Üst 2.5": 1.70,
            "Alt 2.5": 2.25
        }
    },
    {
        id: 6,
        homeTeam: "Arsenal",
        awayTeam: "Chelsea",
        league: "Premier League",
        date: "2025-11-25T20:00:00",
        odds: {
            "MS 1": 1.90,
            "MS X": 3.40,
            "MS 2": 4.50,
            "KG Var": 1.75,
            "KG Yok": 2.15,
            "Üst 2.5": 1.85,
            "Alt 2.5": 2.00
        }
    },
    // Bundesliga
    {
        id: 7,
        homeTeam: "Bayern Munich",
        awayTeam: "Borussia Dortmund",
        league: "Bundesliga",
        date: "2025-11-25T18:30:00",
        odds: {
            "MS 1": 1.65,
            "MS X": 4.00,
            "MS 2": 5.50,
            "KG Var": 1.55,
            "KG Yok": 2.55,
            "Üst 3.5": 1.85,
            "Alt 3.5": 2.00
        }
    },
    // Serie A
    {
        id: 8,
        homeTeam: "Inter Milan",
        awayTeam: "AC Milan",
        league: "Serie A",
        date: "2025-11-25T20:45:00",
        odds: {
            "MS 1": 2.20,
            "MS X": 3.30,
            "MS 2": 3.40,
            "KG Var": 1.70,
            "KG Yok": 2.25,
            "Üst 2.5": 1.80,
            "Alt 2.5": 2.10
        }
    }
];

// Search fixtures by team name
export function searchFixtures(query) {
    if (!query || query.length < 2) {
        return [];
    }

    const lowerQuery = query.toLowerCase();
    return mockFixtures.filter(fixture =>
        fixture.homeTeam.toLowerCase().includes(lowerQuery) ||
        fixture.awayTeam.toLowerCase().includes(lowerQuery)
    );
}

// Get fixture by ID
export function getFixtureById(id) {
    return mockFixtures.find(fixture => fixture.id === id);
}

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
