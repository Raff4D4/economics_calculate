import { parse, MathNode } from "mathjs";
import { FormulaToken, SolvedFormulaOutput } from "../types";
import { formatNumber, parseSmartInput } from "../formatters";

const RESERVED_FUNCTIONS = new Set([
  "sqrt",
  "abs",
  "log",
  "ln",
  "exp",
  "sin",
  "cos",
  "tan",
  "round",
  "floor",
  "ceil",
  "min",
  "max",
  "pow",
]);

const RESERVED_CONSTANTS = new Set(["pi", "PI"]);

export function normalizeFormulaInput(raw: string): string {
  return raw
    .replace(/\u00d7/g, "*")
    .replace(/\u00f7/g, "/")
    .replace(/\u2212/g, "-")
    .replace(/\bln\(/g, "log(")
    .trim();
}

export function tokenizeFormulaForDisplay(rawFormula: string): FormulaToken[] {
  const cleaned = normalizeFormulaInput(rawFormula);
  if (!cleaned) return [];

  const regex = /([a-zA-Z_][a-zA-Z0-9_]*|\d+(?:\.\d+)?|[=+*/^()-])/g;
  const tokens: FormulaToken[] = [];
  let match: RegExpExecArray | null = null;

  while ((match = regex.exec(cleaned)) !== null) {
    const tokenText = match[0];
    if (
      /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tokenText) &&
      !RESERVED_FUNCTIONS.has(tokenText) &&
      !RESERVED_CONSTANTS.has(tokenText)
    ) {
      tokens.push({ type: "variable", value: tokenText });
    } else if (/^[=+*/^()-]$/.test(tokenText)) {
      tokens.push({ type: "operator", value: tokenText });
    } else {
      tokens.push({ type: "text", value: tokenText });
    }
  }

  return tokens;
}

function extractVariablesFromNode(ast: MathNode): string[] {
  const detected: string[] = [];
  ast.traverse((node: MathNode, _path: string, parent: MathNode | null) => {
    if (node.type === "SymbolNode") {
      const symbolName = (node as unknown as { name: string }).name;
      const isFn =
        parent &&
        parent.type === "FunctionNode" &&
        (parent as unknown as { fn: MathNode }).fn === node;
      if (
        !isFn &&
        !RESERVED_FUNCTIONS.has(symbolName) &&
        !RESERVED_CONSTANTS.has(symbolName) &&
        !detected.includes(symbolName)
      ) {
        detected.push(symbolName);
      }
    }
  });
  return detected;
}

function solveNumerically(
  fn: (x: number) => number,
  initialGuesses: number[]
): number | null {
  for (const startGuess of initialGuesses) {
    let x0 = startGuess;
    let x1 = startGuess === 0 ? 1 : startGuess * 1.05;

    for (let iter = 0; iter < 80; iter++) {
      const y0 = fn(x0);
      const y1 = fn(x1);

      if (!Number.isFinite(y0) || !Number.isFinite(y1)) {
        break;
      }

      if (Math.abs(y1) < 1e-7) {
        return x1;
      }

      const denom = y1 - y0;
      if (Math.abs(denom) < 1e-13) {
        break;
      }

      const x2 = x1 - (y1 * (x1 - x0)) / denom;
      if (!Number.isFinite(x2)) {
        break;
      }

      if (Math.abs(x2 - x1) < 1e-7 && Math.abs(fn(x2)) < 1e-5) {
        return x2;
      }

      x0 = x1;
      x1 = x2;
    }
  }
  return null;
}

