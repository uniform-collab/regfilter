import { NextRequest, NextResponse } from "next/server";
import { filterByProvince } from "@/lib/regionalFilter";
import { extractHeadings } from "@/lib/contentCleanup";
import { getEntryById } from "@/lib/contentful";

export async function GET(req: NextRequest) {
    // Get search params
    const { searchParams } = new URL(req.url);
    const province = searchParams.get("province");
    const headings = searchParams.get("headings");
    const flat = searchParams.get("flat");
    const entryId = searchParams.get("entryId");
    if (!entryId) {
        return NextResponse.json(
            { error: 'No entryId provided' },
            { status: 400 }
        );
    }

    try {
        let data;

        data = await getEntryById(entryId);
        // Wrap single entry in array for consistent filtering
        data = [data];

        // Apply filtering if province is specified
        const filteredData = province ? filterByProvince(data, province, false) : data;

        // Apply heading extraction if requested
        const cleanedData = headings === "true" ? extractHeadings(filteredData?.[0], flat === "true") : filteredData;

        return NextResponse.json(cleanedData);
    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json(
            { error: 'Failed to fetch or process data' },
            { status: 500 }
        );
    }
}