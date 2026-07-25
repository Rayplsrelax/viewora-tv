import { useCallback, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";

function getSessionId(): string {
  const key = "viewora_session_id";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = Math.random().toString(36).substring(2) + Date.now().toString(36);
    sessionStorage.setItem(key, id);
  }
  return id;
}

function getUtmParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get("utm_source") || undefined,
    utmMedium: params.get("utm_medium") || undefined,
    utmCampaign: params.get("utm_campaign") || undefined,
    utmContent: params.get("utm_content") || undefined,
  };
}

export function useAnalytics() {
  const trackMutation = trpc.analytics.track.useMutation();
  const sessionId = useRef(getSessionId());

  const track = useCallback(
    (event: string, extra?: { page?: string; planId?: string; metadata?: string }) => {
      const utm = getUtmParams();
      trackMutation.mutate({
        event,
        page: extra?.page || window.location.pathname,
        planId: extra?.planId,
        referrer: document.referrer || undefined,
        sessionId: sessionId.current,
        metadata: extra?.metadata,
        ...utm,
      });
    },
    [trackMutation]
  );

  return { track };
}

/** Track a page view once on mount */
export function usePageView(pageName?: string) {
  const { track } = useAnalytics();
  const tracked = useRef(false);

  useEffect(() => {
    if (!tracked.current) {
      tracked.current = true;
      track("page_view", { page: pageName || window.location.pathname });
    }
  }, []);
}
