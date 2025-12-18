import { FolderOpen, ArrowRight } from 'lucide-react';

interface HomePageProps {
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onFileUpload }) => {
    return (
        <div className="home-page">
            <header className="home-header">
                <h1>TokenMap</h1>
                <p className="home-subheader">
                    Transform your design tokens into interactive systems <br />
                    maps. See the flow from Options → Decisions → Components.
                </p>
            </header>

            <div className="upload-container">
                <label className="upload-box">
                    <div className="upload-icon-wrapper">
                        <FolderOpen size={48} className="upload-icon" />
                        <div className="cursor-pointer">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13 5H11V11H5V13H11V19H13V13H19V11H13V5Z" fill="white" />
                            </svg>
                        </div>
                    </div>
                    <div className="upload-text">
                        <span>Drop your token files </span>
                        <span className="no-file">No file chosen</span>
                        <span> here</span>
                    </div>
                    <p className="upload-hint">Supports folders, zip files, or individual JSON files</p>

                    <div className="legend">
                        <div className="legend-item">
                            <span className="dot options"></span>
                            <span>Options</span>
                        </div>
                        <div className="legend-item">
                            <span className="dot decisions"></span>
                            <span>Decisions</span>
                        </div>
                        <div className="legend-item">
                            <span className="dot components"></span>
                            <span>Components</span>
                        </div>
                    </div>

                    <input type="file" hidden onChange={onFileUpload} accept=".json,.zip" />
                </label>
            </div>

            <section className="how-it-works">
                <h3>How it works:</h3>
                <ul>
                    <li>
                        Tokens only referenced <ArrowRight size={14} /> <span className="text-options">Options</span>
                    </li>
                    <li>
                        Tokens that reference & are referenced <ArrowRight size={14} /> <span className="text-decisions">Decisions</span>
                    </li>
                    <li>
                        Tokens that reference but aren't referenced <ArrowRight size={14} /> <span className="text-components">Components</span>
                    </li>
                </ul>
            </section>
        </div>
    );
};
