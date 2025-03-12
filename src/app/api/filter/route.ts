import { NextRequest, NextResponse } from "next/server";
import { filterByProvince } from "@/lib/regionalFilter";
import { extractHeadings } from "@/lib/contentCleanup";
import sample from "../../../../content/sample.json";

export async function GET(req: NextRequest) {
    // Get search params
    const { searchParams } = new URL(req.url);
    const province = searchParams.get("province");

    const filteredData = filterByProvince(sample, province!, false);

    const cleanedData = extractHeadings(filteredData, true);

    return NextResponse.json(cleanedData);
}