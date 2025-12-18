import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    Handle,
    Position,
    type NodeProps
} from 'reactflow';
import 'reactflow/dist/style.css';

const TokenNode = ({ data }: NodeProps) => {
    return (
        <div className={`token-node token-node-${data.category}`}>
            <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
            <div className="token-node-label">{data.label}</div>
            <div className="token-node-value">{data.value}</div>
            <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
        </div>
    );
};

const nodeTypes = {
    tokenNode: TokenNode,
};

interface MapCanvasProps {
    nodes: any[];
    edges: any[];
}

export const MapCanvas: React.FC<MapCanvasProps> = ({ nodes, edges }) => {
    return (
        <div className="canvas-container">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                fitView
            >
                <Background color="#333" gap={20} />
                <Controls />
                <MiniMap
                    style={{ background: 'var(--sidebar-bg)' }}
                    nodeColor={(n) => {
                        if (n.data?.category === 'primitive') return '#1e293b';
                        if (n.data?.category === 'decision') return '#1e3a8a';
                        return '#4c1d95';
                    }}
                />
            </ReactFlow>
        </div>
    );
};
