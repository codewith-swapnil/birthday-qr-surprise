import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Wish from '@/models/Wish';

/* ─────────────────────────────────────────────────────────
   POST /api/wishes
   Body: { slug, url, data: WishData }
   Saves a new wish (or returns the existing one if slug is taken).
───────────────────────────────────────────────────────── */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { slug, url, data } = body as {
            slug: string;
            url: string;
            data: {
                name: string;
                day: number;
                month: string;
                message: string;
                createdAt: string;
                images?: string[];
            };
        };

        /* ── Basic validation ── */
        if (!slug || !url || !data?.name || !data?.day || !data?.month) {
            return NextResponse.json(
                { error: 'Missing required fields: slug, url, data.name, data.day, data.month' },
                { status: 400 }
            );
        }

        await connectDB();

        /* ── Upsert: if slug already exists return it, otherwise create ── */
        const wish = await Wish.findOneAndUpdate(
            { slug },
            { $setOnInsert: { slug, url, data } },
            {
                upsert: true,
                returnDocument: 'after',  // ← was: new: true
                runValidators: true,
            }
        );

        return NextResponse.json(
            { success: true, slug: wish.slug, id: wish._id },
            { status: 201 }
        );
    } catch (err: unknown) {
        console.error('[POST /api/wishes]', err);
        const message = err instanceof Error ? err.message : 'Internal server error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}