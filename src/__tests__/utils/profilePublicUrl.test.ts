import { toProfileSlug, fromProfileSlug, getPublicProfileUrl } from '@/lib/utils/profilePublicUrl';

describe('toProfileSlug', () => {
  it('replaces spaces with underscores', () => {
    expect(toProfileSlug('John Doe')).toBe('John_Doe');
  });

  it('handles multiple spaces', () => {
    expect(toProfileSlug('John  Doe  Jr')).toBe('John_Doe_Jr');
  });

  it('encodes special characters', () => {
    expect(toProfileSlug('user&name')).toBe('user%26name');
  });

  it('handles username without spaces', () => {
    expect(toProfileSlug('JohnDoe')).toBe('JohnDoe');
  });
});

describe('fromProfileSlug', () => {
  it('converts underscores back to spaces', () => {
    expect(fromProfileSlug('John_Doe')).toBe('John Doe');
  });

  it('decodes URI components', () => {
    expect(fromProfileSlug('user%26name')).toBe('user&name');
  });

  it('returns empty string for empty input', () => {
    expect(fromProfileSlug('')).toBe('');
  });

  it('handles invalid URI encoding gracefully', () => {
    const result = fromProfileSlug('%invalid');
    expect(typeof result).toBe('string');
  });
});

describe('getPublicProfileUrl', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'location', {
      value: { origin: 'https://capx.toolforge.org' },
      writable: true,
    });
  });

  it('generates correct profile URL', () => {
    const url = getPublicProfileUrl('John Doe');
    expect(url).toBe('https://capx.toolforge.org/profile/John_Doe');
  });

  it('returns empty string for empty username', () => {
    expect(getPublicProfileUrl('')).toBe('');
    expect(getPublicProfileUrl('   ')).toBe('');
  });
});
