// ============================================================================
// Ukrainian-to-Latin Transliteration & URL Slug Generator
// Converts Cyrillic Ukrainian text into clean, SEO-friendly URL slugs.
// ============================================================================

const UKR_TO_LATIN = {
  а: 'a', б: 'b', в: 'v', г: 'h', ґ: 'g', д: 'd', е: 'e', є: 'ye', ж: 'zh',
  з: 'z', и: 'y', і: 'i', ї: 'yi', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n',
  о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts',
  ч: 'ch', ш: 'sh', щ: 'shch', ь: '', ю: 'yu', я: 'ya',
  А: 'a', Б: 'b', В: 'v', Г: 'h', Ґ: 'g', Д: 'd', Е: 'e', Є: 'ye', Ж: 'zh',
  З: 'z', И: 'y', І: 'i', Ї: 'yi', Й: 'y', К: 'k', Л: 'l', М: 'm', Н: 'n',
  О: 'o', П: 'p', Р: 'r', С: 's', Т: 't', У: 'u', Ф: 'f', Х: 'kh', Ц: 'ts',
  Ч: 'ch', Ш: 'sh', Щ: 'shch', Ю: 'yu', Я: 'ya',
  '\'': '', '’': '', '`': '', 'ʼ': '', '«': '', '»': '', '"': '',
};

/** Transliterates Ukrainian text and strips non-URL characters into a hyphenated slug */
export function slugify(text) {
  if (!text || typeof text !== 'string') return '';

  const transliterated = text
    .split('')
    .map((char) => (UKR_TO_LATIN[char] !== undefined ? UKR_TO_LATIN[char] : char))
    .join('');

  return transliterated
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}
