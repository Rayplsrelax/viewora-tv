import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Clock, CheckCircle, AlertCircle, Tv, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { usePageView } from "@/hooks/useAnalytics";

export default function TrialRequest() {
  usePageView("trial-request");

  const availabilityQuery = trpc.hermes.trialAvailability.useQuery();
  const requestTrialMutation = trpc.hermes.requestTrial.useMutation({
    onSuccess: (data) => {
      if (data.waitlisted) {
        toast.info(data.message);
      } else {
        toast.success(data.message);
      }
      setSubmitted(true);
      setWaitlisted(data.waitlisted);
    },
    onError: (err) => {
      toast.error(err.message || "Something went wrong. Please try again.");
    },
  });

  const [submitted, setSubmitted] = useState(false);
  const [waitlisted, setWaitlisted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    telegram: "",
    whatsapp: "",
    country: "",
    deviceType: "",
    preferredSupportChannel: "telegram" as "telegram" | "whatsapp" | "email",
    consentToFollowup: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      toast.error("Please fill in your name and email.");
      return;
    }

    // Capture UTM params
    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get("utm_source") || undefined;
    const utmMedium = params.get("utm_medium") || undefined;
    const utmCampaign = params.get("utm_campaign") || undefined;
    const utmContent = params.get("utm_content") || undefined;
    const affiliateCode = params.get("ref") || undefined;

    requestTrialMutation.mutate({
      ...form,
      telegram: form.telegram || undefined,
      whatsapp: form.whatsapp || undefined,
      country: form.country || undefined,
      deviceType: form.deviceType || undefined,
      affiliateCode,
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      source: document.referrer || undefined,
      referrer: document.referrer || undefined,
      landingPage: window.location.href,
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-violet-500/20 bg-card/80 backdrop-blur">
          <CardContent className="p-8 text-center space-y-4">
            {waitlisted ? (
              <>
                <AlertCircle className="w-16 h-16 text-amber-400 mx-auto" />
                <h2 className="text-2xl font-bold">Waitlisted</h2>
                <p className="text-muted-foreground">
                  Trial slots are full today. We&apos;ll notify you when a slot opens, or you can choose a paid plan now.
                </p>
              </>
            ) : (
              <>
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
                <h2 className="text-2xl font-bold">Request Received</h2>
                <p className="text-muted-foreground">
                  We&apos;ll review your request and send credentials shortly via your preferred channel. Check your messages!
                </p>
              </>
            )}
            <div className="pt-4 space-y-2">
              <Link href="/">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                </Button>
              </Link>
              {waitlisted && (
                <Link href="/#pricing">
                  <Button className="w-full bg-violet-600 hover:bg-violet-700">
                    View Paid Plans
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <Link href="/">
            <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent cursor-pointer">
              Viewora TV
            </span>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          </Link>
        </div>
      </header>

      <main className="container py-12 max-w-lg mx-auto px-4">
        {/* Availability Banner */}
        <div className="mb-6">
          {availabilityQuery.data && (
            <div className={`flex items-center gap-2 p-3 rounded-lg border ${
              availabilityQuery.data.available
                ? "border-green-500/30 bg-green-500/5"
                : "border-amber-500/30 bg-amber-500/5"
            }`}>
              <Clock className={`w-4 h-4 ${availabilityQuery.data.available ? "text-green-400" : "text-amber-400"}`} />
              <span className="text-sm">
                {availabilityQuery.data.available
                  ? `${availabilityQuery.data.slotsRemaining} trial slot${availabilityQuery.data.slotsRemaining !== 1 ? "s" : ""} remaining today`
                  : "Trial slots full today — you can still submit a request for the waitlist"}
              </span>
            </div>
          )}
        </div>

        <Card className="border-violet-500/20 bg-card/80 backdrop-blur">
          <CardContent className="p-6 space-y-6">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Tv className="w-6 h-6 text-violet-400" />
                <h1 className="text-2xl font-bold">Request a 24h Trial</h1>
              </div>
              <p className="text-sm text-muted-foreground">
                Limited to 10 per day. Not guaranteed. We&apos;ll check your device compatibility and send credentials if approved.
              </p>
              <Badge variant="secondary" className="text-xs">
                No payment required
              </Badge>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="telegram">Telegram</Label>
                  <Input
                    id="telegram"
                    placeholder="@username"
                    value={form.telegram}
                    onChange={(e) => setForm({ ...form, telegram: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    placeholder="+44..."
                    value={form.whatsapp}
                    onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    placeholder="e.g. UK"
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deviceType">Device</Label>
                  <Input
                    id="deviceType"
                    placeholder="e.g. Firestick"
                    value={form.deviceType}
                    onChange={(e) => setForm({ ...form, deviceType: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Preferred Contact Channel</Label>
                <div className="flex gap-2">
                  {(["telegram", "whatsapp", "email"] as const).map((ch) => (
                    <Button
                      key={ch}
                      type="button"
                      variant={form.preferredSupportChannel === ch ? "default" : "outline"}
                      size="sm"
                      className={form.preferredSupportChannel === ch ? "bg-violet-600 hover:bg-violet-700" : ""}
                      onClick={() => setForm({ ...form, preferredSupportChannel: ch })}
                    >
                      {ch.charAt(0).toUpperCase() + ch.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="consent"
                  checked={form.consentToFollowup}
                  onCheckedChange={(checked) =>
                    setForm({ ...form, consentToFollowup: checked === true })
                  }
                />
                <Label htmlFor="consent" className="text-xs text-muted-foreground leading-tight">
                  I consent to receiving follow-up messages about my trial and service updates.
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full bg-violet-600 hover:bg-violet-700 text-white"
                disabled={requestTrialMutation.isPending}
              >
                {requestTrialMutation.isPending ? "Submitting..." : "Request Trial"}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                By submitting, you agree to our{" "}
                <Link href="/terms" className="underline">Terms</Link> and{" "}
                <Link href="/privacy" className="underline">Privacy Policy</Link>.
              </p>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
