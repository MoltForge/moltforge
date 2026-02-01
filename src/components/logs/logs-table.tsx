"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RefreshCw, ScrollText } from "lucide-react";
import { useRouter } from "next/navigation";

interface LogData {
  id: string;
  botId: string;
  level: string;
  message: string;
  metadata: string | null;
  timestamp: Date;
  bot: {
    name: string;
  };
}

interface BotData {
  id: string;
  name: string;
}

export function LogsTable({
  initialLogs,
  bots,
}: {
  initialLogs: LogData[];
  bots: BotData[];
}) {
  const [logs] = useState(initialLogs);
  const [selectedBot, setSelectedBot] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const router = useRouter();

  const filteredLogs = logs.filter((log) => {
    if (selectedBot && log.botId !== selectedBot) return false;
    if (selectedLevel && log.level !== selectedLevel) return false;
    return true;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case "error":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "warn":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      default:
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    }
  };

  if (logs.length === 0) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ScrollText className="h-12 w-12 text-zinc-600 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No logs yet</h3>
          <p className="text-zinc-500 text-sm">
            Logs will appear here when bots are active
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">Activity Logs</CardTitle>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedLevel(null)}
              className={!selectedLevel ? "bg-zinc-800" : ""}
            >
              All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedLevel("info")}
              className={selectedLevel === "info" ? "bg-zinc-800" : ""}
            >
              Info
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedLevel("warn")}
              className={selectedLevel === "warn" ? "bg-zinc-800" : ""}
            >
              Warn
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedLevel("error")}
              className={selectedLevel === "error" ? "bg-zinc-800" : ""}
            >
              Error
            </Button>
          </div>
          <select
            value={selectedBot || ""}
            onChange={(e) => setSelectedBot(e.target.value || null)}
            className="h-9 rounded-md bg-zinc-800 border-zinc-700 text-white text-sm px-3"
          >
            <option value="">All Bots</option>
            {bots.map((bot) => (
              <option key={bot.id} value={bot.id}>
                {bot.name}
              </option>
            ))}
          </select>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.refresh()}
            className="h-9 w-9"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px]">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-400">Time</TableHead>
                <TableHead className="text-zinc-400">Level</TableHead>
                <TableHead className="text-zinc-400">Bot</TableHead>
                <TableHead className="text-zinc-400">Message</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow
                  key={log.id}
                  className="border-zinc-800 hover:bg-zinc-800/50"
                >
                  <TableCell className="text-zinc-500 text-sm whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge className={getLevelColor(log.level)}>
                      {log.level}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-zinc-400">
                    {log.bot.name}
                  </TableCell>
                  <TableCell className="text-white max-w-md truncate">
                    {log.message}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
