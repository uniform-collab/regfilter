/**
 * Recursively processes an object to keep only "heading" fields
 * @param data The input data to process
 * @param flatten If true, returns a flat array of all headings instead of preserving structure
 * @returns A new object containing only heading fields or an array of all headings if flatten is true
 */
export function extractHeadings<T>(data: T, flatten: boolean = false): any {
    // For flattened output, we'll collect all headings in this array
    const headingsArray: string[] = [];

    // Inner recursive function to collect headings when flatten=true
    function collectHeadings(data: any): void {
        if (data === null || data === undefined) {
            return;
        }

        if (Array.isArray(data)) {
            for (const item of data) {
                collectHeadings(item);
            }
            return;
        }

        if (typeof data === 'object') {
            for (const key of Object.keys(data)) {
                if (key === 'heading' && typeof data[key] === 'string') {
                    headingsArray.push(data[key]);
                } else {
                    collectHeadings(data[key]);
                }
            }
        }
    }

    // If flatten is true, collect all headings into a flat array
    if (flatten) {
        collectHeadings(data);
        return headingsArray;
    }

    // Otherwise, proceed with the original nested structure logic
    // Handle null or undefined
    if (data === null || data === undefined) {
        return null;
    }

    // Handle arrays
    if (Array.isArray(data)) {
        return data.map(item => extractHeadings(item)).filter(item => item !== null);
    }

    // Handle objects
    if (typeof data === 'object') {
        const result: Record<string, any> = {};

        // Process all keys in the object
        for (const key of Object.keys(data as object)) {
            // Keep "heading" fields
            if (key === 'heading') {
                result[key] = (data as Record<string, any>)[key];
            }
            // For "fields" key, process it recursively
            else if (key === 'fields') {
                const fields = extractHeadings((data as Record<string, any>)[key]);
                if (fields && Object.keys(fields).length > 0) {
                    result[key] = fields;
                }
            }
            // For "content", "listItem", etc., process recursively
            else if (['content', 'listItem', 'itemListElement'].includes(key)) {
                const processed = extractHeadings((data as Record<string, any>)[key]);
                if (processed && (Array.isArray(processed) ? processed.length > 0 : Object.keys(processed).length > 0)) {
                    result[key] = processed;
                }
            }
        }

        // Only return result if it has content
        return Object.keys(result).length > 0 ? result : null;
    }

    // Return primitive values as null (since they're not what we're looking for)
    return null;
}