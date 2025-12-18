import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    Handle,
    Position,
    BackgroundVariant,
    type NodeProps
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ChevronRight, ChevronDown, ExternalLink } from 'lucide-react';

const SectionNode = ({ data }: NodeProps) => {
    return (
        <div className="section-node-v2">
            <div className="section-node-title-v2">{data.label}</div>
            <div className="section-node-body-v2" />
        </div>
    );
};

const TokenPreview = ({ type, value }: { type: string; value: any }) => {
    if (type === 'color' || (typeof value === 'string' && value.startsWith('#'))) {
        return (
            <div
                className="color-swatch-sm"
                style={{
                    backgroundColor: value,
                    width: '12px',
                    height: '12px',
                    borderRadius: '2px',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}
            />
        );
    }
    return null;
};

const GroupNode = ({ data }: NodeProps) => {
    const isExpanded = data.isExpanded;
    const tokens = data.tokens || [];
    const visibleTokens = tokens.slice(0, 5);
    const hiddenCount = Math.max(0, tokens.length - 5);

    return (
        <div className={`token-node-v2 category-${data.category} ${isExpanded ? 'is-expanded' : ''}`}>
            <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />

            <div className="token-node-content" onClick={data.onToggleExpansion}>
                <div className="token-node-header-row">
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    <span className="token-node-path">{data.fullPath || data.label}</span>
                </div>
                <div className="token-node-footer-row">
                    <span className={`token-badge badge-${data.category === 'primitive' ? 'options' : 'decisions'}`}>
                        {data.category === 'primitive' ? 'Options' : 'Decisions'}
                    </span>
                    <span className="token-count-label">{data.tokenCount} tokens</span>
                </div>

                {isExpanded && (
                    <div className="token-expansion-area" onClick={(e) => e.stopPropagation()}>
                        <div className="view-all-row-v2">
                            <ExternalLink size={12} />
                            <span>View all {data.tokenCount} tokens</span>
                        </div>

                        <div className="token-list-v2">
                            {visibleTokens.map((token: any, i: number) => (
                                <div key={i} className="token-list-item-v2">
                                    <div className="item-main">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <TokenPreview type={token.type} value={token.value} />
                                            <span className="item-name">{token.label}</span>
                                        </div>
                                        <span className="item-type">{token.type}</span>
                                    </div>
                                    <div className="item-path">{token.value}</div>
                                </div>
                            ))}
                        </div>

                        {hiddenCount > 0 && (
                            <div className="more-tokens-link">
                                +{hiddenCount} more matching tokens
                            </div>
                        )}
                    </div>
                )}
            </div>

            <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
        </div>
    );
};

const nodeTypes = {
    groupNode: GroupNode,
    sectionNode: SectionNode,
    tokenNode: GroupNode, // Alias for now if needed
};

interface MapCanvasProps {
    nodes: any[];
    edges: any[];
    onNodeClick?: (event: React.MouseEvent, node: any) => void;
    onPaneClick?: (event: React.MouseEvent) => void;
}

export const MapCanvas: React.FC<MapCanvasProps> = ({ nodes, edges, onNodeClick, onPaneClick }) => {
    return (
        <div className="canvas-container">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                fitView
                className="token-map-canvas"
            >
                <Background color="#333" gap={20} variant={BackgroundVariant.Dots} />
                <Controls />
                <MiniMap
                    style={{ background: '#1a1d23', border: '1px solid rgba(255,255,255,0.1)' }}
                    nodeColor={(n) => {
                        if (n.type === 'sectionNode') return 'transparent';
                        if (n.data?.category === 'primitive') return '#0ea5e9';
                        if (n.data?.category === 'decision') return '#a855f7';
                        return '#4c1d95';
                    }}
                    maskColor="rgba(0, 0, 0, 0.3)"
                />
            </ReactFlow>
        </div>
    );
};
