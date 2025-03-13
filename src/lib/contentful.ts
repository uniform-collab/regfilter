import { createClient } from 'contentful';

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

export async function getEntries(contentType: string) {
    try {
        const response = await client.getEntries({
            content_type: contentType,
            include: 2, // Include 2 levels of linked entries
        });

        return response.items;
    } catch (error) {
        console.error('Error fetching entries from Contentful:', error);
        throw error;
    }
}

export async function getEntryById(entryId: string) {
    try {
        const entry = await client.getEntry(entryId, {
            include: 10,
        });

        return entry;
    } catch (error) {
        console.error('Error fetching entry from Contentful:', error);
        throw error;
    }
} 