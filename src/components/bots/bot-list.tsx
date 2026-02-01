"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bot,
  MoreVertical,
  Play,
  Square,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface BotData {
  id: string;
  name: string;
  description: string | null;
  type: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    logs: number;
  };
}

export function BotList({ initialBots }: { initialBots: BotData[] }) {
  const [bots, setBots] = useState(initialBots);
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  const controlBot = async (id: string, action: string) => {
    setLoading(id);
    try {
      const res = await fetch(`/api/bots/${id}/control`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        const updatedBot = await res.json();
        setBots((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: updatedBot.status } : b))
        );
      }
    } catch (error) {
      console.error("Failed to control bot:", error);
    } finally {
      setLoading(null);
    }
  };

  const deleteBot = async (id: string) => {
    if (!confirm("Are you sure you want to delete this bot?")) return;

    setLoading(id);
    try {
      const res = await fetch(`/api/bots/${id}`, { method: "DELETE" });
      if (res.ok) {
        setBots((prev) => prev.filter((b) => b.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete bot:", error);
    } finally {
      setLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "error":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "trading":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "chat":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "automation":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      default:
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    }
  };

  if (bots.length === 0) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Bot className="h-12 w-12 text-zinc-600 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No bots yet</h3>
          <p className="text-zinc-500 text-sm">
            Create your first bot to get started
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {bots.map((bot) => (
        <Card
          key={bot.id}
          className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
          onClick={() => router.push(`/bots/${bot.id}`)}
        >
          <CardHeader className="flex flex-row items-start justify-between pb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800">
                <Bot className="h-5 w-5 text-zinc-400" />
              </div>
              <div>
                <CardTitle className="text-base text-white">{bot.name}</CardTitle>
                <div className="flex gap-2 mt-1">
                  <Badge className={getTypeColor(bot.type)}>{bot.type}</Badge>
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800">
                {bot.status !== "running" && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      controlBot(bot.id, "start");
                    }}
                    className="text-emerald-500 focus:text-emerald-500"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start
                  </DropdownMenuItem>
                )}
                {bot.status === "running" && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      controlBot(bot.id, "stop");
                    }}
                    className="text-yellow-500 focus:text-yellow-500"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Stop
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    controlBot(bot.id, "restart");
                  }}
                  className="text-blue-500 focus:text-blue-500"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restart
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteBot(bot.id);
                  }}
                  className="text-red-500 focus:text-red-500"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent>
            {bot.description && (
              <p className="text-sm text-zinc-500 mb-3 line-clamp-2">
                {bot.description}
              </p>
            )}
            <div className="flex items-center justify-between">
              <Badge className={getStatusColor(bot.status)}>
                {loading === bot.id ? "..." : bot.status}
              </Badge>
              <span className="text-xs text-zinc-500">
                {bot._count.logs} logs
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