export function solveFormulaWithTarget(
  rawInput: string,
  rawVariableInputs: Record<string, string>,
  requestedTarget?: string
): SolvedFormulaOutput {
  const cleaned = normalizeFormulaInput(rawInput);

  if (!cleaned) {
    return {
      isValid: false,
      rawFormula: rawInput,
      lhsVariable: "Hasil",
      rhsExpression: "",
      allVariables: [],
      targetVariable: "Hasil",
      numericMap: {},
      substitutedText: "",
      result: null,
      error: "Ketik atau pilih rumus terlebih dahulu.",
    };
  }

  let lhsVariable = "Hasil";
  let rhsExpression = cleaned;

  if (cleaned.includes("=")) {
    const parts = cleaned.split("=");
    if (parts.length > 2) {
      return {
        isValid: false,
        rawFormula: rawInput,
        lhsVariable: "Hasil",
        rhsExpression: cleaned,
        allVariables: [],
        targetVariable: "Hasil",
        numericMap: {},
        substitutedText: "",
        result: null,
        error: "Gunakan satu tanda sama dengan (=) saja di dalam rumus.",
      };
    }
    const leftTrimmed = parts[0].trim();
    const rightTrimmed = parts[1].trim();
    if (leftTrimmed && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(leftTrimmed)) {
      lhsVariable = leftTrimmed;
    }
    rhsExpression = rightTrimmed;
  }

  if (!rhsExpression) {
    return {
      isValid: false,
      rawFormula: rawInput,
      lhsVariable,
      rhsExpression: "",
      allVariables: [],
      targetVariable: lhsVariable,
      numericMap: {},
      substitutedText: "",
      result: null,
      error: "Bagian kanan rumus setelah tanda (=) masih kosong.",
    };
  }

  try {
    const rhsAst = parse(rhsExpression);
    const rhsVars = extractVariablesFromNode(rhsAst);
    const allVariables = [
      lhsVariable,
      ...rhsVars.filter((v) => v !== lhsVariable),
    ];

    const targetVariable =
      requestedTarget && allVariables.includes(requestedTarget)
        ? requestedTarget
        : lhsVariable;

    const numericMap: Record<string, number> = {};
    for (const symbol of allVariables) {
      if (symbol === targetVariable) continue;
      const rawVal = rawVariableInputs[symbol] ?? "0";
      const parsedVal = parseSmartInput(rawVal);
      if (!parsedVal.isValid) {
        return {
          isValid: false,
          rawFormula: rawInput,
          lhsVariable,
          rhsExpression,
          allVariables,
          targetVariable,
          numericMap,
          substitutedText: "",
          result: null,
          error: `Format angka pada variabel ${symbol} ("${rawVal}") belum tepat.`,
        };
      }
      numericMap[symbol] = parsedVal.numeric;
    }

    const compiledRhs = rhsAst.compile();
    let solvedValue: number | null = null;

    if (targetVariable === lhsVariable && !rhsVars.includes(lhsVariable)) {
      const evaluated = compiledRhs.evaluate(numericMap);
      if (typeof evaluated === "number" && Number.isFinite(evaluated)) {
        solvedValue = evaluated;
      }
    } else {
      const lhsVal =
        targetVariable === lhsVariable ? 0 : numericMap[lhsVariable] ?? 0;

      const residualFn = (candidate: number): number => {
        const scope: Record<string, number> = {
          ...numericMap,
          [targetVariable]: candidate,
        };
        const leftSide =
          targetVariable === lhsVariable ? candidate : lhsVal;
        const rightSide = Number(compiledRhs.evaluate(scope));
        return leftSide - rightSide;
      };

      solvedValue = solveNumerically(residualFn, [
        1,
        100,
        10000,
        1000000,
        50000000,
        0.1,
        -100,
      ]);
    }

    if (solvedValue === null || !Number.isFinite(solvedValue)) {
      return {
        isValid: false,
        rawFormula: rawInput,
        lhsVariable,
        rhsExpression,
        allVariables,
        targetVariable,
        numericMap,
        substitutedText: "",
        result: null,
        error:
          "Nilai belum dapat dihitung (pastikan pembagi tidak nol dan angka masuk akal).",
      };
    }

    const fullScope: Record<string, number> = {
      ...numericMap,
      [targetVariable]: solvedValue,
    };

    let substitutedRhs = rhsExpression;
    const sortedVars = [...rhsVars].sort((a, b) => b.length - a.length);
    for (const sym of sortedVars) {
      const val = fullScope[sym];
      const textVal = formatNumber(val, 4);
      substitutedRhs = substitutedRhs.replace(
        new RegExp(`\\b${sym}\\b`, "g"),
        val < 0 ? `(${textVal})` : textVal
      );
    }

    const substitutedText = `${lhsVariable} (${formatNumber(
      fullScope[lhsVariable],
      4
    )}) = ${substitutedRhs}`;

    return {
      isValid: true,
      rawFormula: rawInput,
      lhsVariable,
      rhsExpression,
      allVariables,
      targetVariable,
      numericMap: fullScope,
      substitutedText,
      result: solvedValue,
      error: null,
    };
  } catch {
    return {
      isValid: false,
      rawFormula: rawInput,
      lhsVariable,
      rhsExpression,
      allVariables: [],
      targetVariable: lhsVariable,
      numericMap: {},
      substitutedText: "",
      result: null,
      error: "Penulisan rumus belum lengkap atau kurung belum ditutup.",
    };
  }
}
