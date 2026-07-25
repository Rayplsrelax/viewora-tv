import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function Terms() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Button
          variant="ghost"
          className="mb-8 text-zinc-400 hover:text-white"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-sm text-zinc-500 mb-10">Last updated: {new Date().toLocaleDateString("en-GB", { month: "long", day: "numeric", year: "numeric" })}</p>

        <div className="space-y-8 text-sm text-zinc-300 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using Viewora TV ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. Service Description</h2>
            <p>Viewora TV provides access to streaming content through login credentials delivered via email after purchase. The Service is provided "as is" and access depends on your internet connection, device compatibility, and third-party app availability.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. Account & Credentials</h2>
            <p>Upon purchase, you will receive login credentials via email. You are responsible for keeping your credentials secure and not sharing them with others beyond the number of connections included in your plan. Sharing credentials outside your plan may result in service termination without refund.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. Payment & Billing</h2>
            <p>All payments are processed securely through Stripe. Prices are displayed in GBP (British Pounds). By completing a purchase, you authorize the charge to your payment method. Subscriptions renew automatically at the end of each billing period unless cancelled.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. Refund Policy</h2>
            <p>All sales are final once access credentials have been delivered or activated. No refunds will be issued after credential delivery. Please ensure your device and internet connection are compatible before purchasing. See our <a href="/refund-policy" className="text-violet-400 hover:underline">Refund Policy</a> for full details.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. Acceptable Use</h2>
            <p>You agree not to: resell or redistribute your credentials; attempt to reverse-engineer or exploit the Service; use the Service for any illegal purpose; or share your account beyond the number of connections in your plan.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. Service Availability</h2>
            <p>We strive to maintain consistent service availability but do not guarantee 100% uptime. The Service may be temporarily unavailable due to maintenance, updates, or circumstances beyond our control. We are not liable for interruptions caused by your internet service provider, device issues, or third-party applications.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">8. Limitation of Liability</h2>
            <p>Viewora TV is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the Service. Our total liability shall not exceed the amount you paid for your current subscription period.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">9. Termination</h2>
            <p>We reserve the right to suspend or terminate your access if you violate these terms. You may cancel your subscription at any time through your payment provider, but no refund will be issued for the remaining period.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">10. Changes to Terms</h2>
            <p>We may update these terms from time to time. Continued use of the Service after changes constitutes acceptance of the new terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">11. Contact</h2>
            <p>For questions about these terms, contact us via <a href="https://t.me/+EbGpQ2NZyhhhMzYx" className="text-violet-400 hover:underline">Telegram</a>, <a href="https://chat.whatsapp.com/DzL8dDYSjOTE3j59PKP0qf" className="text-violet-400 hover:underline">WhatsApp</a>, or email at <a href="mailto:info@rayallcompany.business" className="text-violet-400 hover:underline">info@rayallcompany.business</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
