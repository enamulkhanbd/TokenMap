import React from 'react';
import { Search, X, RefreshCw } from 'lucide-react';

interface TopHeaderProps {
    stats: {
        sets: number;
        tokens: number;
        connections: number;
    };
    onSearch: (term: string) => void;
    searchTerm: string;
    onResetAll: () => void;
    onNewMap: () => void;
    hasActiveFilters: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
    stats,
    onSearch,
    searchTerm,
    onResetAll,
    onNewMap,
    hasActiveFilters
}) => {
    return (
        <header className="top-header">
            <div className="header-left">
                <h1 className="header-logo">SystemsMap</h1>
                <div className="header-stats">
                    <div className="stat-item">
                        <span className="stat-value">{stats.sets}</span>
                        <span className="stat-label">sets</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">{stats.tokens}</span>
                        <span className="stat-label">tokens</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">{stats.connections}</span>
                        <span className="stat-label">connections</span>
                    </div>
                </div>
            </div>

            <div className="header-right">
                <div className="header-actions">
                    <div className="search-container">
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Search tokens..."
                            className="header-search-input"
                            value={searchTerm}
                            onChange={(e) => onSearch(e.target.value)}
                        />
                    </div>

                    {(searchTerm || hasActiveFilters) && (
                        <button className="reset-all-btn" onClick={onResetAll}>
                            <X size={18} />
                            <span>Reset All</span>
                        </button>
                    )}

                    <button className="new-map-btn" onClick={onNewMap}>
                        <RefreshCw size={18} />
                        <span>New Map</span>
                    </button>
                </div>
            </div>
        </header>
    );
};
