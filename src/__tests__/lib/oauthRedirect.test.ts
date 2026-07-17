import { isAllowedRedirectTarget } from '@/lib/utils/oauthRedirect';

describe('isAllowedRedirectTarget', () => {
  it('accepts allowed hosts when the redirect target includes a path', () => {
    expect(isAllowedRedirectTarget('capx.toolforge.org/portal/users')).toBe(true);
    expect(isAllowedRedirectTarget('capx-test.toolforge.org/portal/users')).toBe(true);
  });

  it('accepts allowed hosts when the redirect target includes a port', () => {
    expect(isAllowedRedirectTarget('capx.toolforge.org:443/portal/users')).toBe(true);
  });

  it('accepts fully qualified URLs for allowed hosts', () => {
    expect(isAllowedRedirectTarget('https://capx.toolforge.org/portal/users')).toBe(true);
  });

  it('rejects untrusted hosts', () => {
    expect(isAllowedRedirectTarget('capx-backend.toolforge.com/portal/users')).toBe(false);
  });
});
