import { TFunction } from 'i18next';

type BuildSystemPromptArgs = {
  preferredLanguage?: string;
  outfitGender: string[];
  outfitTag: string[];
  outfitColor: string[];
  outfitElement: string[];
  outfitFit: string[];
  lowestPrice?: number;
  highestPrice?: number;
  currency: string;
};

export function buildSystemPrompt(args: BuildSystemPromptArgs) {
  const {
    preferredLanguage,
    outfitGender,
    outfitTag,
    outfitColor,
    outfitElement,
    outfitFit,
    lowestPrice,
    highestPrice,
    currency,
  } = args;

  const gender = outfitGender.filter(Boolean).join(', ');
  const styles = outfitTag.filter(Boolean).join(', ');
  const colors = outfitColor.filter(Boolean).join(', ');
  const elements = outfitElement.filter(Boolean).join(', ');
  const fit = outfitFit.filter(Boolean).join(', ');

  return [
    `You are a professional fashion stylist and image consultant.`,
    `User language: ${preferredLanguage || 'en'}. Always respond in this language.`,
    gender && `Target audience: ${gender}.`,
    styles && `Style preferences: ${styles}.`,
    fit && `Fit preferences: ${fit}.`,
    colors && `Color palette: ${colors}.`,
    elements && `Key elements to include: ${elements}.`,
    (lowestPrice || highestPrice) && `Budget range: ${lowestPrice || 0} to ${highestPrice || '∞'} ${currency}.`,
    `Provide professional styling advice with these components:`,
    `1. A brief outfit concept and overall styling philosophy`,
    `2. Detailed breakdown of each clothing item with styling tips`,
    `3. Color coordination advice and why these combinations work`,
    `4. Accessory suggestions and finishing touches`,
    `5. Occasion-appropriate styling notes`,
    `6. Provide concise, readable tips without extra JSON or code blocks.`,
    `For each clothing item you recommend, append a bracketed marker like [IMAGE: concise search query] that captures the item (brand-neutral). Keep it short and specific (e.g., "white canvas slip-on sneakers minimal" or "beige linen shorts tailored").`,
    `End with a short section titled "Helpful links" listing 3-6 reputable brand or style-guide URLs relevant to your advice. Use real URLs from major retailers like Amazon, ASOS, Uniqlo, Zara, Nike, Adidas, H&M, etc. Format as: Brand Name - https://real-url.com.`,
    `Focus on timeless principles, versatility, and helping users understand the "why" behind each choice.`,
    `Be encouraging and educational in your tone.`,
    `Do not explain the [IMAGE: ...] markers; they are for internal use and will not be shown to the user.`,
  ]
    .filter(Boolean)
    .join(' ');
}

type GenerateUserLikePromptArgs = {
  t: TFunction;
  genders: string[];
  styles: string[];
  fits: string[];
  colors: string[];
  elements: string[];
  lowestPrice?: number;
  highestPrice?: number;
  currency: string;
};

export function generateUserLikePrompt({
  t,
  genders,
  styles,
  fits,
  colors,
  elements,
  lowestPrice,
  highestPrice,
  currency,
}: GenerateUserLikePromptArgs) {
  const mapList = (arr: string[], baseKey: string) =>
    arr
      .filter(Boolean)
      .map((v) => t(`${baseKey}.${v.toLowerCase()}`))
      .filter((s) => !!s)
      .join(', ');

  const genderLabel = mapList(genders, 'chatSection.genders');
  const stylesLabel = mapList(styles, 'chatSection.styles');
  const fitsLabel = mapList(fits, 'chatSection.fits');
  const colorsLabel = mapList(colors, 'chatSection.colors');
  const elementsLabel = mapList(elements, 'chatSection.elements');

  const lines: string[] = [];
  if (stylesLabel) lines.push(`- ${t('chatSection.selectOutfitStyles')}: ${stylesLabel}`);
  if (fitsLabel) lines.push(`- ${t('chatSection.selectFit')}: ${fitsLabel}`);
  if (colorsLabel) lines.push(`- ${t('chatSection.selectDominantColors')}: ${colorsLabel}`);
  if (elementsLabel) lines.push(`- ${t('chatSection.selectOutfitElements')}: ${elementsLabel}`);
  if (genderLabel) lines.push(`- ${t('chatSection.selectGender')}: ${genderLabel}`);
  if (lowestPrice || highestPrice) {
    const low = typeof lowestPrice === 'number' && lowestPrice > 0 ? lowestPrice : 0;
    const high = typeof highestPrice === 'number' && highestPrice > 0 ? highestPrice : '∞';
    lines.push(`- ${t('chatSection.selectPriceRange')}: ${low}-${high} ${currency}`);
  }

  const prefix = t('chatSection.promptPrefix') || 'I want you to help me with creating an outfit by following criteria:';
  return `${prefix}\n${lines.join('\n')}`.trim();
}


