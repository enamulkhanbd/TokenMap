import type { TokenGroup } from '../types/tokens';

export const parseTokens = (tokens: TokenGroup): { nodes: any[]; edges: any[] } => {
    const nodes: any[] = [];
    const edges: any[] = [];
    const tokenMap = new Map<string, string>(); // path -> id

    const traverse = (obj: any, path: string[] = [], category: 'primitive' | 'decision' | 'component' = 'primitive') => {
        for (const key in obj) {
            const currentPath = [...path, key];
            const value = obj[key];

            if (typeof value === 'object' && value !== null) {
                if ('$value' in value) {
                    // It's a token
                    const id = currentPath.join('.');
                    const tokenValue = value.$value as string;

                    nodes.push({
                        id,
                        data: {
                            label: key,
                            value: tokenValue,
                            type: value.$type,
                            category,
                            fullPath: id,
                        },
                        position: { x: 0, y: 0 }, // Will be set by layout engine
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
                } else {
                    // It's a group, determine category if possible or pass it down
                    let nextCategory = category;
                    if (key.toLowerCase().includes('brand') || key.toLowerCase().includes('decision')) nextCategory = 'decision';
                    if (key.toLowerCase().includes('component') || key.toLowerCase().includes('theme')) nextCategory = 'component';

                    traverse(value, currentPath, nextCategory);
                }
            }
        }
    };

    traverse(tokens);
    return { nodes, edges };
};
