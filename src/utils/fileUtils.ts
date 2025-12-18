import JSZip from 'jszip';
import type { TokenGroup } from '../types/tokens';

/**
 * Merges two or more objects deeply.
 */
function deepMerge<T extends object>(target: T, source: T): T {
    const result: T = { ...target };
    for (const key in source) {
        const sourceKey = key as keyof T;
        const targetValue = result[sourceKey];
        const sourceValue = source[sourceKey];

        if (
            sourceValue &&
            typeof sourceValue === 'object' &&
            !Array.isArray(sourceValue) &&
            targetValue &&
            typeof targetValue === 'object' &&
            !Array.isArray(targetValue)
        ) {
            result[sourceKey] = deepMerge(targetValue as T, sourceValue as T) as T[keyof T];
        } else {
            result[sourceKey] = sourceValue;
        }
    }
    return result;
}

export async function processTokenFile(file: File): Promise<TokenGroup> {
    if (file.name.toLowerCase().endsWith('.json')) {
        const text = await file.text();
        return JSON.parse(text) as TokenGroup;
    }

    if (file.name.toLowerCase().endsWith('.zip')) {
        const zip = await JSZip.loadAsync(file);
        let mergedTokens: TokenGroup = {};
        let foundJson = false;

        const files = Object.keys(zip.files).filter(name => {
            const isJson = name.toLowerCase().endsWith('.json');
            const isSystemFile = name.includes('__MACOSX') || name.startsWith('.') || name.includes('/.');
            return isJson && !isSystemFile;
        });

        console.group('📦 ZIP Content Summary');
        console.log(`Found ${files.length} JSON files:`, files);
        console.groupEnd();

        for (const fileName of files) {
            const content = await zip.files[fileName].async('string');
            try {
                const json = JSON.parse(content) as TokenGroup;
                mergedTokens = deepMerge(mergedTokens, json);
                foundJson = true;
                console.log(`✅ Parsed: ${fileName}`);
            } catch (e) {
                console.error(`❌ Failed to parse ${fileName}:`, e);
            }
        }

        if (!foundJson) {
            throw new Error('No valid .json token files found in ZIP archive');
        }

        return mergedTokens;
    }

    throw new Error('Unsupported file format');
}
