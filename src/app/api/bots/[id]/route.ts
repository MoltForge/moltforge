import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bot = await prisma.bot.findUnique({
      where: { id },
      include: {
        logs: {
          orderBy: { timestamp: "desc" },
          take: 50,
        },
      },
    });

    if (!bot) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 });
    }

    return NextResponse.json(bot);
  } catch (error) {
    console.error("Failed to fetch bot:", error);
    return NextResponse.json(
      { error: "Failed to fetch bot" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, type, status, config } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (type !== undefined) updateData.type = type;
    if (status !== undefined) updateData.status = status;
    if (config !== undefined) updateData.config = JSON.stringify(config);

    const bot = await prisma.bot.update({
      where: { id },
      data: updateData,
    });

    // Log status changes
    if (status !== undefined) {
      await prisma.log.create({
        data: {
          botId: id,
          level: status === "error" ? "error" : "info",
          message: `Bot status changed to "${status}"`,
        },
      });
    }

    return NextResponse.json(bot);
  } catch (error) {
    console.error("Failed to update bot:", error);
    return NextResponse.json(
      { error: "Failed to update bot" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.bot.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete bot:", error);
    return NextResponse.json(
      { error: "Failed to delete bot" },
      { status: 500 }
    );
  }
}
