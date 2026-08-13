import { NextRequest } from "next/server";
import { z } from "zod";
import { createSession, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { handleApiError, jsonError, jsonOk } from "@/lib/api";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = loginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
      return jsonError("Invalid email or password.", 401);
    }

    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
    });

    return jsonOk({ id: user.id, email: user.email, name: user.name });
  } catch (error) {
    return handleApiError(error);
  }
}
