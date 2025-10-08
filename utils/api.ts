export function buildApiUrl(path: string) {
  let base = (process.env.EXPO_PUBLIC_SERVER_URL || process.env.EXPO_PUBLIC_VERCEL_URL || '').trim();
  
  if (!base) return path;

  try { base = new URL(base).origin; }
  
  catch {
    try { base = new URL(`https://${base.replace(/^https?:\/\//, '')}`).origin; }
  
    catch { return path; }
  }
  
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${base}${normalizedPath}`;
}