export type AnalyticsEvent =
  | "analysis_started"
  | "analysis_completed"
  | "analysis_failed"
  | "demo_started"
  | "report_shared"
  | "mode_changed"
  | "attestation_started"
  | "attestation_completed";

export function logEvent(event: AnalyticsEvent, data: Record<string, unknown> = {}) {
  if (process.env.NODE_ENV !== "test") {
    console.info(JSON.stringify({ event, ...data, at: new Date().toISOString() }));
  }
}
