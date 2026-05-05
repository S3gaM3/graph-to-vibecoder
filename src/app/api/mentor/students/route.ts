import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/api-user";
import { prisma } from "@/lib/prisma";
import { getStudentsOverview } from "@/lib/progress";

export async function GET() {
  const userId = await requireUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user || user.role !== "mentor") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const students = await getStudentsOverview();
  return NextResponse.json({ students });
}
