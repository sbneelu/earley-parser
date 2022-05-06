import {
    Chart,
    ChartRow,
    ChartSection,
    DotProduction,
    Grammar,
    NonTerminal,
    Production,
    Terminal,
    WordChart,
    Sym,
} from "./types";

import { flattenChart } from "./utils";

function parse(
    sentence: string[],
    grammar: Grammar,
    privilegedNonTerminals: NonTerminal[]
): [number[], Chart] {
    const { startSymbol, productions } = grammar;

    const startProduction: Production = productions.filter(
        (production) => production.lhs === startSymbol
    )[0];

    const startDotProduction: DotProduction = {
        lhs: startSymbol,
        beforeDot: [],
        afterDot: startProduction.rhs,
    };

    const chart: Chart = [
        {
            predict: [],
            scan: [],
            complete: [
                {
                    rowId: 0,
                    dotProduction: startDotProduction,
                    words: [0, 0],
                    history: [],
                },
            ],
        },
    ];

    let nextChartRow = 1;

    for (let i = 0; i < sentence.length; i++) {
        const word = sentence[i];

        const wordChart: WordChart = {
            predict: [],
            scan: [],
            complete: [],
        };

        const lastWordChart = chart[chart.length - 1];

        let predictResults = predict(
            lastWordChart.complete,
            productions,
            nextChartRow
        );
        nextChartRow = predictResults.nextRowId;
        wordChart.predict = predictResults.predictSection;
        let scanResults = scan(
            wordChart.predict,
            productions,
            nextChartRow,
            word,
            privilegedNonTerminals
        );
        nextChartRow = scanResults.nextRowId;
        wordChart.scan = scanResults.scanSection;

        let completeResults = complete(chart, wordChart, nextChartRow);
        nextChartRow = completeResults.nextRowId;
    }

    const derivations: number[] = [];

    for (const row of chart[chart.length - 1].complete) {
        const { rowId, words } = row;
        if (words[0] === 0 && words[1] === sentence.length) {
            derivations.push(rowId);
        }
    }

    return [derivations, chart];
}

function predict(
    rows: ChartSection,
    productions: Production[],
    nextRowId: number
): {
    nextRowId: number;
    predictSection: ChartSection;
} {
    const section: ChartSection = [];
    for (const row of rows) {
        const { dotProduction, words } = row;
        const { afterDot } = dotProduction;
        const end = words[1];

        if (afterDot.length === 0) continue;

        const toExpand = afterDot[0];
        const prods = productions.filter(
            (production) => production.lhs === toExpand
        );
        for (const prod of prods) {
            const newDotProduction: DotProduction = {
                lhs: toExpand,
                beforeDot: [],
                afterDot: prod.rhs,
            };
            const newRow: ChartRow = {
                rowId: nextRowId++,
                dotProduction: newDotProduction,
                words: [end, end],
                history: [],
            };
            section.push(newRow);
        }
    }
    return { nextRowId, predictSection: section };
}

function scan(
    rows: ChartSection,
    productions: Production[],
    nextRowId: number,
    word: Terminal,
    privilegedNonTerminals: NonTerminal[]
): {
    nextRowId: number;
    scanSection: ChartSection;
} {
    const section: ChartSection = [];
    const expanded = [];
    for (const row of rows) {
        const { dotProduction, words } = row;
        const end = words[1];
        const { lhs, afterDot } = dotProduction;
        const toExpand = afterDot[0];
        if (
            privilegedNonTerminals.indexOf(toExpand) > -1 &&
            productions.filter(
                (production) =>
                    production.lhs === toExpand && production.rhs[0] === word
            ).length > 0 &&
            expanded.indexOf(toExpand) === -1
        ) {
            expanded.push(toExpand);
            const newDotProduction: DotProduction = {
                lhs: toExpand,
                beforeDot: [word],
                afterDot: [],
            };
            const newRow: ChartRow = {
                rowId: nextRowId++,
                dotProduction: newDotProduction,
                words: [end, end + 1],
                history: [],
            };
            console.log("NEW", newRow);
            section.push(newRow);
        }
    }
    return { nextRowId, scanSection: section };
}

function complete(
    chart: Chart,
    wordChart: WordChart,
    nextRowId: number
): {
    nextRowId: number;
    chart: Chart;
} {
    const toPropagate: ChartSection = wordChart.scan.map((e) => e);

    while (toPropagate.length > 0) {
        const row = toPropagate.pop();
        const { rowId, dotProduction, words } = row;
        const [start, end] = words;
        const { lhs: from, beforeDot: to } = dotProduction;

        const flattenedWordChart = wordChart.predict
            .concat(wordChart.scan)
            .concat(wordChart.complete);

        const flattenedChart = flattenChart(chart).concat(flattenedWordChart);

        for (const row of flattenedChart) {
            const { dotProduction: dotProd, words, history } = row;
            const [s, e] = words;
            const { lhs, beforeDot, afterDot } = dotProd;
            if (e === start && afterDot.length > 0 && afterDot[0] === from) {
                const newDotProduction: DotProduction = {
                    lhs,
                    beforeDot: beforeDot.concat(from),
                    afterDot: afterDot.slice(1),
                };
                const newRow: ChartRow = {
                    rowId: nextRowId,
                    dotProduction: newDotProduction,
                    words: [s, end],
                    history: history.concat([rowId]),
                };
                if (
                    wordChart.complete.filter(
                        (e) =>
                            JSON.stringify([
                                e.dotProduction,
                                e.words,
                                e.history,
                            ]) ===
                            JSON.stringify([
                                newDotProduction,
                                newRow.words,
                                newRow.history,
                            ])
                    ).length > 0
                )
                    continue;
                nextRowId++;
                wordChart.complete.push(newRow);
                if (afterDot.length === 1) {
                    toPropagate.push(newRow);
                }
            }
        }
    }
    chart.push(wordChart);
    return {
        nextRowId,
        chart,
    };
}

export default parse;