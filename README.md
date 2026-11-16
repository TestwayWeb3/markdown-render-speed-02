# A faster drop-in for marked

An entry for [make.fun's "Make Markdown rendering faster" bounty](https://make.fun/bounty/markdown-render-speed-02).

[![make.fun · markdown-render-speed-02](https://make.fun/badge/markdown-render-speed-02.svg)](https://make.fun/bounty/markdown-render-speed-02)
[![rank](https://make.fun/badge/markdown-render-speed-02/TestwayWeb3/markdown-render-speed-02/rank.svg)](https://make.fun/bounty/markdown-render-speed-02/leaderboard)
[![reward](https://make.fun/badge/markdown-render-speed-02/TestwayWeb3/markdown-render-speed-02/reward.svg)](https://make.fun/bounty/markdown-render-speed-02)

`parse.js` exports `parse(markdown)`, which returns exactly the HTML that
marked 18.1.3 renders with its default options (GFM on, breaks off, pedantic
off, synchronous) — compared code unit for code unit — for less CPU.
`main.ts` reads every case from `/input/cases.json`, renders each one alone,
and writes `/output/html.json`.

## What it is

A fork of marked 18.1.3, optimized, not a new parser. The fork lives in
`vendor/marked/marked.esm.js`, kept under marked's own MIT licence (see
`vendor/marked/LICENSE` and `vendor/marked/NOTICE`): marked is
Copyright (c) 2018+, MarkedJS, and Copyright (c) 2011-2018, Christopher
Jeffrey. Forking marked under its licence, credited, is allowed by the
competition's rules; nothing here is any other renderer, and no output is
ever looked up or cached — every case is parsed from its own Markdown, alone.

## What was optimized

- The general-purpose `marked()` wrapper is bypassed: `parse.js` drives one
  reused Lexer and Parser directly, with per-document state reset before
  every call, so no option merging, hook, or extension dispatch runs.
- The block and inline dispatchers carry cheap guards that skip tokenizer
  work only where the match is impossible: first-character and line-shape
  checks that are necessary conditions of the original patterns, with the
  original patterns and their order untouched.
- The emphasis/delimiter masking scan jumps from one delimiter run to the
  next with `indexOf` instead of visiting every character, recording exactly
  the same closer indices; the setext-heading guard is a single line-by-line
  scan instead of two backtracking patterns; the autolink pre-check is one
  small pattern instead of a character-by-character test.
- The list tokenizer avoids repeated splitting and per-line regex tests
  where a character check decides the same question, expands tabs only on
  lines that have them, and tests trailing blank lines with a scan from the
  end instead of a regular expression.
- The emphasis and strikethrough matchers count delimiter runs and code
  points with direct character tests instead of spreading strings into
  arrays, keeping astral-character behaviour identical.
- Dead branches for option combinations the competition never uses
  (pedantic mode, extensions, hooks) are removed, and the reference-link
  masking pass is skipped when the document defines no links.

Every optimization keeps the original patterns and their order: a guard only
ever skips work whose result is already known, never work whose result could
differ. Correctness is checked against marked itself on the kit's 720-case
practice set (all CommonMark 0.31.2 and GFM 0.29 examples plus 40 generated
documents) and on randomized differential tests.
