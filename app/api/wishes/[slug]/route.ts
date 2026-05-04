import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Wish from '@/models/Wish';

/* ─────────────────────────────────────────────────────────
   GET /api/wishes/[slug]
   Returns the wish document and increments viewCount.
───────────────────────────────────────────────────────── */
export async function GET(
    _req: NextRequest,
    { params }: { params: { slug: string } }
) {
    try {
        const { slug } = params;

        if (!slug) {
            return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
        }

        await connectDB();

        const wish = await Wish.findOneAndUpdate(
            { slug },
            { $inc: { viewCount: 1 } },
            { returnDocument: 'after' }  // ← was: new: true
        ).lean();

        if (!wish) {
            return NextResponse.json({ error: 'Wish not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, wish }, { status: 200 });
    } catch (err: unknown) {
        console.error('[GET /api/wishes/:slug]', err);
        const message = err instanceof Error ? err.message : 'Internal server error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}