import { useEffect } from "react";

const REF_KEY = "viewora_ref_code";
const REF_EXPIRY_KEY = "viewora_ref_expiry";
const REF_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/**
 * Captures ?ref= from URL and persists it in localStorage for 30 days.
 * Call this hook on any page that might receive referral traffic.
 */
export function useReferralCapture() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref && ref.trim()) {
      localStorage.setItem(REF_KEY, ref.trim());
      localStorage.setItem(REF_EXPIRY_KEY, String(Date.now() + REF_DURATION_MS));
    }
  }, []);
}

/**
 * Returns the stored referral code if it hasn't expired, or null.
 */
export function getReferralCode(): string | null {
  const code = localStorage.getItem(REF_KEY);
  const expiry = localStorage.getItem(REF_EXPIRY_KEY);
  if (!code || !expiry) return null;
  if (Date.now() > parseInt(expiry, 10)) {
    // Expired — clean up
    localStorage.removeItem(REF_KEY);
    localStorage.removeItem(REF_EXPIRY_KEY);
    return null;
  }
  return code;
}
