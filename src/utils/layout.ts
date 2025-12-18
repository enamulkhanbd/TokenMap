import dagre from '@dagrejs/dagre';
import { type Node, type Edge, Position } from 'reactflow';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 64;

export const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'LR') => {
    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({ rankdir: direction, nodesep: 50, ranksep: 100 });

    // Only layout leaf nodes and edges between them for now,
    // or let dagre handle everything and we adjust for groups later.
    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    // 1. Position individual nodes
    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);

        // Dagre positions are center-based, React Flow are top-left based
        const position = {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
        };

        return {
            ...node,
            targetPosition: isHorizontal ? Position.Left : Position.Top,
            sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
            position,
        };
    });

    // 2. Adjust nested nodes and calculate group sizes
    // For React Flow sub-flows, child positions must be relative to parent
    const finalizeNodes = (allNodes: Node[]) => {
        // Identify group nodes
        const groupNodes = allNodes.filter(n => n.type === 'groupNode');

        groupNodes.forEach(group => {
            const children = allNodes.filter(n => n.parentId === group.id);
            if (children.length === 0) return;

            // Find bounds of children (currently in absolute coords)
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            children.forEach(child => {
                minX = Math.min(minX, child.position.x);
                minY = Math.min(minY, child.position.y);
                maxX = Math.max(maxX, child.position.x + nodeWidth);
                maxY = Math.max(maxY, child.position.y + nodeHeight);
            });

            const padding = 40;
            const headerHeight = 40;

            // Set group size and absolute position
            group.style = {
                ...group.style,
                width: (maxX - minX) + (padding * 2),
                height: (maxY - minY) + (padding * 2) + headerHeight
            };
            group.position = { x: minX - padding, y: minY - padding - headerHeight };

            // Convert child positions to relative
            children.forEach(child => {
                child.position = {
                    x: child.position.x - group.position.x,
                    y: child.position.y - group.position.y,
                };
            });
        });

        return allNodes;
    };

    return { nodes: finalizeNodes(layoutedNodes), edges };
};
