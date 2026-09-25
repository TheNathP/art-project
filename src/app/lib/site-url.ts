const LOCAL_SITE_URL = "http://localhost:3000";

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const vercelUrl =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  const siteUrl = configuredUrl ?? (vercelUrl ? `https://${vercelUrl}` : null);

  return (siteUrl ?? LOCAL_SITE_URL).replace(/\/+$/, "");
}
