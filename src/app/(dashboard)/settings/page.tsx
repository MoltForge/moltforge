import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cpu, Database, Globe, Shield } from "lucide-react";

export default function SettingsPage() {
  const systemInfo = [
    {
      title: "Platform",
      value: "MoltForge v0.1.0",
      icon: Cpu,
      color: "text-emerald-500",
    },
    {
      title: "Database",
      value: "SQLite (Development)",
      icon: Database,
      color: "text-blue-500",
    },
    {
      title: "API Status",
      value: "Online",
      icon: Globe,
      color: "text-green-500",
    },
    {
      title: "Security",
      value: "Enabled",
      icon: Shield,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-zinc-400">Platform configuration and information</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {systemInfo.map((info) => (
          <Card key={info.title} className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className={`p-2 rounded-lg bg-zinc-800`}>
                <info.icon className={`h-5 w-5 ${info.color}`} />
              </div>
              <div>
                <CardTitle className="text-sm font-medium text-zinc-400">
                  {info.title}
                </CardTitle>
                <p className="text-lg font-semibold text-white">{info.value}</p>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">API Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-800">
            <div>
              <p className="text-sm font-medium text-white">REST API</p>
              <p className="text-xs text-zinc-500">
                Available at /api/bots and /api/logs
              </p>
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
              Active
            </Badge>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-800">
            <div>
              <p className="text-sm font-medium text-white">Bot Types</p>
              <p className="text-xs text-zinc-500">
                Trading, Chat, Automation, Custom
              </p>
            </div>
            <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
              4 Types
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">About</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-zinc-400 text-sm leading-relaxed">
            MoltForge is a platform for managing and running AI bots. It
            provides a unified interface for creating, monitoring, and
            controlling various types of bots including trading bots, chat
            bots, and automation bots.
          </p>
          <div className="mt-4 flex gap-2">
            <Badge variant="outline" className="border-zinc-700 text-zinc-400">
              Next.js 14
            </Badge>
            <Badge variant="outline" className="border-zinc-700 text-zinc-400">
              Prisma
            </Badge>
            <Badge variant="outline" className="border-zinc-700 text-zinc-400">
              TailwindCSS
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
