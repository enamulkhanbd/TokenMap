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
    if (file.name.toLowerCase().endsWith('.json')) {
        const text = await file.text();
        return JSON.parse(text);
    }

    if (file.name.toLowerCase().endsWith('.zip')) {
        const zip = await JSZip.loadAsync(file);
        let mergedTokens: any = {};
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
                const json = JSON.parse(content);
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
