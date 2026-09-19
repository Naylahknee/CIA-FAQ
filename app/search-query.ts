/** Query sanitisation for the FTS5 index.
 *
 *  Deliberately dependency-free: no database, no Worker bindings, so it can be
 *  unit-tested on its own and, if it is ever wanted, run on the client too. */

const MAX_TOKENS = 8;
const MAX_QUERY_LENGTH = 120;

/** Turn whatever someone typed into a valid FTS5 MATCH expression, or null if
 *  there is nothing worth searching for.
 *
 *  Values reach D1 as bound parameters, so this is not about SQL injection --
 *  it is about FTS5's own query language. Left raw, a stray quote, a bare `-`
 *  or the word `NEAR` is a syntax error, `title:x` silently retargets the
 *  search, and `a OR a OR a OR ...` is a cheap way to make D1 work hard. So:
 *  strip everything that is not a letter, digit or intra-word mark, quote each
 *  token so no operator survives, cap the token count, and make only the final
 *  token a prefix match -- that is the one the reader is still typing. */
export function toMatchQuery(raw: string): string | null {
  const tokens = raw
    .slice(0, MAX_QUERY_LENGTH)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s'-]/gu, " ")
    .split(/\s+/)
    .map((token) => token.replace(/^[-']+|[-']+$/g, ""))
    .filter((token) => token.length > 1)
    .slice(0, MAX_TOKENS);

  if (!tokens.length) return null;

  const quoted = tokens.map((token) => `"${token.replace(/"/g, '""')}"`);
  // Prefix-match the last token so "meal pl" already finds "meal plan".
  quoted[quoted.length - 1] = `${quoted[quoted.length - 1]}*`;
  return quoted.join(" AND ");
}
