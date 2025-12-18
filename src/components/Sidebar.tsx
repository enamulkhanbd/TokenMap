import { Upload, Search } from 'lucide-react';

interface SidebarProps {
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSearch: (term: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onFileUpload, onSearch }) => {
    return (
        <div className="sidebar glass">
            <div className="logo">
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>TokensMap</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Visualize your design tokens</p>
            </div>

            <div className="upload-section">
                <label className="upload-btn" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px',
                    background: 'var(--accent-color)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    justifyContent: 'center',
                    fontWeight: 600
                }}>
                    <Upload size={18} />
                    Drop Token File (.json, .zip)
                    <input type="file" hidden onChange={onFileUpload} accept=".json,.zip" />
                </label>
            </div>

            <div className="search-section">
                <div style={{ position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input
                        type="text"
                        placeholder="Filter tokens (e.g. boxShadow)"
                        onChange={(e) => onSearch(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 10px 10px 36px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            color: 'white',
                            outline: 'none',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>
            </div>

            <div style={{ marginTop: 'auto', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                <p>© 2025 TokensMap • Built for design systems</p>
            </div>
        </div>
    );
};
