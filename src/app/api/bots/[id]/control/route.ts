import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    if (!["start", "stop", "restart"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Use: start, stop, or restart" },
        { status: 400 }
      );
    }

    const bot = await prisma.bot.findUnique({ where: { id } });
    if (!bot) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 });
    }

    let newStatus: string;
    let logMessage: string;

    switch (action) {
      case "start":
        newStatus = "running";
        logMessage = "Bot started";
        break;
      case "stop":
        newStatus = "stopped";
        logMessage = "Bot stopped";
        break;
      case "restart":
        newStatus = "running";
        logMessage = "Bot restarted";
        break;
      default:
        newStatus = bot.status;
        logMessage = "Unknown action";
    }

    const updatedBot = await prisma.bot.update({
      where: { id },
      data: { status: newStatus },
    });

    await prisma.log.create({
      data: {
        botId: id,
        level: "info",
        message: logMessage,
      },
    });

    return NextResponse.json(updatedBot);
  } catch (error) {
    console.error("Failed to control bot:", error);
    return NextResponse.json(
      { error: "Failed to control bot" },
      { status: 500 }
    );
  }
}
