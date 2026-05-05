import { NextResponse } from "next/server";
import { z } from "zod";
import { login } from "@/lib/auth";

const bodySchema = z.object({
  slug: z.string().trim().min(1),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const ok = await login(parsed.data.slug, parsed.data.password);
  if (!ok) {
    return NextResponse.json({ error: "Неверный логин или пароль" }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
