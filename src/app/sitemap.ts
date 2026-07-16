export default function sitemap() {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return ["/", "/analyze", "/demo", "/how-it-works", "/privacy", "/disclaimer"].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date()
  }));
}
