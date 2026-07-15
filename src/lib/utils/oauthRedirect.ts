export function isAllowedRedirectTarget(
  target: string | null | undefined,
  allowedHosts: string[] = [
    'capx.toolforge.org', 
    'capx-test.toolforge.org', 
    'capx-backend.toolforge.org', 
    'localhost'
  ]
): boolean {
  if (!target) {
    return false;
  }

  const normalizedTarget = target.trim();
  if (!normalizedTarget) {
    return false;
  }

  const withoutProtocol = normalizedTarget.replace(/^https?:\/\//i, '');
  const [hostPart] = withoutProtocol.split(/[/?#]/);
  const hostWithoutPort = hostPart.split(':')[0];

  return allowedHosts.some(host => hostWithoutPort === host);
}
