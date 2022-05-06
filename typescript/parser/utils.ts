import parse from "./parser";
import { Chart, ChartRow, Grammar, NonTerminal } from "./types";

function flattenChart(chart: Chart): ChartRow[] {
    const rows: ChartRow[] = [];
    for (const wordChart of chart) {
        const wordChartRows = wordChart.predict
            .concat(wordChart.scan)
            .concat(wordChart.complete);
        for (const row of wordChartRows) {
            rows.push(row);
        }
    }
    return rows;
}

function printParseChart(
    sentence: string[],
    grammar: Grammar,
    privilegedNonTerminals: NonTerminal[],
    printFunction: (toPrint: string) => void
): void {
    const print = printFunction;
    const [derivations, chart] = parse(
        sentence,
        grammar,
        privilegedNonTerminals
    );
    for (const wordChart of chart) {
        const sections = [
            wordChart.predict,
            wordChart.scan,
            wordChart.complete,
        ];
        for (const section of sections) {
            for (const row of section) {
                const { rowId, dotProduction, words, history } = row;
                const { lhs, beforeDot, afterDot } = dotProduction;
                const [from, to] = words;
                const toPrint = `${rowId} | ${lhs} -> ${beforeDot.join(
                    " "
                )} . ${afterDot.join(" ")} | [${from}-${to}] | (${history.join(
                    ","
                )})`;
                print(toPrint);
            }
            print("");
        }
        print("--------");
    }
    print(
        derivations.length > 0
            ? `SUCCESS (${derivations.length} derivations): [${derivations.join(
                  ","
              )}]\n`
            : "FAILURE"
    );
}

export { flattenChart, printParseChart };
