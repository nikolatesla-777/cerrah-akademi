"use client";

import { useState, useEffect, useRef } from 'react';
import { searchFixtures, formatMatchName } from '@/lib/fixtures';

export default function MatchSearchAutocomplete({ onSelectMatch, selectedMatch }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const wrapperRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Search with debounce
    useEffect(() => {
        if (query.length < 3) { // Increased min length to 3 for better performance
            setResults([]);
            setIsOpen(false);
            return;
        }

        const timer = setTimeout(async () => {
            // Search in Supabase
            const { createClient } = require('@supabase/supabase-js');
            const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

            const { data, error } = await supabase
                .from('fixtures')
                .select('*')
                .or(`home_team.ilike.%${query}%,away_team.ilike.%${query}%`)
                .eq('status', 'NOT_STARTED') // Only show upcoming matches for prediction
                .limit(10);

            if (!error && data) {
                setResults(data);
                setIsOpen(data.length > 0);
            }
        }, 500); // Increased debounce to 500ms

        return () => clearTimeout(timer);
    }, [query]);

    const handleSelect = (fixture) => {
        setQuery(formatMatchName(fixture));
        setIsOpen(false);
        setHighlightedIndex(-1);
        onSelectMatch(fixture);
    };

    const handleKeyDown = (e) => {
        if (!isOpen) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightedIndex(prev =>
                prev < results.length - 1 ? prev + 1 : prev
            );
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (highlightedIndex >= 0) {
                handleSelect(results[highlightedIndex]);
            }
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    return (
        <div className="autocomplete-wrapper" ref={wrapperRef}>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Takım ismi yazın (örn: Galatasaray)"
                className="autocomplete-input"
            />

            {isOpen && results.length > 0 && (
                <ul className="autocomplete-dropdown">
                    {results.map((fixture, index) => (
                        <li
                            key={fixture.id}
                            className={`autocomplete-item ${index === highlightedIndex ? 'highlighted' : ''}`}
                            onClick={() => handleSelect(fixture)}
                            onMouseEnter={() => setHighlightedIndex(index)}
                        >
                            <div className="match-info">
                                <span className="match-name">{formatMatchName(fixture)}</span>
                                <span className="league-badge">{fixture.league}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            <style jsx>{`
        .autocomplete-wrapper {
          position: relative;
          width: 100%;
        }

        .autocomplete-input {
          width: 100%;
          background: var(--background);
          border: 1px solid var(--border);
          padding: 0.75rem;
          border-radius: 0.5rem;
          color: var(--foreground);
          font-size: 1rem;
          transition: border-color 0.2s;
        }

        .autocomplete-input:focus {
          outline: none;
          border-color: var(--primary);
        }

        .autocomplete-dropdown {
          position: absolute;
          top: calc(100% + 0.5rem);
          left: 0;
          right: 0;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          max-height: 300px;
          overflow-y: auto;
          z-index: 100;
          list-style: none;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        }

        .autocomplete-item {
          padding: 0.75rem 1rem;
          cursor: pointer;
          transition: background 0.2s;
          border-bottom: 1px solid var(--border);
        }

        .autocomplete-item:last-child {
          border-bottom: none;
        }

        .autocomplete-item:hover,
        .autocomplete-item.highlighted {
          background: var(--surface-hover);
        }

        .match-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .match-name {
          font-weight: 600;
        }

        .league-badge {
          font-size: 0.75rem;
          color: #888;
          background: var(--background);
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
        }
      `}</style>
        </div>
    );
}
