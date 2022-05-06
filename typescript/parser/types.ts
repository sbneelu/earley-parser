type NonTerminal = string;
type Terminal = string;
type Sym = NonTerminal | Terminal;
interface Production {
    lhs: NonTerminal;
    rhs: Sym[];
}
interface Grammar {
    nonTerminals: NonTerminal[];
    terminals: Terminal[];
    startSymbol: NonTerminal;
    productions: Production[];
}
interface DotProduction {
    lhs: NonTerminal;
    beforeDot: Sym[];
    afterDot: Sym[];
}
interface ChartRow {
    rowId: number;
    dotProduction: DotProduction;
    words: [number, number];
    history: number[];
}
type ChartSection = ChartRow[];
interface WordChart {
    predict: ChartSection;
    scan: ChartSection;
    complete: ChartSection;
}
type Chart = WordChart[];

export type {
    NonTerminal,
    Terminal,
    Sym,
    Production,
    Grammar,
    DotProduction,
    ChartRow,
    ChartSection,
    WordChart,
    Chart,
};
