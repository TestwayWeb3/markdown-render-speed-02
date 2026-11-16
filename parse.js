// A faster drop-in for marked 18.1.3 with its default options (GFM on, breaks
// off, pedantic off, synchronous). The parsing machinery lives in the fork at
// vendor/marked/marked.esm.js; this module drives it directly, skipping the
// general-purpose marked() wrapper (per-call option merging, hook and
// extension dispatch) that the defaults never use.
//
// One Lexer and one Parser are built up front and reused across calls. Every
// scrap of per-document state (the token list, the link-definition table, the
// inline queue and the lexer's flags) is reset before each document, so every
// call returns exactly what it returns for that document alone: nothing is
// carried from one call to the next, and no result is ever cached.

import { Lexer, Parser, getDefaults } from './vendor/marked/marked.esm.js';

const options = getDefaults();
const lexer = new Lexer(options);
const parser = new Parser(options);

/** The HTML marked renders for `markdown`, with marked's defaults. */
export function parse(markdown) {
  const tokens = [];
  tokens.links = Object.create(null);
  lexer.tokens = tokens;
  lexer.inlineQueue = [];
  const state = lexer.state;
  state.inLink = false;
  state.inRawBlock = false;
  state.linkEmitted = false;
  state.linkParenPossible = true;
  state.top = true;
  return parser.parse(lexer.lex(markdown));
}
