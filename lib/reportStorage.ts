import { AnalyzeResult } from "./types";

export const LAST_REPORT_KEY = "megalopa:lastReportId";
export const REPORT_PREFIX = "megalopa:report:";

export function createReportId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `report_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function reportStorageKey(id: string) {
  return `${REPORT_PREFIX}${id}`;
}

export function saveReport(result: AnalyzeResult, id = createReportId()) {
  const value = JSON.stringify({ ...result, report_id: id });
  sessionStorage.setItem(reportStorageKey(id), value);
  sessionStorage.setItem(LAST_REPORT_KEY, id);
  sessionStorage.setItem("megalopa:lastReport", value);
  return id;
}

export function loadReport(id?: string | null): AnalyzeResult | null {
  const reportId = id && id !== "sample" ? id : sessionStorage.getItem(LAST_REPORT_KEY);
  const stored = reportId ? sessionStorage.getItem(reportStorageKey(reportId)) : sessionStorage.getItem("megalopa:lastReport");
  if (!stored) return null;
  try {
    return JSON.parse(stored) as AnalyzeResult;
  } catch {
    if (reportId) sessionStorage.removeItem(reportStorageKey(reportId));
    sessionStorage.removeItem("megalopa:lastReport");
    return null;
  }
}
