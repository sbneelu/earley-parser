import { printParseChart } from "./parser";

function toyGrammar(sentence: string[]) {
    const nonTerminals = ["S", "NP", "VP", "PP", "N", "V", "P"];
    const terminals = ["can", "fish", "in", "rivers", "they", "december"];
    const startSymbol = "S";
    const productions = [
        { lhs: "S", rhs: ["NP", "VP"] },
        { lhs: "NP", rhs: ["N"] },
        { lhs: "NP", rhs: ["N", "PP"] },
        { lhs: "PP", rhs: ["P", "NP"] },
        { lhs: "VP", rhs: ["V"] },
        { lhs: "VP", rhs: ["V", "NP"] },
        { lhs: "VP", rhs: ["V", "VP"] },
        { lhs: "VP", rhs: ["VP", "PP"] },
        { lhs: "N", rhs: ["can"] },
        { lhs: "N", rhs: ["fish"] },
        { lhs: "N", rhs: ["rivers"] },
        { lhs: "N", rhs: ["they"] },
        { lhs: "N", rhs: ["december"] },
        { lhs: "P", rhs: ["in"] },
        { lhs: "V", rhs: ["fish"] },
        { lhs: "V", rhs: ["can"] },
    ];
    const grammar = {
        nonTerminals,
        terminals,
        startSymbol,
        productions,
    };
    const privilegedNonTerminals = ["N", "V", "P"];
    printParseChart(
        sentence,
        grammar,
        privilegedNonTerminals,
        console.log
    );
}


function main() {
    toyGrammar("they can fish in rivers".split(" "));
}