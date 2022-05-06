import sys
from typing import Dict, List, Tuple

Symbol = str
NonTerminal = Symbol
Terminal = Symbol
Productions = Dict[Symbol, List[List[Symbol]]]
Grammar = Tuple[List[NonTerminal], List[Terminal], Symbol, Productions]
DotProduction = Tuple[Symbol, Tuple[List[Symbol], List[Symbol]]]
ChartRow = Tuple[int, DotProduction, Tuple[int, int], List[int]]
WordChart = Tuple[List[ChartRow], List[ChartRow], List[ChartRow]]


def flatten(chart: List[WordChart]) -> List[ChartRow]:
    """
    Flatten the given chart.

    Args:
        chart: A chart to flatten.

    Returns:
        A flattened chart.
    """
    return [
        row
        for word_chart in chart
        for section in word_chart
        for row in section
    ]


def parse(
    sentence: List[str],
    grammar: Grammar,
    privileged_nonterminals: List[NonTerminal],
) -> Tuple[List[int], List[WordChart]]:
    """
    Parse a sentence using the given grammar.

    Args:
        sentence: A sentence to be parsed.
        grammar: The grammar to use
        privileged_nonterminals: A list of nonterminals that lookahead is used
            for


    Returns:
        A tuple of the row ids of the derivations and the chart.
    """

    _, _, start_symbol, productions = grammar

    start_production: DotProduction = (
        start_symbol,
        ([], productions[start_symbol][0]),
    )

    chart: List[WordChart] = [([], [], [(0, start_production, (0, 0), [])])]
    next_row_id = 1

    for i, word in enumerate(sentence):
        word_chart: Tuple[List[ChartRow], List[ChartRow], List[ChartRow]] = (
            [],
            [],
            [],
        )
        lastword_chart = chart[-1]

        # Predict

        for chartrow in lastword_chart[2]:
            _, dotproduction, (_, end), _ = chartrow
            _, (_, after_dot) = dotproduction
            if not after_dot:
                continue
            toexpand: NonTerminal = after_dot[0]
            prods = productions[toexpand]
            for prod in prods:
                dotprod = (toexpand, ([], prod))
                row: ChartRow = (next_row_id, dotprod, (end, end), [])
                word_chart[0].append(row)
                next_row_id += 1

        # Scan

        expanded = []

        for chartrow in word_chart[0]:
            _, dotproduction, (_, end), _ = chartrow
            nonterminal, (_, after_dot) = dotproduction
            toexpand: NonTerminal = after_dot[0]
            if (
                toexpand in privileged_nonterminals
                and [word] in productions[toexpand]
                and toexpand not in expanded
            ):
                expanded.append(toexpand)
                dotprod = (toexpand, ([word], []))
                row: ChartRow = (next_row_id, dotprod, (end, end + 1), [])
                word_chart[1].append(row)
                next_row_id += 1

        # Complete

        to_propagate: List[ChartRow] = [e for e in word_chart[1]]

        while to_propagate:
            row_id, dotproduction, (start, end), _ = to_propagate.pop(0)
            before, (after, _) = dotproduction

            flattened_wc = word_chart[0] + word_chart[1] + word_chart[2]
            flattened_chart = flatten(chart) + flattened_wc

            for row in flattened_chart:
                _, dotprod, (s, e), hist = row
                nonterminal, (before_dot, after_dot) = dotprod
                if e == start and after_dot != [] and after_dot[0] == before:
                    new_dotprod: DotProduction = (
                        nonterminal,
                        (before_dot + [after_dot[0]], after_dot[1:]),
                    )
                    new_row: ChartRow = (
                        next_row_id,
                        new_dotprod,
                        (s, end),
                        hist + [row_id],
                    )
                    if True in [r[1:] == new_row[1:] for r in word_chart[2]]:
                        continue
                    word_chart[2].append(new_row)
                    next_row_id += 1
                    if after_dot[1:] == []:
                        to_propagate.append(new_row)

        chart.append(word_chart)

    derivations: List[int] = []
    last_chart_section = chart[-1][-1]

    for row in last_chart_section:
        row_id, _, range, _ = row
        if range == (0, len(sentence)):
            derivations.append(row_id)

    return derivations, chart


def print_parse_chart(
    sentence: List[str],
    grammar: Grammar,
    privileged_nonterminals: List[NonTerminal],
) -> None:
    """
    Print the parse chart for the given sentence.

    Args:
        sentence: A sentence to be parsed.
        grammar: The grammar to use
        privileged_nonterminals: A list of nonterminals that lookahead is used

    Returns:
        None
    """
    derivations, chart = parse(sentence, grammar, privileged_nonterminals)
    for word_chart in chart:
        for section in word_chart:
            for row in section:
                row_id, dotproduction, (start, end), hist = row
                nonterminal, (before_dot, after_dot) = dotproduction
                print(
                    f"{row_id} |"
                    f" {nonterminal} -> {' '.join(before_dot)} "
                    f". {' '.join(after_dot)} | [{start}, {end}] | "
                    f"{hist}"
                )
            print()
        print("--------")
        print()
    print(
        f"SUCCESS ({len(derivations)} derivations): {derivations}"
        if derivations
        else "FAILURE"
    )


def toygrammar(sentence: List[str]) -> None:
    """
    Print the parse chart for the given sentence.

    Args:
        sentence: A sentence to be parsed.

    Returns:
        None
    """

    nonterminals: List[NonTerminal] = ["S", "NP", "VP", "PP", "N", "V", "P"]
    terminals: List[Terminal] = [
        "can",
        "fish",
        "in",
        "rivers",
        "they",
        "december",
    ]
    start_symbol: Symbol = "S"
    productions: Productions = {
        "S": [["NP", "VP"], ],
        "NP": [["N"], ["N", "PP"], ],
        "PP": [["P", "NP"], ],
        "VP": [["V"], ["V", "NP"], ["V", "VP"], ["VP", "PP"], ],
        "N": [["can"], ["fish"], ["rivers"], ["they"], ["december"], ],
        "P": [["in"], ],
        "V": [["fish"], ["can"], ],
    }

    grammar: Grammar = (nonterminals, terminals, start_symbol, productions)
    privileged_nonterminals = ["N", "V", "P"]
    print_parse_chart(sentence, grammar, privileged_nonterminals)


def main(args: List[str]) -> None:
    """
    Main function.
    """
    toygrammar(args)


if __name__ == "__main__":
    main(sys.argv[1:])
