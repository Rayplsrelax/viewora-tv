import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { startLogin } from "@/const";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Shield, ArrowLeft, Users, Clock, CheckCircle, XCircle, Send, SkipForward,
  AlertTriangle, TrendingUp, UserPlus, Gift, Activity, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    requested: "bg-blue-500/20 text-blue-300",
    waitlisted: "bg-amber-500/20 text-amber-300",
    approved: "bg-green-500/20 text-green-300",
    credentials_sent: "bg-emerald-500/20 text-emerald-300",
    activated: "bg-teal-500/20 text-teal-300",
    converted: "bg-violet-500/20 text-violet-300",
    expired: "bg-gray-500/20 text-gray-300",
    disqualified: "bg-red-500/20 text-red-300",
    queued: "bg-blue-500/20 text-blue-300",
    drafted: "bg-amber-500/20 text-amber-300",
    sent: "bg-green-500/20 text-green-300",
    skipped: "bg-gray-500/20 text-gray-300",
    completed: "bg-emerald-500/20 text-emerald-300",
    failed: "bg-red-500/20 text-red-300",
    active: "bg-green-500/20 text-green-300",
    paused: "bg-amber-500/20 text-amber-300",
    banned: "bg-red-500/20 text-red-300",
    pending: "bg-blue-500/20 text-blue-300",
    applied: "bg-violet-500/20 text-violet-300",
    rejected: "bg-red-500/20 text-red-300",
  };
  return (
    <Badge className={colors[status] || "bg-gray-500/20 text-gray-300"}>
      {status}
    </Badge>
  );
}

function DailySummaryTab() {
  const summaryQuery = trpc.hermes.getDailySummary.useQuery();

  if (summaryQuery.isLoading) return <div className="p-4 text-muted-foreground">Loading summary...</div>;
  if (!summaryQuery.data) return <div className="p-4 text-muted-foreground">No data available.</div>;

  const { trials, followUps, affiliates: affStats } = summaryQuery.data;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="border-violet-500/20">
        <CardContent className="p-4 space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" /> Trial Slots Today
          </div>
          <div className="text-2xl font-bold">{trials.slotsUsedToday}/10</div>
          <div className="text-xs text-muted-foreground">{trials.slotsRemaining} remaining</div>
        </CardContent>
      </Card>
      <Card className="border-violet-500/20">
        <CardContent className="p-4 space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertTriangle className="w-4 h-4" /> Due Tasks
          </div>
          <div className="text-2xl font-bold">{followUps.dueNow}</div>
          <div className="text-xs text-red-400">{followUps.overdue} overdue</div>
        </CardContent>
      </Card>
      <Card className="border-violet-500/20">
        <CardContent className="p-4 space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="w-4 h-4" /> Conversion Rate
          </div>
          <div className="text-2xl font-bold">{trials.conversionRate}%</div>
          <div className="text-xs text-muted-foreground">{trials.activeTrials} active trials</div>
        </CardContent>
      </Card>
      <Card className="border-violet-500/20">
        <CardContent className="p-4 space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" /> Affiliates
          </div>
          <div className="text-2xl font-bold">{affStats.active}</div>
          <div className="text-xs text-muted-foreground">{affStats.totalReferrals} referrals, {affStats.creditsDue} credits due</div>
        </CardContent>
      </Card>
    </div>
  );
}

