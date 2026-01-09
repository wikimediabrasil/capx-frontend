/**
 * Text parsing and rendering helper functions for ProfileEditView
 * Handles complex text transformations like inserting links into translated text
 */

/**
 * Renders text with an embedded link by replacing a placeholder ($1) with a clickable link
 *
 * This function is useful for internationalized text where a link needs to be inserted
 * at a specific position marked by "$1" in the translated string.
 *
 * @param text - The text containing "$1" placeholder where the link should be inserted
 * @param linkText - The visible text for the link
 * @param linkHref - The URL the link should point to
 * @param darkMode - Whether dark mode is active (affects link styling)
 * @returns Array of text fragments and JSX link elements
 *
 * @example
 * ```tsx
 * const text = "Read our $1 for more information";
 * const linkText = "privacy policy";
 * const linkHref = "https://example.com/privacy";
 * const result = renderTextWithLink(text, linkText, linkHref, false);
 * // Returns: ["Read our ", <a>privacy policy</a>, " for more information"]
 * ```
 */
export const renderTextWithLink = (
  text: string,
  linkText: string,
  linkHref: string,
  darkMode: boolean
): (string | JSX.Element)[] => {
  const parts = text.split('$1');
  const link = (
    <a
      key="link"
      href={linkHref}
      target="_blank"
      rel="noopener noreferrer"
      className={`underline ${darkMode ? 'text-blue-300' : 'text-blue-600'} hover:opacity-80`}
    >
      {linkText}
    </a>
  );

  const nodes: (string | JSX.Element)[] = [];
  parts.forEach((part, index) => {
    if (index > 0) {
      nodes.push(link);
    }
    if (part) {
      nodes.push(<span key={`part-${index}`}>{part}</span>);
    }
  });

  return nodes;
};
