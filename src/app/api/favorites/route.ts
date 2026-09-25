import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { favorite } from "@/db/schema";
import { auth } from "@/lib/auth";

async function getAuthenticatedUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.user ?? null;
}

function isValidArtworkSlug(value: unknown): value is string {
  return (
    typeof value === "string" && value.trim().length > 0 && value.length <= 300
  );
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return Response.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const artworkSlug = body?.artworkSlug;

  if (!isValidArtworkSlug(artworkSlug)) {
    return Response.json({ error: "Invalid artwork." }, { status: 400 });
  }

  await db
    .insert(favorite)
    .values({ userId: user.id, artworkSlug: artworkSlug.trim() })
    .onConflictDoNothing({
      target: [favorite.userId, favorite.artworkSlug],
    });

  return Response.json({ isFavorite: true });
}

export async function DELETE(request: Request) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return Response.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const artworkSlug = body?.artworkSlug;

  if (!isValidArtworkSlug(artworkSlug)) {
    return Response.json({ error: "Invalid artwork." }, { status: 400 });
  }

  await db
    .delete(favorite)
    .where(
      and(
        eq(favorite.userId, user.id),
        eq(favorite.artworkSlug, artworkSlug.trim()),
      ),
    );

  return Response.json({ isFavorite: false });
}
