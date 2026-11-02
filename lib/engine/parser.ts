import { parse, MathNode } from "mathjs";
import { ParsedFormulaOutput } from "../types";
import { formatNumber } from "../formatters";

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
    .replace(/\bln\(/g, "log(")
    .trim();
}

export function parseAndEvaluateFormula(
  rawInput: string,
  variableValues: Record<string, number>
): ParsedFormulaOutput {
  const cleaned = normalizeFormulaInput(rawInput);

  if (!cleaned) {
    return {
      isValid: false,
      rawFormula: rawInput,
      targetVariable: "Hasil",
      expression: "",
      variables: [],
      substitutedExpression: "",
      result: null,
      error: "Masukkan rumus terlebih dahulu.",
    };
  }

  let targetVariable = "Hasil";
  let expression = cleaned;

  if (cleaned.includes("=")) {
    const parts = cleaned.split("=");
    if (parts.length > 2) {
      return {
        isValid: false,
        rawFormula: rawInput,
        targetVariable: "Hasil",
        expression: cleaned,
        variables: [],
        substitutedExpression: "",
        result: null,
        error: "Rumus hanya boleh memiliki satu tanda sama dengan (=).",
      };
    }
    const lhs = parts[0].trim();
    const rhs = parts[1].trim();
    if (lhs && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(lhs)) {
      targetVariable = lhs;
    }
    expression = rhs;
  }

  if (!expression) {
    return {
      isValid: false,
      rawFormula: rawInput,
      targetVariable,
      expression: "",
      variables: [],
      substitutedExpression: "",
      result: null,
      error: "Ekspresi perhitungan di sebelah kanan tanda (=) masih kosong.",
    };
  }

  try {
    const ast: MathNode = parse(expression);
    const detectedVars: string[] = [];

    ast.traverse((node: MathNode, _path: string, parent: MathNode | null) => {
      if (node.type === "SymbolNode") {
        const symbolName = (node as unknown as { name: string }).name;
        const isFunctionCall =
          parent &&
          parent.type === "FunctionNode" &&
          (parent as unknown as { fn: MathNode }).fn === node;

        if (
          !isFunctionCall &&
          !RESERVED_FUNCTIONS.has(symbolName) &&
          !RESERVED_CONSTANTS.has(symbolName)
        ) {
          if (!detectedVars.includes(symbolName)) {
            detectedVars.push(symbolName);
          }
        }
      }
    });

    const scope: Record<string, number> = {};
    for (const variableName of detectedVars) {
      const candidate = variableValues[variableName];
      scope[variableName] =
        typeof candidate === "number" && Number.isFinite(candidate) ? candidate : 0;
    }

    let substituted = expression;
    const sortedVars = [...detectedVars].sort((a, b) => b.length - a.length);
    for (const variableName of sortedVars) {
      const numericValue = scope[variableName];
      const formattedVal =
        numericValue < 0
          ? `(${formatNumber(numericValue, 4)})`
          : formatNumber(numericValue, 4);
      const matcher = new RegExp(`\\b${variableName}\\b`, "g");
      substituted = substituted.replace(matcher, formattedVal);
    }

    const compiled = ast.compile();
    const evaluatedResult = compiled.evaluate(scope);

    if (typeof evaluatedResult !== "number" || !Number.isFinite(evaluatedResult)) {
      return {
        isValid: false,
        rawFormula: rawInput,
        targetVariable,
        expression,
        variables: detectedVars,
        substitutedExpression: `${targetVariable} = ${substituted}`,
        result: null,
        error: "Hasil tidak terdefinisi karena pembagian nol atau nilai ekstrem.",
      };
    }

    return {
      isValid: true,
      rawFormula: rawInput,
      targetVariable,
      expression,
      variables: detectedVars,
      substitutedExpression: `${targetVariable} = ${substituted}`,
      result: evaluatedResult,
      error: null,
    };
  } catch {
    return {
      isValid: false,
      rawFormula: rawInput,
      targetVariable,
      expression,
      variables: [],
      substitutedExpression: "",
      result: null,
      error: "Sintaks rumus belum lengkap atau tanda kurung belum seimbang.",
    };
  }
}

