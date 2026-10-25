import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractDomain,
  getFaviconUrl,
  sanitizeSearchQuery,
  extractCitationIndices,
  deduplicateGroundingSources,
  formatSearchLatency,
  detectDirectWebsite,
} from './searchHelpers.ts';

test('detectDirectWebsite identifies YouTube in all language variations', () => {
  const variations = [
    'YouTube',
    'youtube',
    'ютуб',
    'ютюб',
    'ютьюб',
    'сайт ютуб',
    'ютуб сайт',
    'видео youtube',
    'смотреть ютуб',
    'ютуб онлайн',
    'youtube.com',
    'https://www.youtube.com',
    'войти в ютуб',
  ];

  for (const query of variations) {
    const site = detectDirectWebsite(query);
    assert.ok(site, `Expected direct site for query: "${query}"`);
    assert.equal(site.name, 'YouTube');
    assert.equal(site.domain, 'youtube.com');
    assert.equal(site.url, 'https://www.youtube.com');
  }
});

test('detectDirectWebsite identifies other popular services and domains', () => {
  const gh = detectDirectWebsite('github.com');
  assert.equal(gh?.name, 'GitHub');

  const tg = detectDirectWebsite('телеграм веб');
  assert.equal(tg?.name, 'Telegram');

  const vk = detectDirectWebsite('вк видео');
  assert.equal(vk?.name, 'ВКонтакте');

  const pogoda = detectDirectWebsite('в погода');
  assert.equal(pogoda?.name, 'w pogoda (Погода)');
  assert.equal(pogoda?.url, 'https://kinwik.github.io/?shem=aimgspe');

  const pogoda2 = detectDirectWebsite('погода');
  assert.equal(pogoda2?.name, 'w pogoda (Погода)');

  const claude = detectDirectWebsite('claude ai');
  assert.equal(claude?.name, 'Claude (Anthropic)');
  assert.equal(claude?.url, 'https://claude.ai');

  const gemini = detectDirectWebsite('гугл джемини');
  assert.equal(gemini?.name, 'Google Gemini');
  assert.equal(gemini?.url, 'https://gemini.google.com');

  const custom = detectDirectWebsite('example.org');
  assert.equal(custom?.domain, 'example.org');
  assert.equal(custom?.url, 'https://example.org');

  const notSite = detectDirectWebsite('как работает квантовый компьютер');
  assert.equal(notSite, null);
});

test('extractDomain correctly parses standard and complex URLs', () => {
  assert.equal(extractDomain('https://www.nature.com/articles/12345'), 'nature.com');
  assert.equal(extractDomain('http://habr.com/ru/post/999/'), 'habr.com');
  assert.equal(extractDomain('https://sub.domain.co.uk/path?arg=1'), 'sub.domain.co.uk');
  assert.equal(extractDomain('github.com/google/genai'), 'github.com');
  assert.equal(extractDomain(''), '');
});

test('getFaviconUrl generates expected Google favicon service endpoint', () => {
  const url = getFaviconUrl('https://en.wikipedia.org/wiki/Argon');
  assert.equal(url, 'https://www.google.com/s2/favicons?domain=en.wikipedia.org&sz=128');
  assert.equal(getFaviconUrl(''), '');
});

test('sanitizeSearchQuery cleans whitespace and trims bounds', () => {
  assert.equal(
    sanitizeSearchQuery('   что   такое    аргон?\n\n '),
    'что такое аргон?'
  );
  assert.equal(sanitizeSearchQuery(''), '');
});

test('extractCitationIndices parses brackets correctly', () => {
  const text = 'Argon is a noble gas [1]. It was discovered in 1894 [2, 3]. Multiple [4][5] references.';
  const indices = extractCitationIndices(text);
  assert.deepEqual(indices, [1, 2, 3, 4, 5]);
});

test('deduplicateGroundingSources removes duplicates and assigns clean ids', () => {
  const chunks = [
    { web: { uri: 'https://en.wikipedia.org/wiki/Argon', title: 'Argon - Wikipedia' } },
    { web: { uri: 'https://en.wikipedia.org/wiki/Argon/', title: 'Argon Wikipedia Duplicate' } },
    { web: { uri: 'https://www.rsc.org/periodic-table/element/18/argon', title: 'Argon - Royal Society' } },
    { web: { uri: '' } },
  ];

  const results = deduplicateGroundingSources(chunks);
  assert.equal(results.length, 2);
  assert.equal(results[0].id, 1);
  assert.equal(results[0].domain, 'en.wikipedia.org');
  assert.equal(results[1].id, 2);
  assert.equal(results[1].domain, 'rsc.org');
});

test('formatSearchLatency formats milliseconds properly', () => {
  assert.equal(formatSearchLatency(450), '0.45 с');
  assert.equal(formatSearchLatency(1200), '1.2 с');
  assert.equal(formatSearchLatency(0), '0.00 с');
});
