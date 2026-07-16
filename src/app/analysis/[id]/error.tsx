"use client";

export default function ErrorPage({ error }: { error: Error }) {
  return <div className="min-h-screen bg-ink p-10 text-slate-200">Analysis failed: {error.message}</div>;
}
