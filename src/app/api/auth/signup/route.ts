import { NextRequest } from "next/server";
import { authSchema } from "@/lib/validators";
import { createSession, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { handleApiError, jsonError, jsonOk } from "@/lib/api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = authSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
    if (existing) {
      return jsonError("An account with this email already exists.", 409);
    }

    const user = await prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        name: input.name || input.email.split("@")[0],
        passwordHash: await hashPassword(input.password),
      },
    });

    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
    });

    return jsonOk({ id: user.id, email: user.email, name: user.name }, undefined, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
