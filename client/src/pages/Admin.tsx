import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { startLogin } from "@/const";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  Shield,
  Play,
  RefreshCw,
  LogOut,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Admin() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);

  const logsQuery = trpc.admin.customerLogs.useQuery(
    { customerId: selectedCustomerId! },
    { enabled: !!selectedCustomerId }
  );

  const customersQuery = trpc.admin.customers.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const analyticsQuery = trpc.admin.analyticsSummary.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const recentEventsQuery = trpc.admin.recentEvents.useQuery(
    { limit: 20 },
    { enabled: isAuthenticated && user?.role === "admin" }
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-violet-400" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center px-6">
        <Card className="bg-zinc-900/50 border-zinc-800/50 max-w-sm w-full">
          <CardContent className="p-8 text-center">
            <Shield className="w-12 h-12 text-violet-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Admin Access Required</h2>
            <p className="text-zinc-400 text-sm mb-6">Please sign in with your admin account to continue.</p>
            <Button
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white"
              onClick={() => startLogin()}
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center px-6">
        <Card className="bg-zinc-900/50 border-zinc-800/50 max-w-sm w-full">
          <CardContent className="p-8 text-center">
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p className="text-zinc-400 text-sm mb-6">You don't have admin privileges.</p>
            <Button variant="outline" className="border-zinc-700 text-zinc-300" onClick={() => navigate("/")}>
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/10 text-green-400 border-green-500/20">Active</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500/10 text-red-400 border-red-500/20">Cancelled</Badge>;
      case "expired":
        return <Badge className="bg-zinc-500/10 text-zinc-400 border-zinc-500/20">Expired</Badge>;
      case "past_due":
        return <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">Past Due</Badge>;
      default:
        return <Badge className="bg-zinc-500/10 text-zinc-400 border-zinc-500/20">{status}</Badge>;
    }
  };

  const customers = customersQuery.data || [];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Admin Nav */}
      <nav className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Play className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Viewora<span className="text-violet-400">TV</span>
            </span>
            <Badge variant="outline" className="border-violet-500/30 text-violet-300 ml-2">
              Admin
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-400">{user?.name || user?.email}</span>
            <Button
              variant="outline"
              size="sm"
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              onClick={() => logout()}
            >
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-zinc-900/50 border-zinc-800/50">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{customers.length}</p>
                  <p className="text-xs text-zinc-500">Total Customers</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800/50">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {customers.filter((c: any) => c.status === "active").length}
                  </p>
                  <p className="text-xs text-zinc-500">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800/50">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {customers.filter((c: any) => c.status === "past_due").length}
                  </p>
                  <p className="text-xs text-zinc-500">Past Due</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800/50">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {customers.filter((c: any) => c.status === "cancelled" || c.status === "expired").length}
                  </p>
                  <p className="text-xs text-zinc-500">Cancelled/Expired</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Summary */}
        {analyticsQuery.data && (
          <Card className="bg-zinc-900/50 border-zinc-800/50 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-violet-400" />
                <h2 className="text-lg font-semibold text-white">Analytics</h2>
                <Badge variant="outline" className="border-zinc-700 text-zinc-400 ml-2">
                  {analyticsQuery.data.totalEvents} total events
                </Badge>
                <Badge variant="outline" className="border-green-500/30 text-green-400 ml-1">
                  {analyticsQuery.data.todayEvents} today
                </Badge>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" /> Top Events
                  </h3>
                  <div className="space-y-2">
                    {analyticsQuery.data.topEvents.map((e: any) => (
                      <div key={e.event} className="flex items-center justify-between text-sm">
                        <span className="text-zinc-300 font-mono text-xs">{e.event}</span>
                        <span className="text-zinc-500">{e.count}</span>
                      </div>
                    ))}
                    {analyticsQuery.data.topEvents.length === 0 && (
                      <p className="text-xs text-zinc-500">No events tracked yet</p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-zinc-400 mb-3">Top Pages</h3>
                  <div className="space-y-2">
                    {analyticsQuery.data.topPages.map((p: any) => (
                      <div key={p.page} className="flex items-center justify-between text-sm">
                        <span className="text-zinc-300">{p.page}</span>
                        <span className="text-zinc-500">{p.count}</span>
                      </div>
                    ))}
                    {analyticsQuery.data.topPages.length === 0 && (
                      <p className="text-xs text-zinc-500">No page views yet</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Events */}
        {recentEventsQuery.data && recentEventsQuery.data.length > 0 && (
          <Card className="bg-zinc-900/50 border-zinc-800/50 mb-8">
            <CardContent className="p-0">
              <div className="p-6 border-b border-zinc-800/50 flex items-center gap-2">
                <Eye className="w-4 h-4 text-violet-400" />
                <h2 className="text-lg font-semibold text-white">Recent Events</h2>
              </div>
              <ScrollArea className="max-h-[300px]">
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800/50 hover:bg-transparent">
                      <TableHead className="text-zinc-400">Event</TableHead>
                      <TableHead className="text-zinc-400">Page</TableHead>
                      <TableHead className="text-zinc-400">Session</TableHead>
                      <TableHead className="text-zinc-400">Source</TableHead>
                      <TableHead className="text-zinc-400">Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentEventsQuery.data.map((ev: any, i: number) => (
                      <TableRow key={i} className="border-zinc-800/50">
                        <TableCell className="font-mono text-xs text-zinc-300">{ev.event}</TableCell>
                        <TableCell className="text-xs text-zinc-400">{ev.page || "-"}</TableCell>
                        <TableCell className="text-xs text-zinc-500 font-mono">{ev.sessionId?.slice(0, 8) || "-"}</TableCell>
                        <TableCell className="text-xs text-zinc-400">{ev.utmSource || ev.referrer?.slice(0, 30) || "-"}</TableCell>
                        <TableCell className="text-xs text-zinc-500">{ev.createdAt ? new Date(ev.createdAt).toLocaleString() : "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Customer Table */}
        <Card className="bg-zinc-900/50 border-zinc-800/50">
          <CardContent className="p-0">
            <div className="p-6 border-b border-zinc-800/50 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Customers</h2>
              <Button
                variant="outline"
                size="sm"
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                onClick={() => customersQuery.refetch()}
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${customersQuery.isFetching ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>

            {customersQuery.isLoading ? (
              <div className="p-12 text-center">
                <RefreshCw className="w-6 h-6 animate-spin text-violet-400 mx-auto mb-2" />
                <p className="text-sm text-zinc-500">Loading customers...</p>
              </div>
            ) : customers.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                <p className="text-sm text-zinc-500">No customers yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800/50 hover:bg-transparent">
                      <TableHead className="text-zinc-400">Customer</TableHead>
                      <TableHead className="text-zinc-400">Plan</TableHead>
                      <TableHead className="text-zinc-400">Status</TableHead>
                      <TableHead className="text-zinc-400">Username</TableHead>
                      <TableHead className="text-zinc-400">Password</TableHead>
                      <TableHead className="text-zinc-400">Expires</TableHead>
                      <TableHead className="text-zinc-400">Created</TableHead>
                      <TableHead className="text-zinc-400">History</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer: any) => (
                      <TableRow key={customer.id} className="border-zinc-800/50 hover:bg-zinc-800/20">
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium text-white">{customer.name || "—"}</p>
                            <p className="text-xs text-zinc-500">{customer.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-zinc-300">{customer.planName || "—"}</TableCell>
                        <TableCell>{getStatusBadge(customer.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <code className="text-xs text-violet-300 bg-violet-500/10 px-2 py-0.5 rounded">
                              {customer.xtreamUsername || "—"}
                            </code>
                            {customer.xtreamUsername && (
                              <button
                                onClick={() => copyToClipboard(customer.xtreamUsername, customer.id)}
                                className="text-zinc-500 hover:text-zinc-300"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <code className="text-xs text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded">
                              {customer.xtreamPassword || "—"}
                            </code>
                            {customer.xtreamPassword && (
                              <button
                                onClick={() => copyToClipboard(customer.xtreamPassword, customer.id * 1000)}
                                className="text-zinc-500 hover:text-zinc-300"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-zinc-400">
                          {customer.subscriptionEnd
                            ? new Date(customer.subscriptionEnd).toLocaleDateString()
                            : "—"}
                        </TableCell>
                        <TableCell className="text-xs text-zinc-500">
                          {new Date(customer.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-xs h-7"
                            onClick={() => setSelectedCustomerId(customer.id)}
                          >
                            Logs
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Provisioning Logs Dialog */}
      <Dialog open={!!selectedCustomerId} onOpenChange={(open) => !open && setSelectedCustomerId(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Provisioning & Renewal History</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[400px]">
            {logsQuery.isLoading ? (
              <div className="p-6 text-center">
                <RefreshCw className="w-5 h-5 animate-spin text-violet-400 mx-auto mb-2" />
                <p className="text-sm text-zinc-500">Loading logs...</p>
              </div>
            ) : !logsQuery.data?.length ? (
              <div className="p-6 text-center">
                <p className="text-sm text-zinc-500">No provisioning logs found.</p>
              </div>
            ) : (
              <div className="space-y-3 p-2">
                {logsQuery.data.map((log: any) => (
                  <div key={log.id} className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/50">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          className={log.success
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                          }
                        >
                          {log.success ? "Success" : "Failed"}
                        </Badge>
                        <span className="text-xs font-medium text-zinc-300 capitalize">{log.action}</span>
                      </div>
                      <span className="text-xs text-zinc-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400">
                      Event: {log.eventType}{log.stripeEventId ? ` (${log.stripeEventId.slice(0, 20)}...)` : ""}
                    </p>
                    {log.errorMessage && (
                      <p className="text-xs text-red-400 mt-1">Error: {log.errorMessage}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
