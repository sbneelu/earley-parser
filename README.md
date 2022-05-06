# Earley Parser (work in progress)

An implementation of the Earley parser algorithm in TypeScript and in Python (the TypeScript implementation is cleaner).

The toy grammar in the `toygrammar()` / `toyGrammar()` functions is:

Non-terminals: `{ S, NP, VP, PP, N, V, P }`

Terminals: `{ can, fish, in, rivers, they, december }`

Start symbol: `S`

Productions:
```
S -> NP | VP
NP -> N | N PP
PP -> P NP
VP -> V | V NP | V VP | VP PP
N -> can | fish | rivers | they | december
P -> in
V -> fish | can
```

## Usage

Python: Use the `parse` or `printParseChart` functions from `parser.py` for a generic parser, or run `python3 python/parser.py <sentence to parse>` for the toy grammar.

TypeScript: Use the `parse` or `printParseChart` functions exported from `typescript/parser` for a generic parser, or the `main()` function in `typescript/main.ts` for the toy grammar.