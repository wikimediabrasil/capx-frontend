import { formatWikiImageUrl } from '@/lib/utils/fetchWikimediaData';

describe('formatWikiImageUrl', () => {
  it('returns fallback icon for empty input', () => {
    const res1 = formatWikiImageUrl('');
    const res2 = formatWikiImageUrl(undefined as unknown as string);
    const assertFallback = (res: any) => {
      if (typeof res === 'string') return expect(res.length).toBeGreaterThan(0);
      return expect(typeof res?.src).toBe('string');
    };
    assertFallback(res1);
    assertFallback(res2);
  });

  it('passes through direct upload URLs', () => {
    const url = 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Example.jpg';
    expect(formatWikiImageUrl(url)).toBe(url);
  });

  it('builds Special:FilePath for image files', () => {
    const url = 'https://commons.wikimedia.org/wiki/File:Example.jpg';
    const out = formatWikiImageUrl(url);
    expect(out).toContain('commons.wikimedia.org/wiki/Special:FilePath/Example.jpg');
    expect(out).toContain('width=');
  });

  it('builds thumb.php for PDF with page=1', () => {
    const url = 'https://commons.wikimedia.org/wiki/File:Document.pdf';
    const out = formatWikiImageUrl(url);
    expect(out).toContain('commons.wikimedia.org/w/thumb.php');
    expect(out).toContain('f=Document.pdf');
    expect(out).toContain('page=1');
  });

  it('builds thumb.php for DJVU with page=1', () => {
    const url = 'File:Scan.djvu';
    const out = formatWikiImageUrl(url);
    expect(out).toContain('commons.wikimedia.org/w/thumb.php');
    expect(out).toContain('f=Scan.djvu');
    expect(out).toContain('page=1');
  });

  it('builds thumb.php for TSL with page=1', () => {
    const url = 'https://commons.wikimedia.org/wiki/File:Specimen.tsl';
    const out = formatWikiImageUrl(url);
    expect(out).toContain('commons.wikimedia.org/w/thumb.php');
    expect(out).toContain('f=Specimen.tsl');
    expect(out).toContain('page=1');
  });

  it('decodes double-encoded filenames before building URL', () => {
    const url = 'https://commons.wikimedia.org/wiki/File:Teoria_da_Mudan%25C3%25A7a.pdf';
    const out = formatWikiImageUrl(url);
    expect(out).toContain('f=Teoria_da_Mudan%C3%A7a.pdf');
  });
});
