import { createClient } from 'contentful';
import resolveResponse from 'contentful-resolve-response';

if (!process.env.CONTENTFUL_SPACE_ID) {
    throw new Error('CONTENTFUL_SPACE_ID environment variable is not set');
}

if (!process.env.CONTENTFUL_ACCESS_TOKEN) {
    throw new Error('CONTENTFUL_ACCESS_TOKEN environment variable is not set');
}

const client = createClient({
    space: process.env.CONTENTFUL_SPACE_ID,
    accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
    environment: process.env.CONTENTFUL_ENVIRONMENT || 'master',
});

export async function getEntryById(entryId: string) {
    try {
        const entry = await client.getEntry(entryId, {
            include: 10,
        });

        // Resolve linked entries - wrap in an array and then extract the first item
        // This is because resolveResponse expects an array of entries
        const resolvedEntries = resolveResponse({
            items: [entry],
            includes: (entry as any).includes || {},
            total: 1,
            skip: 0,
            limit: 1,
        });

        return resolvedEntries[0];
    } catch (error) {
        console.error('Error fetching entry from Contentful:', error);
        throw error;
    }
} 