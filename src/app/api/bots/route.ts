import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const bots = await prisma.bot.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { logs: true },
        },
      },
    });
    return NextResponse.json(bots);
  } catch (error) {
    console.error("Failed to fetch bots:", error);
    return NextResponse.json(
      { error: "Failed to fetch bots" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, type, config } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: "Name and type are required" },
        { status: 400 }
      );
    }

    const bot = await prisma.bot.create({
      data: {
        name,
        description,
        type,
        config: JSON.stringify(config || {}),
      },
    });

    // Create initial log
    await prisma.log.create({
      data: {
        botId: bot.id,
        level: "info",
        message: `Bot "${name}" created successfully`,
      },
    });

    return NextResponse.json(bot, { status: 201 });
  } catch (error) {
    console.error("Failed to create bot:", error);
    return NextResponse.json(
      { error: "Failed to create bot" },
      { status: 500 }
    );
  }
}
