import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db";
import { Bot, Activity, AlertTriangle, Clock } from "lucide-react";

async function getStats() {
  const totalBots = await prisma.bot.count();
  const runningBots = await prisma.bot.count({ where: { status: "running" } });
  const errorBots = await prisma.bot.count({ where: { status: "error" } });
  const recentLogs = await prisma.log.count({
    where: {
      timestamp: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    },
  });

  return { totalBots, runningBots, errorBots, recentLogs };
}

async function getRecentBots() {
  return prisma.bot.findMany({
    take: 5,
    orderBy: { updatedAt: "desc" },
    include: {
      _count: {
        select: { logs: true },
      },
    },
  });
}

async function getRecentLogs() {
  return prisma.log.findMany({
    take: 10,
    orderBy: { timestamp: "desc" },
    include: {
      bot: {
        select: { name: true },
      },
    },
  });
}

export default async function DashboardPage() {
  const stats = await getStats();
  const recentBots = await getRecentBots();
  const recentLogs = await getRecentLogs();

  const statCards = [
    {
      title: "Total Bots",
      value: stats.totalBots,
      icon: Bot,
      color: "text-blue-500",
    },
    {
      title: "Running",
      value: stats.runningBots,
      icon: Activity,
      color: "text-emerald-500",
    },
    {
      title: "Errors",
      value: stats.errorBots,
      icon: AlertTriangle,
      color: "text-red-500",
    },
    {
      title: "Logs (24h)",
      value: stats.recentLogs,
      icon: Clock,
      color: "text-orange-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-zinc-400">Overview of your MoltForge runtime</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Recent Bots</CardTitle>
          </CardHeader>
          <CardContent>
            {recentBots.length === 0 ? (
              <p className="text-zinc-500 text-sm">No bots yet. Create one to get started.</p>
            ) : (
              <div className="space-y-4">
                {recentBots.map((bot) => (
                  <div
                    key={bot.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800">
                        <Bot className="h-5 w-5 text-zinc-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {bot.name}
                        </p>
                        <p className="text-xs text-zinc-500">{bot.type}</p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        bot.status === "running"
                          ? "default"
                          : bot.status === "error"
                          ? "destructive"
                          : "secondary"
                      }
                      className={
                        bot.status === "running"
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          : bot.status === "error"
                          ? "bg-red-500/10 text-red-500 border-red-500/20"
                          : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                      }
                    >
                      {bot.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Recent Logs</CardTitle>
          </CardHeader>
          <CardContent>
            {recentLogs.length === 0 ? (
              <p className="text-zinc-500 text-sm">No logs yet.</p>
            ) : (
              <div className="space-y-3">
                {recentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 text-sm"
                  >
                    <div
                      className={`mt-1 h-2 w-2 rounded-full ${
                        log.level === "error"
                          ? "bg-red-500"
                          : log.level === "warn"
                          ? "bg-yellow-500"
                          : "bg-emerald-500"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-zinc-300 truncate">{log.message}</p>
                      <p className="text-xs text-zinc-500">
                        {log.bot.name} •{" "}
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
