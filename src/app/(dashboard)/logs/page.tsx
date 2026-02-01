import { prisma } from "@/lib/db";
import { LogsTable } from "@/components/logs/logs-table";

async function getLogs() {
  return prisma.log.findMany({
    orderBy: { timestamp: "desc" },
    take: 100,
    include: {
      bot: {
        select: { name: true },
      },
    },
  });
}

async function getBots() {
  return prisma.bot.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export default async function LogsPage() {
  const [logs, bots] = await Promise.all([getLogs(), getBots()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Logs</h1>
        <p className="text-zinc-400">View and filter bot activity logs</p>
      </div>

      <LogsTable initialLogs={logs} bots={bots} />
    </div>
  );
}
