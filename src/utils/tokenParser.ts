import type { TokenGroup, ParsedTokens, TokenNodeData } from '../types/tokens';
import type { Node, Edge } from 'reactflow';

export const parseTokens = (tokens: TokenGroup): ParsedTokens => {
    const nodes: Node<TokenNodeData>[] = [];
    const edges: Edge[] = [];
    const tokenMap = new Map<string, string>();

    type Category = 'primitive' | 'decision' | 'component';

    const traverse = (
        obj: TokenGroup,
        path: string[] = [],
        category: Category = 'primitive',
        parentId?: string,
        depth: number = 0
    ): { count: number; tokens: TokenNodeData[] } => {
        let currentGroupTokenCount = 0;
        let currentTokens: TokenNodeData[] = [];

        for (const key in obj) {
            if (key.startsWith('$')) continue;

            const currentPath = [...path, key];
            const value = obj[key];
            const id = currentPath.join('.');

            // Case 1: Standard Token Object
            if (typeof value === 'object' && value !== null && ('$value' in value || 'value' in value)) {
                const tokenValue = (value as { $value?: unknown; value?: unknown }).$value ?? (value as { value?: unknown }).value;
                const tokenType = (value as { $type?: string; type?: string }).$type ?? (value as { type?: string }).type ?? (typeof tokenValue === 'string' && tokenValue.startsWith('#') ? 'color' : 'other');

                const tokenData: TokenNodeData = {
                    label: key,
                    value: typeof tokenValue === 'object' ? JSON.stringify(tokenValue) : String(tokenValue),
                    type: tokenType as TokenNodeData['type'],
                    category,
                    fullPath: id,
                };

                nodes.push({
                    id,
                    parentId,
                    data: tokenData,
                    position: { x: 0, y: 0 },
                    type: 'tokenNode',
                });

                tokenMap.set(id, id);
                currentGroupTokenCount++;
                currentTokens.push(tokenData);

                if (typeof tokenValue === 'string' && tokenValue.startsWith('{') && tokenValue.endsWith('}')) {
                    const aliasPath = tokenValue.slice(1, -1);
                    edges.push({
                        id: `e-${aliasPath}-${id}`,
                        source: aliasPath,
                        target: id,
                        animated: true,
                    });
                }
            }
            // Case 2: Group Object
            else if (typeof value === 'object' && value !== null) {
                let nextCategory = category;
                const lowerKey = key.toLowerCase();
                if (lowerKey.includes('brand') || lowerKey.includes('decision') || lowerKey.includes('global')) nextCategory = 'decision';
                if (lowerKey.includes('component') || lowerKey.includes('theme') || lowerKey.includes('semantic')) nextCategory = 'component';

                const subResults = traverse(value as TokenGroup, currentPath, nextCategory, id, depth + 1);

                nodes.push({
                    id,
                    parentId,
                    data: {
                        label: key,
                        category: nextCategory,
                        tokenCount: subResults.count,
                        tokens: subResults.tokens, // Include tokens for expansion
                        fullPath: id,
                        value: '', // ensure value is not undefined
                    },
                    position: { x: 0, y: 0 },
                    type: depth === 0 ? 'sectionNode' : 'groupNode',
                    draggable: depth !== 0,
                    selectable: depth !== 0,
                });

                currentGroupTokenCount += subResults.count;
                currentTokens = [...currentTokens, ...subResults.tokens];
            }
        }
        return { count: currentGroupTokenCount, tokens: currentTokens };
    };

    traverse(tokens);
    return { nodes, edges };
};