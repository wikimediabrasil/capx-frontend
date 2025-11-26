import { formatWikiImageUrl } from '@/lib/utils/fetchWikimediaData';

const assertFallback = (res: any) => {
  if (typeof res === 'string') return expect(res.length).toBeGreaterThan(0);
  return expect(typeof res?.src).toBe('string');
};

describe('formatWikiImageUrl', () => {
  it('returns fallback icon for empty input', () => {
    const res1 = formatWikiImageUrl('');
    const res2 = formatWikiImageUrl(undefined as unknown as string);
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

  const testThumbPhpGeneration = (
    fileType: string,
    url: string,
    expectedFilename: string
  ) => {
    const out = formatWikiImageUrl(url);
    expect(out).toContain('commons.wikimedia.org/w/thumb.php');
    expect(out).toContain(`f=${expectedFilename}`);
    expect(out).toContain('page=1');
  };

  it('builds thumb.php for PDF with page=1', () => {
    testThumbPhpGeneration('PDF', 'https://commons.wikimedia.org/wiki/File:Document.pdf', 'Document.pdf');
  });

  it('builds thumb.php for DJVU with page=1', () => {
    testThumbPhpGeneration('DJVU', 'File:Scan.djvu', 'Scan.djvu');
  });

  it('builds thumb.php for TSL with page=1', () => {
    testThumbPhpGeneration('TSL', 'https://commons.wikimedia.org/wiki/File:Specimen.tsl', 'Specimen.tsl');
  });

  it('decodes double-encoded filenames before building URL', () => {
    const url = 'https://commons.wikimedia.org/wiki/File:Teoria_da_Mudan%25C3%25A7a.pdf';
    const out = formatWikiImageUrl(url);
    expect(out).toContain('f=Teoria_da_Mudan%C3%A7a.pdf');
  });
});
