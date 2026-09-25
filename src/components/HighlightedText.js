function normalizeValue(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("fr");
}

/*
 * Produces normalized text while preserving the mapping
 * between its characters and positions in the original text.
 */
function createSearchMap(text) {
  let normalizedText = "";
  const originalPositions = [];
  let originalIndex = 0;

  for (const character of text) {
    const normalizedCharacter = normalizeValue(character);

    for (let index = 0; index < normalizedCharacter.length; index += 1) {
      originalPositions.push(originalIndex);
    }

    normalizedText += normalizedCharacter;
    originalIndex += character.length;
  }

  /*
   * Position used to calculate the end of the final match.
   */
  originalPositions.push(text.length);

  return {
    normalizedText,
    originalPositions,
  };
}

function findMatches(text, query) {
  const normalizedQuery = normalizeValue(query).trim();

  if (!normalizedQuery) {
    return [];
  }

  const { normalizedText, originalPositions } = createSearchMap(text);
  const matches = [];

  let searchFrom = 0;

  while (searchFrom < normalizedText.length) {
    const matchIndex = normalizedText.indexOf(
      normalizedQuery,
      searchFrom,
    );

    if (matchIndex === -1) {
      break;
    }

    const matchEndIndex = matchIndex + normalizedQuery.length;

    matches.push({
      start: originalPositions[matchIndex],
      end: originalPositions[matchEndIndex] ?? text.length,
    });

    searchFrom = matchEndIndex;
  }

  return matches;
}

export default function HighlightedText({ text, query }) {
  const safeText = String(text ?? "");
  const matches = findMatches(safeText, query);

  if (matches.length === 0) {
    return safeText;
  }

  const parts = [];
  let cursor = 0;

  for (const match of matches) {
    if (match.start > cursor) {
      parts.push(
        <span key={`text-${cursor}`}>
          {safeText.slice(cursor, match.start)}
        </span>,
      );
    }

    parts.push(
      <mark
        key={`match-${match.start}-${match.end}`}
        className="bg-[var(--main-highlight)] text-inherit"
      >
        {safeText.slice(match.start, match.end)}
      </mark>,
    );

    cursor = match.end;
  }

  if (cursor < safeText.length) {
    parts.push(
      <span key={`text-${cursor}`}>
        {safeText.slice(cursor)}
      </span>,
    );
  }

  return <>{parts}</>;
}
