import { prisma } from "@/lib/db";
import { BotList } from "@/components/bots/bot-list";
import { CreateBotDialog } from "@/components/bots/create-bot-dialog";

async function getBots() {
  return prisma.bot.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { logs: true },
      },
    },
  });
}

export default async function BotsPage() {
  const bots = await getBots();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Bots</h1>
          <p className="text-zinc-400">Manage your AI bots</p>
        </div>
        <CreateBotDialog />
      </div>

      <BotList initialBots={bots} />
    </div>
  );
}
