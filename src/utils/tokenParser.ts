import type { TokenGroup } from '../types/tokens';

export const parseTokens = (tokens: TokenGroup): { nodes: any[]; edges: any[] } => {
    const nodes: any[] = [];
    const edges: any[] = [];
    const tokenMap = new Map<string, string>(); // path -> id

    const traverse = (obj: any, path: string[] = [], category: 'primitive' | 'decision' | 'component' = 'primitive') => {
        for (const key in obj) {
            if (key.startsWith('$')) continue; // Skip metadata keys like $schema

            const currentPath = [...path, key];
            const value = obj[key];
            const id = currentPath.join('.');

            // Case 1: Standard Token Object (with $value or value)
            if (typeof value === 'object' && value !== null && ('$value' in value || 'value' in value)) {
                const tokenValue = (value.$value ?? value.value) as any;
                const tokenType = value.$type ?? value.type ?? (typeof tokenValue === 'string' && tokenValue.startsWith('#') ? 'color' : 'other');

                nodes.push({
                    id,
                    data: {
                        label: key,
                        value: typeof tokenValue === 'object' ? JSON.stringify(tokenValue) : tokenValue,
                        type: tokenType,
                        category,
                        fullPath: id,
                    },
                    position: { x: 0, y: 0 },
                    type: 'tokenNode',
                });

                tokenMap.set(id, id);

                // Handle Aliases
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
            // Case 2: Raw value (string/number) - Treated as a token
            else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                nodes.push({
                    id,
                    data: {
                        label: key,
                        value: String(value),
                        type: typeof value === 'string' && value.startsWith('#') ? 'color' : typeof value,
                        category,
                        fullPath: id,
                    },
                    position: { x: 0, y: 0 },
                    type: 'tokenNode',
                });
                tokenMap.set(id, id);
            }
            // Case 3: Group Object
            else if (typeof value === 'object' && value !== null) {
                let nextCategory = category;
                const lowerKey = key.toLowerCase();
                if (lowerKey.includes('brand') || lowerKey.includes('decision') || lowerKey.includes('global')) nextCategory = 'decision';
                if (lowerKey.includes('component') || lowerKey.includes('theme') || lowerKey.includes('semantic')) nextCategory = 'component';

                traverse(value, currentPath, nextCategory);
            }
        }
    };

    traverse(tokens);
    return { nodes, edges };
};