function TrialsTab() {
  const trialsQuery = trpc.hermes.getTrials.useQuery();
  const approveMutation = trpc.hermes.approveTrial.useMutation({
    onSuccess: () => { toast.success("Trial approved"); trialsQuery.refetch(); },
    onError: (e) => toast.error(e.message),
  });
  const disqualifyMutation = trpc.hermes.disqualifyTrial.useMutation({
    onSuccess: () => { toast.success("Trial disqualified"); trialsQuery.refetch(); },
    onError: (e) => toast.error(e.message),
  });

  if (trialsQuery.isLoading) return <div className="p-4 text-muted-foreground">Loading trials...</div>;

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Device</TableHead>
            <TableHead>Channel</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Requested</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trialsQuery.data?.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell className="font-medium">{lead.name}</TableCell>
              <TableCell className="text-xs">{lead.email}</TableCell>
              <TableCell>{lead.deviceType || "—"}</TableCell>
              <TableCell>{lead.preferredSupportChannel || "telegram"}</TableCell>
              <TableCell><StatusBadge status={lead.status} /></TableCell>
              <TableCell className="text-xs">{new Date(lead.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                {(lead.status === "requested" || lead.status === "waitlisted") && (
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-400 border-green-500/30 hover:bg-green-500/10"
                      onClick={() => approveMutation.mutate({ leadId: lead.id })}
                      disabled={approveMutation.isPending}
                    >
                      <CheckCircle className="w-3 h-3 mr-1" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-400 border-red-500/30 hover:bg-red-500/10"
                      onClick={() => disqualifyMutation.mutate({ leadId: lead.id })}
                      disabled={disqualifyMutation.isPending}
                    >
                      <XCircle className="w-3 h-3 mr-1" /> DQ
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
          {(!trialsQuery.data || trialsQuery.data.length === 0) && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                No trial requests yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function TasksTab() {
  const tasksQuery = trpc.hermes.getAllTasks.useQuery();
  const markSentMutation = trpc.hermes.markTaskSent.useMutation({
    onSuccess: () => { toast.success("Marked as sent"); tasksQuery.refetch(); },
  });
  const skipMutation = trpc.hermes.skipTask.useMutation({
    onSuccess: () => { toast.success("Task skipped"); tasksQuery.refetch(); },
  });
  const completeMutation = trpc.hermes.completeTask.useMutation({
    onSuccess: () => { toast.success("Task completed"); tasksQuery.refetch(); },
  });

  if (tasksQuery.isLoading) return <div className="p-4 text-muted-foreground">Loading tasks...</div>;

  const dueTasks = tasksQuery.data?.filter(t => t.status === "queued" && t.dueAt <= Date.now()) || [];
  const otherTasks = tasksQuery.data?.filter(t => !(t.status === "queued" && t.dueAt <= Date.now())) || [];

  return (
    <div className="space-y-4">
      {dueTasks.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-amber-400 mb-2 flex items-center gap-1">
            <AlertTriangle className="w-4 h-4" /> Due Now ({dueTasks.length})
          </h3>
          <div className="space-y-2">
            {dueTasks.map((task) => (
              <Card key={task.id} className="border-amber-500/20 bg-amber-500/5">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">{task.taskType}</Badge>
                        <Badge variant="secondary" className="text-xs">{task.channel}</Badge>
                        <StatusBadge status={task.priority} />
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{task.messageBody || "No message body"}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button size="sm" variant="outline" className="text-green-400" onClick={() => markSentMutation.mutate({ taskId: task.id })}>
                        <Send className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-gray-400" onClick={() => skipMutation.mutate({ taskId: task.id })}>
                        <SkipForward className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-violet-400" onClick={() => completeMutation.mutate({ taskId: task.id })}>
                        <CheckCircle className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-2">All Tasks</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Message</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {otherTasks.slice(0, 50).map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="text-xs">{task.taskType}</TableCell>
                  <TableCell>{task.channel}</TableCell>
                  <TableCell><StatusBadge status={task.status} /></TableCell>
                  <TableCell className="text-xs">{new Date(task.dueAt).toLocaleString()}</TableCell>
                  <TableCell className="text-xs max-w-[200px] truncate">{task.messageBody || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

function AffiliatesTab() {
  const affiliatesQuery = trpc.hermes.getAffiliates.useQuery();
  const createMutation = trpc.hermes.createAffiliate.useMutation({
    onSuccess: () => { toast.success("Affiliate created"); affiliatesQuery.refetch(); setShowForm(false); },
    onError: (e) => toast.error(e.message),
  });
  const toggleStatusMutation = trpc.hermes.updateAffiliateStatus.useMutation({
    onSuccess: () => { toast.success("Status updated"); affiliatesQuery.refetch(); },
  });

  const [showForm, setShowForm] = useState(false);
  const [newAffiliate, setNewAffiliate] = useState({ name: "", email: "", telegram: "", whatsapp: "", referralCode: "" });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-muted-foreground">Affiliates</h3>
        <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)}>
          <UserPlus className="w-4 h-4 mr-1" /> New Affiliate
        </Button>
      </div>

      {showForm && (
        <Card className="border-violet-500/20">
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Name *</Label>
                <Input value={newAffiliate.name} onChange={(e) => setNewAffiliate({ ...newAffiliate, name: e.target.value })} placeholder="Name" />
              </div>
              <div>
                <Label className="text-xs">Email *</Label>
                <Input value={newAffiliate.email} onChange={(e) => setNewAffiliate({ ...newAffiliate, email: e.target.value })} placeholder="Email" />
              </div>
              <div>
                <Label className="text-xs">Referral Code *</Label>
                <Input value={newAffiliate.referralCode} onChange={(e) => setNewAffiliate({ ...newAffiliate, referralCode: e.target.value })} placeholder="e.g. JOHN10" />
              </div>
              <div>
                <Label className="text-xs">Telegram</Label>
                <Input value={newAffiliate.telegram} onChange={(e) => setNewAffiliate({ ...newAffiliate, telegram: e.target.value })} placeholder="@username" />
              </div>
            </div>
            <Button size="sm" className="bg-violet-600 hover:bg-violet-700" onClick={() => createMutation.mutate(newAffiliate)} disabled={createMutation.isPending}>
              Create Affiliate
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Referrals</TableHead>
              <TableHead>Conversions</TableHead>
              <TableHead>Credits</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {affiliatesQuery.data?.map((aff) => (
              <TableRow key={aff.id}>
                <TableCell className="font-medium">{aff.name}</TableCell>
                <TableCell><code className="text-xs bg-muted px-1 rounded">{aff.referralCode}</code></TableCell>
                <TableCell><StatusBadge status={aff.status} /></TableCell>
                <TableCell>{aff.totalReferrals}</TableCell>
                <TableCell>{aff.paidConversions}</TableCell>
                <TableCell>{aff.creditsApplied}/{aff.creditsEarned}</TableCell>
                <TableCell>
                  {aff.status === "active" ? (
                    <Button size="sm" variant="outline" className="text-amber-400" onClick={() => toggleStatusMutation.mutate({ affiliateId: aff.id, status: "paused" })}>
                      Pause
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" className="text-green-400" onClick={() => toggleStatusMutation.mutate({ affiliateId: aff.id, status: "active" })}>
                      Activate
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {(!affiliatesQuery.data || affiliatesQuery.data.length === 0) && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No affiliates yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function CreditsTab() {
  const creditsQuery = trpc.hermes.getPendingCredits.useQuery();
  const approveMutation = trpc.hermes.applyServiceCredit.useMutation({
    onSuccess: () => { toast.success("Credit applied"); creditsQuery.refetch(); },
  });
  const rejectMutation = trpc.hermes.rejectServiceCredit.useMutation({
    onSuccess: () => { toast.success("Credit rejected"); creditsQuery.refetch(); },
  });

  if (creditsQuery.isLoading) return <div className="p-4 text-muted-foreground">Loading credits...</div>;

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {creditsQuery.data?.map((credit) => (
            <TableRow key={credit.id}>
              <TableCell className="text-xs">{credit.creditType}</TableCell>
              <TableCell>
                {credit.creditValueGbp ? `£${(credit.creditValueGbp / 100).toFixed(2)}` : credit.creditMonths ? `${credit.creditMonths} month(s)` : "—"}
              </TableCell>
              <TableCell><StatusBadge status={credit.status} /></TableCell>
              <TableCell className="text-xs">{new Date(credit.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                {credit.status === "pending" && (
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="text-green-400" onClick={() => approveMutation.mutate({ creditId: credit.id })}>
                      <CheckCircle className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-400" onClick={() => rejectMutation.mutate({ creditId: credit.id })}>
                      <XCircle className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
          {(!creditsQuery.data || creditsQuery.data.length === 0) && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                No pending credits.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function EventsTab() {
  const eventsQuery = trpc.hermes.getEvents.useQuery();

  if (eventsQuery.isLoading) return <div className="p-4 text-muted-foreground">Loading events...</div>;

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Payload</TableHead>
            <TableHead>Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {eventsQuery.data?.map((event) => (
            <TableRow key={event.id}>
              <TableCell className="font-medium text-xs">{event.eventType}</TableCell>
              <TableCell><Badge variant="secondary" className="text-xs">{event.source}</Badge></TableCell>
              <TableCell className="text-xs max-w-[300px] truncate">{event.payloadJson || "—"}</TableCell>
              <TableCell className="text-xs">{new Date(event.createdAt).toLocaleString()}</TableCell>
            </TableRow>
          ))}
          {(!eventsQuery.data || eventsQuery.data.length === 0) && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                No events yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default function HermesAdmin() {
  const { user, loading, isAuthenticated, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-violet-500/20">
          <CardContent className="p-8 text-center space-y-4">
            <Shield className="w-12 h-12 text-violet-400 mx-auto" />
            <h1 className="text-2xl font-bold">Hermes Admin</h1>
            <p className="text-muted-foreground">Sign in to access the Hermes operations dashboard.</p>
            <Button className="bg-violet-600 hover:bg-violet-700" onClick={startLogin}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-red-500/20">
          <CardContent className="p-8 text-center space-y-4">
            <XCircle className="w-12 h-12 text-red-400 mx-auto" />
            <h1 className="text-2xl font-bold">Access Denied</h1>
            <p className="text-muted-foreground">Admin privileges required.</p>
            <Link href="/"><Button variant="outline">Back to Home</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur sticky top-0 z-50">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-1" /> Admin
              </Button>
            </Link>
            <span className="text-lg font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              Hermes Agent
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{user.name}</span>
            <Button variant="ghost" size="sm" onClick={logout}>Sign Out</Button>
          </div>
        </div>
      </header>

      <main className="container py-6 space-y-6">
        {/* Daily Summary always visible */}
        <DailySummaryTab />

        {/* Tabbed content */}
        <Tabs defaultValue="trials" className="w-full">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="trials">Trials</TabsTrigger>
            <TabsTrigger value="tasks">Follow-ups</TabsTrigger>
            <TabsTrigger value="affiliates">Affiliates</TabsTrigger>
            <TabsTrigger value="credits">Credits</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>

          <TabsContent value="trials" className="mt-4">
            <TrialsTab />
          </TabsContent>
          <TabsContent value="tasks" className="mt-4">
            <TasksTab />
          </TabsContent>
          <TabsContent value="affiliates" className="mt-4">
            <AffiliatesTab />
          </TabsContent>
          <TabsContent value="credits" className="mt-4">
            <CreditsTab />
          </TabsContent>
          <TabsContent value="events" className="mt-4">
            <EventsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
