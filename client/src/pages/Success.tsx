import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Mail, Play } from "lucide-react";
import { useLocation } from "wouter";

export default function Success() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center px-6">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-green-600/10 rounded-full blur-[120px]" />
      </div>

      <Card className="relative bg-zinc-900/50 border-zinc-800/50 max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>

          <h1 className="text-2xl font-bold text-white mb-3">Payment Successful!</h1>
          <p className="text-zinc-400 mb-6 leading-relaxed">
            Your subscription is now active. We've sent your streaming credentials to your email address.
          </p>

          <div className="bg-zinc-800/50 rounded-lg p-4 mb-6 border border-zinc-700/50">
            <div className="flex items-center gap-2 text-sm text-zinc-300">
              <Mail className="w-4 h-4 text-violet-400" />
              <span>Check your inbox for login details</span>
            </div>
          </div>

          <p className="text-xs text-zinc-500 mb-6">
            Didn't receive an email? Check your spam folder or contact us at{" "}
            <a href="mailto:info@rayallcompany.business" className="text-violet-400 hover:underline">
              info@rayallcompany.business
            </a>
          </p>

          <Button
            className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white"
            onClick={() => navigate("/")}
          >
            <Play className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
