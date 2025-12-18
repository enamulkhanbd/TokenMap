import JSZip from 'jszip';

/**
 * Merges two or more objects deeply.
 */
function deepMerge(target: any, source: any) {
    const result = { ...target };
    for (const key in source) {
        if (
            source[key] &&
            typeof source[key] === 'object' &&
            !Array.isArray(source[key]) &&
            target[key] &&
            typeof target[key] === 'object' &&
            !Array.isArray(target[key])
        ) {
            result[key] = deepMerge(target[key], source[key]);
        } else {
            result[key] = source[key];
        }
    }
    return result;
}

export async function processTokenFile(file: File): Promise<any> {
    if (file.name.endsWith('.json')) {
        const text = await file.text();
        return JSON.parse(text);
    }

    if (file.name.endsWith('.zip')) {
        const zip = await JSZip.loadAsync(file);
        let mergedTokens: any = {};

        const files = Object.keys(zip.files).filter(name => name.endsWith('.json'));

        for (const fileName of files) {
            const content = await zip.files[fileName].async('string');
            try {
                const json = JSON.parse(content);
                mergedTokens = deepMerge(mergedTokens, json);
            } catch (e) {
                console.error(`Failed to parse ${fileName} in ZIP`, e);
            }
        }

        return mergedTokens;
    }

    throw new Error('Unsupported file format');
}
