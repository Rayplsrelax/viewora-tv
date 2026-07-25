import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function Privacy() {
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

        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-zinc-500 mb-10">Last updated: {new Date().toLocaleDateString("en-GB", { month: "long", day: "numeric", year: "numeric" })}</p>

        <div className="space-y-8 text-sm text-zinc-300 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Information We Collect</h2>
            <p>When you purchase a plan, we collect your email address (for credential delivery), payment information (processed securely by Stripe — we never see your full card details), and basic usage data to improve the Service.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. How We Use Your Information</h2>
            <p>We use your information to: deliver your streaming credentials, process payments, communicate important service updates, provide customer support, and improve our Service. We do not sell or share your personal information with third parties for marketing purposes.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. Payment Processing</h2>
            <p>All payments are processed by Stripe, a PCI-compliant payment processor. We do not store your credit card number, CVV, or other sensitive payment details on our servers. Please refer to <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">Stripe's Privacy Policy</a> for details on how they handle your payment data.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. Data Retention</h2>
            <p>We retain your account information for as long as your subscription is active and for a reasonable period afterward for record-keeping purposes. You may request deletion of your data by contacting our support team.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. Cookies & Analytics</h2>
            <p>We use essential cookies to maintain your session and basic analytics to understand how visitors use our site. We do not use invasive tracking or sell data to advertisers.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. Data Security</h2>
            <p>We implement industry-standard security measures to protect your information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. Your Rights</h2>
            <p>You have the right to: access the personal data we hold about you, request correction of inaccurate data, request deletion of your data, and opt out of non-essential communications. Contact our support team to exercise these rights.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">8. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of significant changes via email or a notice on our website.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">9. Contact</h2>
            <p>For privacy-related questions, contact us via <a href="https://t.me/+EbGpQ2NZyhhhMzYx" className="text-violet-400 hover:underline">Telegram</a>, <a href="https://chat.whatsapp.com/DzL8dDYSjOTE3j59PKP0qf" className="text-violet-400 hover:underline">WhatsApp</a>, or email at <a href="mailto:info@rayallcompany.business" className="text-violet-400 hover:underline">info@rayallcompany.business</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
