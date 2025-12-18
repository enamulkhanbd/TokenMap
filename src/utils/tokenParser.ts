import type { TokenGroup } from '../types/tokens';

export const parseTokens = (tokens: TokenGroup): { nodes: any[]; edges: any[] } => {
    const nodes: any[] = [];
    const edges: any[] = [];
    const tokenMap = new Map<string, string>();

    const traverse = (obj: any, path: string[] = [], category: 'primitive' | 'decision' | 'component' = 'primitive', parentId?: string, depth: number = 0) => {
        let currentGroupTokenCount = 0;
        let currentTokens: any[] = [];

        for (const key in obj) {
            if (key.startsWith('$')) continue;

            const currentPath = [...path, key];
            const value = obj[key];
            const id = currentPath.join('.');

            // Case 1: Standard Token Object
            if (typeof value === 'object' && value !== null && ('$value' in value || 'value' in value)) {
                const tokenValue = (value.$value ?? value.value) as any;
                const tokenType = value.$type ?? value.type ?? (typeof tokenValue === 'string' && tokenValue.startsWith('#') ? 'color' : 'other');
                const tokenObj = {
                    label: key,
                    value: typeof tokenValue === 'object' ? JSON.stringify(tokenValue) : tokenValue,
                    type: tokenType,
                    fullPath: id,
                };

                nodes.push({
                    id,
                    parentId,
                    data: {
                        ...tokenObj,
                        category,
                        badge: category === 'primitive' ? 'Options' : 'Decisions',
                    },
                    position: { x: 0, y: 0 },
                    type: 'tokenNode',
                });

                tokenMap.set(id, id);
                currentGroupTokenCount++;
                currentTokens.push(tokenObj);

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
            // Case 3: Group Object
            else if (typeof value === 'object' && value !== null) {
                let nextCategory = category;
                const lowerKey = key.toLowerCase();
                if (lowerKey.includes('brand') || lowerKey.includes('decision') || lowerKey.includes('global')) nextCategory = 'decision';
                if (lowerKey.includes('component') || lowerKey.includes('theme') || lowerKey.includes('semantic')) nextCategory = 'component';

                const subResults = traverse(value, currentPath, nextCategory, id, depth + 1);

                nodes.push({
                    id,
                    parentId,
                    data: {
                        label: key,
                        category: nextCategory,
                        tokenCount: subResults.count,
                        tokens: subResults.tokens, // Include tokens for expansion
                        fullPath: id
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
