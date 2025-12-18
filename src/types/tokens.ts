export type TokenType = 'color' | 'spacing' | 'typography' | 'shadow' | 'other';

export interface DesignToken {
    $value: string | number;
    $type?: TokenType;
    $description?: string;
}

export interface TokenGroup {
    [key: string]: DesignToken | TokenGroup | string | undefined;
}

export interface TokenNodeData {
    label: string;
    value: string | number;
    type?: TokenType;
    category: 'primitive' | 'decision' | 'component';
    fullPath: string;
}

import type { Node, Edge } from 'reactflow';

export interface ParsedTokens {
    nodes: Node<TokenNodeData>[];
    edges: Edge[];
}
