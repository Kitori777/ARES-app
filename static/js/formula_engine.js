(function () {
    const aliases = {
        "SUM": "SUMA",
        "AVERAGE": "ŚREDNIA",
        "SREDNIA": "ŚREDNIA",
        "MEDIAN": "MEDIANA",
        "MIN": "MINIMUM",
        "MAX": "MAXIMUM",
        "COUNT": "ZLICZ",
        "STDEV": "ODCHYLENIE",
        "VAR": "WARIANCJA",
        "STANDARDIZE": "STANDARYZACJA",
        "SQRT": "PIERWIASTEK",
        "POW": "MOC",
        "LEFT": "LEWO",
        "RIGHT": "PRAWO",
        "TODAY": "DZIŚ",
        "NOW": "TERAZ",
        "FILTER": "FILTRUJ",
        "QUERY": "ZAPYTANIE",
        "TRANSPOSE": "TRANSPOZYCJA",
        "MMULT": "MULTI",
        "VLOOKUP": "WYSZUKAJ",
        "SUMA.JEŻELI": "SUMIF",
        "SUMA-JEŻELI": "SUMIF",
        "CALKA": "CAŁKA",
        "INTEGRAL": "CAŁKA",
        "DERIVATIVE": "POCHODNA",
        "WARTOSC.FUNKCJI": "WARTOŚĆ.FUNKCJI",
        "KOMBINACJE": "KOMBINACJE",
        "COMBIN": "KOMBINACJE",
        "PERMUTACJE": "PERMUTACJE",
        "PERMUT": "WARIACJE",
        "SLOPE": "NACHYLENIE",
        "INTERCEPT": "WYRAZ.WOLNY",
        "RSQ": "R2",
        "FORECAST": "PROGNOZA",
    };

    function resolveName(name) {
        const upper = String(name || "").trim().toUpperCase();
        return aliases[upper] || upper;
    }

    function splitArgs(text) {
        const args = [];
        let current = "";
        let depth = 0;
        let inQuotes = false;

        for (let i = 0; i < text.length; i += 1) {
            const ch = text[i];

            if (ch === '"') {
                inQuotes = !inQuotes;
                current += ch;
                continue;
            }

            if (!inQuotes) {
                if (ch === "(") depth += 1;
                if (ch === ")") depth -= 1;

                if ((ch === ";" || ch === ",") && depth === 0) {
                    args.push(current.trim());
                    current = "";
                    continue;
                }
            }

            current += ch;
        }

        if (current.trim()) args.push(current.trim());
        return args;
    }

    function factorial(n) {
        const value = Math.floor(Number(n));
        if (!Number.isFinite(value) || value < 0) return "#BŁĄD";
        let result = 1;
        for (let i = 2; i <= value; i += 1) result *= i;
        return result;
    }

    function erf(x) {
        const sign = x >= 0 ? 1 : -1;
        const a1 = 0.254829592;
        const a2 = -0.284496736;
        const a3 = 1.421413741;
        const a4 = -1.453152027;
        const a5 = 1.061405429;
        const p = 0.3275911;
        const absx = Math.abs(x);
        const t = 1 / (1 + p * absx);
        const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absx * absx);
        return sign * y;
    }

    function normalizeScalar(token, ctx, visited) {
        const trimmed = String(token ?? "").trim();
        if (!trimmed) return "";

        if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
            return trimmed.slice(1, -1);
        }

        const ref = ctx.cellRefToIndex(trimmed);
        if (ref) {
            return ctx.getCellComputedValue(ref.row, ref.col, visited);
        }

        if (trimmed.startsWith("=")) {
            return evaluate(trimmed, ctx, visited);
        }

        if (ctx.isNumericValue(trimmed)) {
            return ctx.parseNumber(trimmed);
        }

        if (trimmed.toUpperCase() === "TRUE") return true;
        if (trimmed.toUpperCase() === "FALSE") return false;

        return trimmed;
    }

    function compare(a, op, b, ctx) {
        const leftNum = ctx.isNumericValue(a) ? ctx.parseNumber(a) : null;
        const rightNum = ctx.isNumericValue(b) ? ctx.parseNumber(b) : null;

        if (leftNum !== null && rightNum !== null) {
            switch (op) {
                case ">": return leftNum > rightNum;
                case "<": return leftNum < rightNum;
                case ">=": return leftNum >= rightNum;
                case "<=": return leftNum <= rightNum;
                case "=":
                case "==": return leftNum === rightNum;
                case "!=":
                case "<>": return leftNum !== rightNum;
                default: return false;
            }
        }

        const left = String(a ?? "");
        const right = String(b ?? "");
        switch (op) {
            case "=":
            case "==": return left === right;
            case "!=":
            case "<>": return left !== right;
            case ">": return left > right;
            case "<": return left < right;
            case ">=": return left >= right;
            case "<=": return left <= right;
            default: return false;
        }
    }

    function parseCondition(raw, ctx, visited) {
        const text = String(raw || "").trim();
        const match = text.match(/^(.*?)(>=|<=|<>|!=|=|==|>|<)(.*)$/);
        if (match) {
            return {
                left: normalizeScalar(match[1].trim(), ctx, visited),
                op: match[2],
                right: normalizeScalar(match[3].trim(), ctx, visited)
            };
        }

        return {
            left: true,
            op: "==",
            right: normalizeScalar(text, ctx, visited)
        };
    }

    function rangeValues(rangeText, ctx, visited) {
        return ctx.getRangeMatrix(rangeText, true, visited).flat();
    }

    function rangeMatrix(rangeText, ctx, visited) {
        return ctx.getRangeMatrix(rangeText, true, visited);
    }

    function ensureComplex(value) {
        const text = String(value || "").replace(/\s+/g, "").replace("j", "i");
        if (/^[+-]?\d+(\.\d+)?$/.test(text)) {
            return { re: Number(text), im: 0 };
        }
        const m = text.match(/^([+-]?\d+(\.\d+)?)?([+-]\d+(\.\d+)?)i$/);
        if (m) {
            return {
                re: m[1] ? Number(m[1]) : 0,
                im: Number(m[3])
            };
        }
        if (/^[+-]?\d+(\.\d+)?i$/.test(text)) {
            return { re: 0, im: Number(text.replace("i", "")) };
        }
        return { re: 0, im: 0 };
    }

    function complexToString(z) {
        const re = Number(z.re.toFixed(10));
        const im = Number(z.im.toFixed(10));
        if (im === 0) return String(re);
        if (re === 0) return `${im}i`;
        return `${re}${im >= 0 ? "+" : ""}${im}i`;
    }

    function cAdd(a, b) { return { re: a.re + b.re, im: a.im + b.im }; }
    function cSub(a, b) { return { re: a.re - b.re, im: a.im - b.im }; }
    function cMul(a, b) { return { re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re }; }
    function cDiv(a, b) {
        const d = b.re * b.re + b.im * b.im;
        if (d === 0) return { re: NaN, im: NaN };
        return {
            re: (a.re * b.re + a.im * b.im) / d,
            im: (a.im * b.re - a.re * b.im) / d
        };
    }
    function cAbs(a) { return Math.sqrt(a.re * a.re + a.im * a.im); }
    function cArg(a) { return Math.atan2(a.im, a.re); }
    function cExp(a) {
        const ex = Math.exp(a.re);
        return { re: ex * Math.cos(a.im), im: ex * Math.sin(a.im) };
    }
    function cLog(a) {
        return { re: Math.log(cAbs(a)), im: cArg(a) };
    }
    function cSin(a) {
        return { re: Math.sin(a.re) * Math.cosh(a.im), im: Math.cos(a.re) * Math.sinh(a.im) };
    }
    function cCos(a) {
        return { re: Math.cos(a.re) * Math.cosh(a.im), im: -Math.sin(a.re) * Math.sinh(a.im) };
    }
    function cTan(a) { return cDiv(cSin(a), cCos(a)); }
    function cSinh(a) {
        return { re: Math.sinh(a.re) * Math.cos(a.im), im: Math.cosh(a.re) * Math.sin(a.im) };
    }
    function cCosh(a) {
        return { re: Math.cosh(a.re) * Math.cos(a.im), im: Math.sinh(a.re) * Math.sin(a.im) };
    }
    function cTanh(a) { return cDiv(cSinh(a), cCosh(a)); }
    function cInv(a) { return cDiv({ re: 1, im: 0 }, a); }


    function evalMathExpression(expr, vars = {}) {
        let text = String(expr || "").replace(/,/g, ".").trim();
        text = text.replace(/\bPI\b/gi, "Math.PI").replace(/\bE\b/g, "Math.E");
        text = text.replace(/\bSIN\(/gi, "Math.sin(").replace(/\bCOS\(/gi, "Math.cos(").replace(/\bTAN\(/gi, "Math.tan(");
        text = text.replace(/\bASIN\(/gi, "Math.asin(").replace(/\bACOS\(/gi, "Math.acos(").replace(/\bATAN\(/gi, "Math.atan(");
        text = text.replace(/\bLN\(/gi, "Math.log(").replace(/\bLOG\(/gi, "Math.log10(").replace(/\bEXP\(/gi, "Math.exp(");
        text = text.replace(/\bSQRT\(/gi, "Math.sqrt(").replace(/\bABS\(/gi, "Math.abs(").replace(/\bMOC\(/gi, "Math.pow(");
        text = text.replace(/\^/g, "**");
        if (/[^0-9A-Za-z_+\-*/().,\s<>=!&|%*]/.test(text)) return NaN;
        const names = Object.keys(vars);
        const values = names.map(k => Number(vars[k]));
        try { return Function(...names, "\"use strict\"; return (" + text + ");")(...values); } catch { return NaN; }
    }

    function normalCdf(z) {
        return 0.5 * (1 + erf(z / Math.SQRT2));
    }

    function linearStats(x, y) {
        if (!x.length || x.length !== y.length) return null;
        const n = x.length;
        const mx = x.reduce((a,b)=>a+b,0)/n;
        const my = y.reduce((a,b)=>a+b,0)/n;
        const sxx = x.reduce((a,v)=>a+(v-mx)**2,0);
        const sxy = x.reduce((a,v,i)=>a+(v-mx)*(y[i]-my),0);
        if (sxx === 0) return null;
        const slope = sxy/sxx;
        const intercept = my - slope*mx;
        const ssTot = y.reduce((a,v)=>a+(v-my)**2,0);
        const ssRes = y.reduce((a,v,i)=>a+(v-(slope*x[i]+intercept))**2,0);
        const r2 = ssTot === 0 ? 1 : 1 - ssRes/ssTot;
        return { slope, intercept, r2 };
    }

    function npv(rate, values) {

    return values.reduce((acc, v, i) => acc + (v / Math.pow(1 + rate, i + 1)), 0);
    }

    function pmt(rate, periods, principal) {
        if (!rate) return periods ? -(principal / periods) : 0;
        return -(rate * principal) / (1 - Math.pow(1 + rate, -periods));
    }

    function evaluate(formulaText, ctx, visited = new Set()) {
        const formula = String(formulaText || "").trim();
        if (!formula.startsWith("=")) return formula;

        const body = formula.slice(1).trim();
        const fnMatch = body.match(/^([A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż._]+)\((.*)\)$/);
        if (!fnMatch) {
            const ref = ctx.cellRefToIndex(body);
            if (ref) return ctx.getCellComputedValue(ref.row, ref.col, visited);
            const arithmetic = body.replace(/\$?[A-Z]+\$?\d+/gi, token => {
                const clean = token.replace(/\$/g, "");
                const cell = ctx.cellRefToIndex(clean);
                if (!cell) return token;
                const value = ctx.getCellComputedValue(cell.row, cell.col, visited);
                return ctx.isNumericValue(value) ? String(ctx.parseNumber(value)) : "0";
            });
            if (/^[0-9+\-*/().,\s%^A-Za-z_]+$/.test(arithmetic)) {
                const value = evalMathExpression(arithmetic, { x: 0, y: 0 });
                if (Number.isFinite(value)) return value;
            }
            return body;
        }

        const fn = resolveName(fnMatch[1]);
        const args = splitArgs(fnMatch[2]);

        try {
            if (fn === "SUMA") return args.flatMap(a => /^\$?[A-Z]+\$?\d+:\$?[A-Z]+\$?\d+$/i.test(a) ? rangeValues(a, ctx, visited) : [normalizeScalar(a, ctx, visited)]).reduce((s, v) => s + ctx.parseNumber(v), 0);
            if (fn === "ŚREDNIA") {
                const vals = args.flatMap(a => /^\$?[A-Z]+\$?\d+:\$?[A-Z]+\$?\d+$/i.test(a) ? rangeValues(a, ctx, visited) : [normalizeScalar(a, ctx, visited)]).map(ctx.parseNumber);
                return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
            }
            if (fn === "MEDIANA") {
                const vals = rangeValues(args[0], ctx, visited).map(ctx.parseNumber).sort((a, b) => a - b);
                if (!vals.length) return 0;
                const mid = Math.floor(vals.length / 2);
                return vals.length % 2 === 0 ? (vals[mid - 1] + vals[mid]) / 2 : vals[mid];
            }
            if (fn === "MINIMUM") return Math.min(...rangeValues(args[0], ctx, visited).map(ctx.parseNumber));
            if (fn === "MAXIMUM") return Math.max(...rangeValues(args[0], ctx, visited).map(ctx.parseNumber));
            if (fn === "ZLICZ") return rangeValues(args[0], ctx, visited).filter(ctx.isNumericValue).length;
            if (fn === "ODCHYLENIE") {
                const vals = rangeValues(args[0], ctx, visited).map(ctx.parseNumber);
                if (!vals.length) return 0;
                const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
                return Math.sqrt(vals.reduce((a, b) => a + (b - avg) ** 2, 0) / vals.length);
            }
            if (fn === "WARIANCJA") {
                const vals = rangeValues(args[0], ctx, visited).map(ctx.parseNumber);
                if (!vals.length) return 0;
                const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
                return vals.reduce((a, b) => a + (b - avg) ** 2, 0) / vals.length;
            }
            if (fn === "STANDARYZACJA") {
                if (args.length >= 3) {
                    const x = ctx.parseNumber(normalizeScalar(args[0], ctx, visited));
                    const mean = ctx.parseNumber(normalizeScalar(args[1], ctx, visited));
                    const sigma = ctx.parseNumber(normalizeScalar(args[2], ctx, visited));
                    return sigma === 0 ? 0 : (x - mean) / sigma;
                }
                const vals = rangeValues(args[0], ctx, visited).map(ctx.parseNumber);
                if (!vals.length) return [];
                const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
                const sigma = Math.sqrt(vals.reduce((a, b) => a + (b - avg) ** 2, 0) / vals.length) || 1;
                return vals.map(v => [(v - avg) / sigma]);
            }

            if (fn === "ABS") return Math.abs(ctx.parseNumber(normalizeScalar(args[0], ctx, visited)));
            if (fn === "ROUND") return Number(ctx.parseNumber(normalizeScalar(args[0], ctx, visited)).toFixed(parseInt(normalizeScalar(args[1], ctx, visited) || 0, 10)));
            if (fn === "PIERWIASTEK") return Math.sqrt(Math.max(0, ctx.parseNumber(normalizeScalar(args[0], ctx, visited))));
            if (fn === "MOC") return Math.pow(ctx.parseNumber(normalizeScalar(args[0], ctx, visited)), ctx.parseNumber(normalizeScalar(args[1], ctx, visited)));
            if (fn === "LN") return Math.log(ctx.parseNumber(normalizeScalar(args[0], ctx, visited)));
            if (fn === "LOG") return Math.log(ctx.parseNumber(normalizeScalar(args[0], ctx, visited))) / Math.log(ctx.parseNumber(normalizeScalar(args[1], ctx, visited) || 10));
            if (fn === "EXP") return Math.exp(ctx.parseNumber(normalizeScalar(args[0], ctx, visited)));
            if (fn === "SIN") return Math.sin(ctx.parseNumber(normalizeScalar(args[0], ctx, visited)));
            if (fn === "COS") return Math.cos(ctx.parseNumber(normalizeScalar(args[0], ctx, visited)));
            if (fn === "TAN") return Math.tan(ctx.parseNumber(normalizeScalar(args[0], ctx, visited)));
            if (fn === "MOD") return ctx.parseNumber(normalizeScalar(args[0], ctx, visited)) % ctx.parseNumber(normalizeScalar(args[1], ctx, visited));
            if (fn === "ILOCZYN") return args.flatMap(a => /^\$?[A-Z]+\$?\d+:\$?[A-Z]+\$?\d+$/i.test(a) ? rangeValues(a, ctx, visited) : [normalizeScalar(a, ctx, visited)]).reduce((p, v) => p * ctx.parseNumber(v), 1);
            if (fn === "INT") return Math.floor(ctx.parseNumber(normalizeScalar(args[0], ctx, visited)));
            if (fn === "TRUNC") {
                const val = ctx.parseNumber(normalizeScalar(args[0], ctx, visited));
                const digits = parseInt(normalizeScalar(args[1], ctx, visited) || 0, 10);
                const pow = Math.pow(10, digits);
                return Math.trunc(val * pow) / pow;
            }
            if (fn === "SILNIA") return factorial(ctx.parseNumber(normalizeScalar(args[0], ctx, visited)));
            if (fn === "SIGN") return Math.sign(ctx.parseNumber(normalizeScalar(args[0], ctx, visited)));
            if (fn === "QUOTIENT") return Math.trunc(ctx.parseNumber(normalizeScalar(args[0], ctx, visited)) / ctx.parseNumber(normalizeScalar(args[1], ctx, visited)));
            if (fn === "LOS") return Math.random();
            if (fn === "LOS.ZAKR") {
                const min = Math.ceil(ctx.parseNumber(normalizeScalar(args[0], ctx, visited)));
                const max = Math.floor(ctx.parseNumber(normalizeScalar(args[1], ctx, visited)));
                return Math.floor(Math.random() * (max - min + 1)) + min;
            }
            if (fn === "SUMA.ILOCZYNÓW") {
                const a = rangeValues(args[0], ctx, visited).map(ctx.parseNumber);
                const b = rangeValues(args[1], ctx, visited).map(ctx.parseNumber);
                return a.reduce((s, v, i) => s + v * (b[i] ?? 0), 0);
            }

            if (fn === "CORREL") {
                const x = rangeValues(args[0], ctx, visited).map(ctx.parseNumber);
                const y = rangeValues(args[1], ctx, visited).map(ctx.parseNumber);
                if (!x.length || x.length !== y.length) return "#BŁĄD";
                const avgX = x.reduce((a, b) => a + b, 0) / x.length;
                const avgY = y.reduce((a, b) => a + b, 0) / y.length;
                const numerator = x.reduce((acc, value, idx) => acc + ((value - avgX) * (y[idx] - avgY)), 0);
                const denominator = Math.sqrt(
                    x.reduce((acc, value) => acc + ((value - avgX) ** 2), 0) *
                    y.reduce((acc, value) => acc + ((value - avgY) ** 2), 0)
                );
                return denominator === 0 ? 0 : numerator / denominator;
            }

            if (fn === "RANK") {
                const value = ctx.parseNumber(normalizeScalar(args[0], ctx, visited));
                const vals = rangeValues(args[1], ctx, visited).map(ctx.parseNumber).sort((a, b) => b - a);
                return vals.indexOf(value) + 1 || "#N/D";
            }

            if (fn === "ŚREDNIA.WAŻONA") {
                const values = rangeValues(args[0], ctx, visited).map(ctx.parseNumber);
                const weights = rangeValues(args[1], ctx, visited).map(ctx.parseNumber);
                const sw = weights.reduce((a, b) => a + b, 0);
                if (!sw) return 0;
                return values.reduce((a, v, i) => a + v * (weights[i] ?? 0), 0) / sw;
            }

            if (fn === "PERCENTYL") {
                const vals = rangeValues(args[0], ctx, visited).map(ctx.parseNumber).sort((a, b) => a - b);
                const p = ctx.parseNumber(normalizeScalar(args[1], ctx, visited));
                if (!vals.length) return 0;
                const idx = Math.max(0, Math.min(vals.length - 1, Math.round((vals.length - 1) * p)));
                return vals[idx];
            }

            if (fn === "KWARTYL") {
                const q = parseInt(normalizeScalar(args[1], ctx, visited), 10);
                const p = q / 4;
                return evaluate(`=PERCENTYL(${args[0]};${p})`, ctx, visited);
            }

            if (fn === "DOMINANTA") {
                const vals = rangeValues(args[0], ctx, visited);
                const map = new Map();
                vals.forEach(v => map.set(String(v), (map.get(String(v)) || 0) + 1));
                let best = null, bestCount = -1;
                map.forEach((count, value) => {
                    if (count > bestCount) {
                        best = value;
                        bestCount = count;
                    }
                });
                return best ?? "";
            }

            if (fn === "ŚREDNIA.GEOMETRYCZNA") {
                const vals = rangeValues(args[0], ctx, visited).map(ctx.parseNumber);
                if (!vals.length) return 0;
                return Math.pow(vals.reduce((a, b) => a * b, 1), 1 / vals.length);
            }

            if (fn === "ŚREDNIA.HARMONICZNA") {
                const vals = rangeValues(args[0], ctx, visited).map(ctx.parseNumber);
                if (!vals.length) return 0;
                return vals.length / vals.reduce((a, b) => a + 1 / b, 0);
            }

            if (fn === "MAXA") {
                const vals = rangeValues(args[0], ctx, visited).map(v => typeof v === "boolean" ? (v ? 1 : 0) : ctx.parseNumber(v));
                return Math.max(...vals);
            }

            if (fn === "MINA") {
                const vals = rangeValues(args[0], ctx, visited).map(v => typeof v === "boolean" ? (v ? 1 : 0) : ctx.parseNumber(v));
                return Math.min(...vals);
            }

            if (fn === "LICZ.JEŻELI.WIELE") {
                const conds = [];
                for (let i = 0; i < args.length; i += 2) {
                    conds.push([rangeValues(args[i], ctx, visited), parseCondition(args[i + 1], ctx, visited)]);
                }
                const length = conds[0]?.[0]?.length || 0;
                let count = 0;
                for (let i = 0; i < length; i += 1) {
                    const ok = conds.every(([vals, cond]) => compare(vals[i], cond.op, cond.right, ctx));
                    if (ok) count += 1;
                }
                return count;
            }

            if (fn === "ŚREDNIA.JEŻELI") {
                const range = rangeValues(args[0], ctx, visited);
                const cond = parseCondition(args[1], ctx, visited);
                const avgRange = args[2] ? rangeValues(args[2], ctx, visited) : range;
                const vals = range.reduce((acc, v, i) => {
                    if (compare(v, cond.op, cond.right, ctx)) acc.push(ctx.parseNumber(avgRange[i]));
                    return acc;
                }, []);
                return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
            }

            if (fn === "ŚREDNIA.JEŻELI.WIELE") {
                const avgRange = rangeValues(args[0], ctx, visited);
                const conditions = [];
                for (let i = 1; i < args.length; i += 2) {
                    conditions.push([rangeValues(args[i], ctx, visited), parseCondition(args[i + 1], ctx, visited)]);
                }
                const vals = avgRange.filter((_, idx) => conditions.every(([vals, cond]) => compare(vals[idx], cond.op, cond.right, ctx))).map(ctx.parseNumber);
                return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
            }

            if (fn === "IF") {
                const cond = parseCondition(args[0], ctx, visited);
                return compare(cond.left, cond.op, cond.right, ctx)
                    ? normalizeScalar(args[1], ctx, visited)
                    : normalizeScalar(args[2], ctx, visited);
            }

            if (fn === "AND") return args.every(arg => {
                const c = parseCondition(arg, ctx, visited);
                return compare(c.left, c.op, c.right, ctx);
            });

            if (fn === "OR") return args.some(arg => {
                const c = parseCondition(arg, ctx, visited);
                return compare(c.left, c.op, c.right, ctx);
            });

            if (fn === "IFERROR") {
                try {
                    const result = normalizeScalar(args[0], ctx, visited);
                    if (String(result).startsWith("#")) throw new Error();
                    return result;
                } catch {
                    return normalizeScalar(args[1], ctx, visited);
                }
            }

            if (fn === "PI") {
                const rate = ctx.parseNumber(normalizeScalar(args[0], ctx, visited));
                const inflows = /^\$?[A-Z]+\$?\d+:\$?[A-Z]+\$?\d+$/i.test(args[1])
                    ? rangeValues(args[1], ctx, visited).map(ctx.parseNumber)
                    : args.slice(1, -1).map(a => ctx.parseNumber(normalizeScalar(a, ctx, visited)));
                const investment = ctx.parseNumber(normalizeScalar(args[args.length - 1], ctx, visited));

                if (!investment) return "#BŁĄD";
                return npv(rate, inflows) / investment;
            }

            if (fn === "TP") {
                const rate = ctx.parseNumber(normalizeScalar(args[0], ctx, visited));
                const periods = ctx.parseNumber(normalizeScalar(args[1], ctx, visited));
                const principal = ctx.parseNumber(normalizeScalar(args[2], ctx, visited));
                return Math.abs(pmt(rate, periods, principal) * periods);
            }

            if (fn === "LEN") return String(normalizeScalar(args[0], ctx, visited) ?? "").length;
            if (fn === "CONCAT") return args.map(a => String(normalizeScalar(a, ctx, visited) ?? "")).join("");
            if (fn === "LEWO") {
                const text = String(normalizeScalar(args[0], ctx, visited) ?? "");
                const n = Math.max(0, parseInt(normalizeScalar(args[1], ctx, visited) || 0, 10));
                return text.slice(0, n);
            }
            if (fn === "PRAWO") {
                const text = String(normalizeScalar(args[0], ctx, visited) ?? "");
                const n = Math.max(0, parseInt(normalizeScalar(args[1], ctx, visited) || 0, 10));
                return text.slice(text.length - n);
            }
            if (fn === "TEXT") return String(normalizeScalar(args[0], ctx, visited));
            if (fn === "VALUE") return ctx.parseNumber(normalizeScalar(args[0], ctx, visited));
            if (fn === "LOWER") return String(normalizeScalar(args[0], ctx, visited)).toLowerCase();
            if (fn === "UPPER") return String(normalizeScalar(args[0], ctx, visited)).toUpperCase();
            if (fn === "PROPER") return String(normalizeScalar(args[0], ctx, visited)).replace(/\w\S*/g, s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase());
            if (fn === "TRIM") return String(normalizeScalar(args[0], ctx, visited)).trim().replace(/\s+/g, " ");
            if (fn === "SPLIT") return String(normalizeScalar(args[0], ctx, visited)).split(String(normalizeScalar(args[1], ctx, visited))).map(v => [v]);
            if (fn === "JOIN") {
                const delimiter = String(normalizeScalar(args[0], ctx, visited));
                const vals = /^\$?[A-Z]+\$?\d+:\$?[A-Z]+\$?\d+$/i.test(args[1]) ? rangeValues(args[1], ctx, visited) : args.slice(1).map(a => normalizeScalar(a, ctx, visited));
                return vals.join(delimiter);
            }
            if (fn === "SUBSTITUTE") {
                const text = String(normalizeScalar(args[0], ctx, visited));
                const oldText = String(normalizeScalar(args[1], ctx, visited));
                const newText = String(normalizeScalar(args[2], ctx, visited));
                return text.split(oldText).join(newText);
            }
            if (fn === "REPLACE") {
                const text = String(normalizeScalar(args[0], ctx, visited));
                const pos = parseInt(normalizeScalar(args[1], ctx, visited), 10) - 1;
                const len = parseInt(normalizeScalar(args[2], ctx, visited), 10);
                const replacement = String(normalizeScalar(args[3], ctx, visited));
                return text.slice(0, pos) + replacement + text.slice(pos + len);
            }
            if (fn === "MID") {
                const text = String(normalizeScalar(args[0], ctx, visited));
                const start = parseInt(normalizeScalar(args[1], ctx, visited), 10) - 1;
                const len = parseInt(normalizeScalar(args[2], ctx, visited), 10);
                return text.slice(start, start + len);
            }
            if (fn === "FIND") return String(normalizeScalar(args[0], ctx, visited)).length
                ? String(normalizeScalar(args[1], ctx, visited)).indexOf(String(normalizeScalar(args[0], ctx, visited))) + 1
                : 0;
            if (fn === "SEARCH") {
                const needle = String(normalizeScalar(args[0], ctx, visited)).toLowerCase();
                const hay = String(normalizeScalar(args[1], ctx, visited)).toLowerCase();
                return hay.indexOf(needle) + 1;
            }
            if (fn === "REPT") return String(normalizeScalar(args[0], ctx, visited)).repeat(parseInt(normalizeScalar(args[1], ctx, visited), 10));
            if (fn === "CLEAN") return String(normalizeScalar(args[0], ctx, visited)).replace(/[\x00-\x1F\x7F]/g, "");
            if (fn === "EXACT") return String(normalizeScalar(args[0], ctx, visited)) === String(normalizeScalar(args[1], ctx, visited));

            if (fn === "MATCH") {
                const value = normalizeScalar(args[0], ctx, visited);
                const vals = rangeValues(args[1], ctx, visited);
                const idx = vals.findIndex(v => String(v) === String(value));
                return idx >= 0 ? idx + 1 : "#N/D";
            }
            if (fn === "INDEX") {
                const matrix = rangeMatrix(args[0], ctx, visited);
                const r = Math.max(1, parseInt(normalizeScalar(args[1], ctx, visited) || 1, 10));
                const c = Math.max(1, parseInt(normalizeScalar(args[2], ctx, visited) || 1, 10));
                return matrix[r - 1]?.[c - 1] ?? "";
            }
            if (fn === "WYSZUKAJ") {
                const needle = normalizeScalar(args[0], ctx, visited);
                const matrix = rangeMatrix(args[1], ctx, visited);
                const colIndex = Math.max(1, parseInt(normalizeScalar(args[2], ctx, visited) || 1, 10));
                const found = matrix.find(row => String(row[0]) === String(needle));
                return found ? found[colIndex - 1] ?? "" : "#N/D";
            }
            if (fn === "LOOKUP") {
                const needle = normalizeScalar(args[0], ctx, visited);
                const lookupRange = rangeValues(args[1], ctx, visited);
                const resultRange = args[2] ? rangeValues(args[2], ctx, visited) : lookupRange;
                let bestIdx = -1;
                lookupRange.forEach((v, i) => {
                    if (String(v) <= String(needle)) bestIdx = i;
                });
                return bestIdx >= 0 ? resultRange[bestIdx] : "#N/D";
            }
            if (fn === "HLOOKUP") {
                const needle = normalizeScalar(args[0], ctx, visited);
                const matrix = rangeMatrix(args[1], ctx, visited);
                const rowIndex = Math.max(1, parseInt(normalizeScalar(args[2], ctx, visited) || 1, 10));
                const header = matrix[0] || [];
                const idx = header.findIndex(v => String(v) === String(needle));
                return idx >= 0 ? matrix[rowIndex - 1]?.[idx] ?? "" : "#N/D";
            }
            if (fn === "ADDRESS") return `${ctx.colToLabel(parseInt(normalizeScalar(args[1], ctx, visited), 10) - 1)}${parseInt(normalizeScalar(args[0], ctx, visited), 10)}`;
            if (fn === "ROW") {
                const ref = ctx.cellRefToIndex(String(normalizeScalar(args[0], ctx, visited)));
                return ref ? ref.row + 1 : "#N/D";
            }
            if (fn === "ROWS") return rangeMatrix(args[0], ctx, visited).length;
            if (fn === "COLUMN") {
                const ref = ctx.cellRefToIndex(String(normalizeScalar(args[0], ctx, visited)));
                return ref ? ref.col + 1 : "#N/D";
            }
            if (fn === "COLUMNS") return rangeMatrix(args[0], ctx, visited)[0]?.length ?? 0;
            if (fn === "OFFSET") {
                const ref = ctx.cellRefToIndex(args[0]);
                if (!ref) return "#N/D";
                const r = ref.row + parseInt(normalizeScalar(args[1], ctx, visited) || 0, 10);
                const c = ref.col + parseInt(normalizeScalar(args[2], ctx, visited) || 0, 10);
                return ctx.getCellComputedValue(r, c, visited);
            }
            if (fn === "INDIRECT") {
                const ref = ctx.cellRefToIndex(String(normalizeScalar(args[0], ctx, visited)));
                return ref ? ctx.getCellComputedValue(ref.row, ref.col, visited) : "#N/D";
            }
            if (fn === "CHOOSE") {
                const idx = parseInt(normalizeScalar(args[0], ctx, visited), 10);
                return normalizeScalar(args[idx], ctx, visited);
            }

            if (fn === "PMT") {
                const rate = ctx.parseNumber(normalizeScalar(args[0], ctx, visited));
                const periods = ctx.parseNumber(normalizeScalar(args[1], ctx, visited));
                const principal = ctx.parseNumber(normalizeScalar(args[2], ctx, visited));
                if (!rate) return periods ? -(principal / periods) : 0;
                return -(rate * principal) / (1 - Math.pow(1 + rate, -periods));
            }
            if (fn === "PV") {
                const rate = ctx.parseNumber(normalizeScalar(args[0], ctx, visited));
                const nper = ctx.parseNumber(normalizeScalar(args[1], ctx, visited));
                const pmt = ctx.parseNumber(normalizeScalar(args[2], ctx, visited));
                if (!rate) return -(pmt * nper);
                return -(pmt * (1 - Math.pow(1 + rate, -nper)) / rate);
            }
            if (fn === "FV") {
                const rate = ctx.parseNumber(normalizeScalar(args[0], ctx, visited));
                const nper = ctx.parseNumber(normalizeScalar(args[1], ctx, visited));
                const pmt = ctx.parseNumber(normalizeScalar(args[2], ctx, visited));
                if (!rate) return -(pmt * nper);
                return -(pmt * ((Math.pow(1 + rate, nper) - 1) / rate));
            }
            if (fn === "NPV") {
                const rate = ctx.parseNumber(normalizeScalar(args[0], ctx, visited));
                const vals = args.slice(1).flatMap(a => /^\$?[A-Z]+\$?\d+:\$?[A-Z]+\$?\d+$/i.test(a) ? rangeValues(a, ctx, visited) : [normalizeScalar(a, ctx, visited)]).map(ctx.parseNumber);
                return vals.reduce((acc, v, i) => acc + (v / Math.pow(1 + rate, i + 1)), 0);
            }
            if (fn === "XNPV") return evaluate(`=NPV(${args[0]};${args[1]})`, ctx, visited);
            if (fn === "IRR") {
                const vals = rangeValues(args[0], ctx, visited).map(ctx.parseNumber);
                let rate = 0.1;
                for (let i = 0; i < 100; i += 1) {
                    const npv = vals.reduce((acc, v, idx) => acc + v / Math.pow(1 + rate, idx), 0);
                    const dnpv = vals.reduce((acc, v, idx) => idx === 0 ? acc : acc - idx * v / Math.pow(1 + rate, idx + 1), 0);
                    rate -= npv / dnpv;
                }
                return rate;
            }
            if (fn === "XIRR") return evaluate(`=IRR(${args[0]})`, ctx, visited);
            if (fn === "NPER") {
                const rate = ctx.parseNumber(normalizeScalar(args[0], ctx, visited));
                const pmt = ctx.parseNumber(normalizeScalar(args[1], ctx, visited));
                const pv = ctx.parseNumber(normalizeScalar(args[2], ctx, visited));
                return Math.log(pmt / (pmt + rate * pv)) / Math.log(1 + rate);
            }
            if (fn === "RATE") return "#RATE uproszczone";
            if (fn === "IPMT") return "#IPMT uproszczone";
            if (fn === "PPMT") return "#PPMT uproszczone";
            if (fn === "RRI") {
                const nper = ctx.parseNumber(normalizeScalar(args[0], ctx, visited));
                const pv = ctx.parseNumber(normalizeScalar(args[1], ctx, visited));
                const fv = ctx.parseNumber(normalizeScalar(args[2], ctx, visited));
                return Math.pow(fv / pv, 1 / nper) - 1;
            }
            if (fn === "MIRR") return "#MIRR uproszczone";
            if (fn === "FVSCHEDULE") {
                const principal = ctx.parseNumber(normalizeScalar(args[0], ctx, visited));
                const rates = rangeValues(args[1], ctx, visited).map(ctx.parseNumber);
                return rates.reduce((acc, r) => acc * (1 + r), principal);
            }

            if (fn === "DATA") return new Date(parseInt(normalizeScalar(args[0], ctx, visited), 10), parseInt(normalizeScalar(args[1], ctx, visited), 10) - 1, parseInt(normalizeScalar(args[2], ctx, visited), 10)).toISOString().slice(0, 10);
            if (fn === "DATA.WARTOŚĆ") return new Date(String(normalizeScalar(args[0], ctx, visited))).toISOString().slice(0, 10);
            if (fn === "CZAS") return `${String(parseInt(normalizeScalar(args[0], ctx, visited), 10)).padStart(2, "0")}:${String(parseInt(normalizeScalar(args[1], ctx, visited), 10)).padStart(2, "0")}:${String(parseInt(normalizeScalar(args[2], ctx, visited), 10)).padStart(2, "0")}`;
            if (fn === "CZAS.WARTOŚĆ") return String(normalizeScalar(args[0], ctx, visited));
            if (fn === "DNI") {
                const d1 = new Date(normalizeScalar(args[0], ctx, visited));
                const d2 = new Date(normalizeScalar(args[1], ctx, visited));
                return Math.round((d1 - d2) / 86400000);
            }
            if (fn === "DNI.ROBOCZE") {
                const start = new Date(normalizeScalar(args[0], ctx, visited));
                const end = new Date(normalizeScalar(args[1], ctx, visited));
                let count = 0;
                for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                    const day = d.getDay();
                    if (day !== 0 && day !== 6) count += 1;
                }
                return count;
            }
            if (fn === "DZIEŃ") return new Date(normalizeScalar(args[0], ctx, visited)).getDate();
            if (fn === "MIESIĄC") return new Date(normalizeScalar(args[0], ctx, visited)).getMonth() + 1;
            if (fn === "ROK") return new Date(normalizeScalar(args[0], ctx, visited)).getFullYear();
            if (fn === "GODZINA") return new Date(normalizeScalar(args[0], ctx, visited)).getHours();
            if (fn === "MINUTA") return new Date(normalizeScalar(args[0], ctx, visited)).getMinutes();
            if (fn === "SEKUNDA") return new Date(normalizeScalar(args[0], ctx, visited)).getSeconds();
            if (fn === "DZIŚ") return new Date().toISOString().slice(0, 10);
            if (fn === "TERAZ") return new Date().toLocaleString("pl-PL");

            if (fn === "SUMIF") {
                const condRange = rangeValues(args[0], ctx, visited);
                const cond = parseCondition(args[1], ctx, visited);
                const sumRange = args[2] ? rangeValues(args[2], ctx, visited) : condRange;
                return condRange.reduce((acc, v, i) => compare(v, cond.op, cond.right, ctx) ? acc + ctx.parseNumber(sumRange[i]) : acc, 0);
            }
            if (fn === "COUNTIF") {
                const condRange = rangeValues(args[0], ctx, visited);
                const cond = parseCondition(args[1], ctx, visited);
                return condRange.filter(v => compare(v, cond.op, cond.right, ctx)).length;
            }

            if (fn === "TRANSPOZYCJA") {
                const matrix = rangeMatrix(args[0], ctx, visited);
                if (!matrix.length) return [];
                return matrix[0].map((_, c) => matrix.map(r => r[c]));
            }
            if (fn === "MULTI") {
                const a = rangeMatrix(args[0], ctx, visited).map(r => r.map(ctx.parseNumber));
                const b = rangeMatrix(args[1], ctx, visited).map(r => r.map(ctx.parseNumber));
                if (!a.length || !b.length || a[0].length !== b.length) return "#BŁĄD";
                return a.map(row => b[0].map((_, c) => row.reduce((sum, v, r) => sum + v * b[r][c], 0)));
            }
            if (fn === "ARRAYFORMULA") {
                if (args.length === 1 && /^\$?[A-Z]+\$?\d+:\$?[A-Z]+\$?\d+$/i.test(args[0])) return rangeMatrix(args[0], ctx, visited);
                if (args.length === 2 && /^\$?[A-Z]+\$?\d+:\$?[A-Z]+\$?\d+$/i.test(args[0]) && /^\$?[A-Z]+\$?\d+:\$?[A-Z]+\$?\d+$/i.test(args[1])) {
                    const a = rangeValues(args[0], ctx, visited).map(ctx.parseNumber);
                    const b = rangeValues(args[1], ctx, visited).map(ctx.parseNumber);
                    return a.map((v, i) => [v * (b[i] ?? 0)]);
                }
                return "#N/D";
            }
            if (fn === "FILTRUJ") {
                const matrix = rangeMatrix(args[0], ctx, visited);
                const values = rangeValues(args[1], ctx, visited);
                const cond = parseCondition(args[2] || ">0", ctx, visited);
                return matrix.filter((row, i) => compare(values[i], cond.op, cond.right, ctx));
            }
            if (fn === "ZAPYTANIE") {
                const matrix = rangeMatrix(args[0], ctx, visited);
                const query = String(normalizeScalar(args[1], ctx, visited) ?? "").toUpperCase();
                if (!matrix.length) return [];
                if (query.includes("SELECT") && query.includes("WHERE")) {
                    const whereMatch = query.match(/WHERE\s+([A-Z]+)\s*([><=]+)\s*([0-9.]+)/);
                    if (whereMatch) {
                        const col = ctx.labelToCol(whereMatch[1]);
                        const op = whereMatch[2];
                        const val = ctx.parseNumber(whereMatch[3]);
                        return matrix.filter(row => compare(ctx.parseNumber(row[col]), op, val, ctx));
                    }
                }
                return matrix;
            }
            if (fn === "UNIQUE") {
                const vals = rangeValues(args[0], ctx, visited);
                return [...new Set(vals.map(v => String(v)))].map(v => [v]);
            }
            if (fn === "SORT") {
                const matrix = rangeMatrix(args[0], ctx, visited);
                const sortCol = parseInt(normalizeScalar(args[1], ctx, visited) || 1, 10) - 1;
                const ascending = String(normalizeScalar(args[2], ctx, visited) ?? "TRUE").toUpperCase() !== "FALSE";
                return [...matrix].sort((a, b) => ascending
                    ? String(a[sortCol] ?? "").localeCompare(String(b[sortCol] ?? ""), "pl")
                    : String(b[sortCol] ?? "").localeCompare(String(a[sortCol] ?? ""), "pl"));
            }
            if (fn === "SEQUENCE") {
                const rows = parseInt(normalizeScalar(args[0], ctx, visited) || 1, 10);
                const cols = parseInt(normalizeScalar(args[1], ctx, visited) || 1, 10);
                const start = ctx.parseNumber(normalizeScalar(args[2], ctx, visited) || 1);
                const step = ctx.parseNumber(normalizeScalar(args[3], ctx, visited) || 1);
                let current = start;
                const matrix = [];
                for (let r = 0; r < rows; r += 1) {
                    const row = [];
                    for (let c = 0; c < cols; c += 1) {
                        row.push(current);
                        current += step;
                    }
                    matrix.push(row);
                }
                return matrix;
            }
            if (fn === "CHOOSECOLS") {
                const matrix = rangeMatrix(args[0], ctx, visited);
                const cols = args.slice(1).map(a => parseInt(normalizeScalar(a, ctx, visited), 10) - 1);
                return matrix.map(row => cols.map(c => row[c]));
            }
            if (fn === "CHOOSEROWS") {
                const matrix = rangeMatrix(args[0], ctx, visited);
                const rows = args.slice(1).map(a => parseInt(normalizeScalar(a, ctx, visited), 10) - 1);
                return rows.map(r => matrix[r]).filter(Boolean);
            }
            if (fn === "TAKE") {
                const matrix = rangeMatrix(args[0], ctx, visited);
                const n = parseInt(normalizeScalar(args[1], ctx, visited), 10);
                return matrix.slice(0, n);
            }
            if (fn === "DROP") {
                const matrix = rangeMatrix(args[0], ctx, visited);
                const n = parseInt(normalizeScalar(args[1], ctx, visited), 10);
                return matrix.slice(n);
            }
            if (fn === "VSTACK") {
                return args.flatMap(arg => rangeMatrix(arg, ctx, visited));
            }
            if (fn === "HSTACK") {
                const matrices = args.map(arg => rangeMatrix(arg, ctx, visited));
                const maxRows = Math.max(...matrices.map(m => m.length), 0);
                const result = [];
                for (let r = 0; r < maxRows; r += 1) {
                    const row = [];
                    matrices.forEach(matrix => {
                        row.push(...(matrix[r] || Array(matrix[0]?.length || 0).fill("")));
                    });
                    result.push(row);
                }
                return result;
            }



            if (fn === "WARTOŚĆ.FUNKCJI") {
                const expr = normalizeScalar(args[0], ctx, visited);
                const x = ctx.parseNumber(normalizeScalar(args[1], ctx, visited));
                return evalMathExpression(expr, { x, y: 0 });
            }
            if (fn === "POCHODNA") {
                const expr = normalizeScalar(args[0], ctx, visited);
                const x = ctx.parseNumber(normalizeScalar(args[1], ctx, visited));
                const h = ctx.parseNumber(normalizeScalar(args[2], ctx, visited) || 0.00001);
                return (evalMathExpression(expr, { x: x + h, y: 0 }) - evalMathExpression(expr, { x: x - h, y: 0 })) / (2 * h);
            }
            if (fn === "CAŁKA") {
                const expr = normalizeScalar(args[0], ctx, visited);
                const a = ctx.parseNumber(normalizeScalar(args[1], ctx, visited));
                const b = ctx.parseNumber(normalizeScalar(args[2], ctx, visited));
                const n = Math.max(1, Math.floor(ctx.parseNumber(normalizeScalar(args[3], ctx, visited) || 1000)));
                const h = (b - a) / n;
                let sum = 0.5 * (evalMathExpression(expr, { x: a, y: 0 }) + evalMathExpression(expr, { x: b, y: 0 }));
                for (let i = 1; i < n; i += 1) sum += evalMathExpression(expr, { x: a + i * h, y: 0 });
                return sum * h;
            }
            if (fn === "EULER") {
                const expr = normalizeScalar(args[0], ctx, visited);
                let x = ctx.parseNumber(normalizeScalar(args[1], ctx, visited));
                let y = ctx.parseNumber(normalizeScalar(args[2], ctx, visited));
                const h = ctx.parseNumber(normalizeScalar(args[3], ctx, visited));
                const n = Math.max(0, Math.floor(ctx.parseNumber(normalizeScalar(args[4], ctx, visited))));
                for (let i = 0; i < n; i += 1) { y += h * evalMathExpression(expr, { x, y }); x += h; }
                return y;
            }
            if (fn === "BISEKCJA") {
                const expr = normalizeScalar(args[0], ctx, visited);
                let a = ctx.parseNumber(normalizeScalar(args[1], ctx, visited));
                let b = ctx.parseNumber(normalizeScalar(args[2], ctx, visited));
                const eps = ctx.parseNumber(normalizeScalar(args[3], ctx, visited) || 0.000001);
                const maxIter = Math.floor(ctx.parseNumber(normalizeScalar(args[4], ctx, visited) || 100));
                let fa = evalMathExpression(expr, { x: a, y: 0 });
                let fb = evalMathExpression(expr, { x: b, y: 0 });
                if (fa * fb > 0) return "#BRAK ZMIANY ZNAKU";
                let m = a;
                for (let i = 0; i < maxIter; i += 1) {
                    m = (a + b) / 2;
                    const fm = evalMathExpression(expr, { x: m, y: 0 });
                    if (Math.abs(fm) < eps || Math.abs(b - a) < eps) break;
                    if (fa * fm <= 0) { b = m; fb = fm; } else { a = m; fa = fm; }
                }
                return m;
            }
            if (fn === "NEWTON") {
                const expr = normalizeScalar(args[0], ctx, visited);
                let x = ctx.parseNumber(normalizeScalar(args[1], ctx, visited));
                const eps = ctx.parseNumber(normalizeScalar(args[2], ctx, visited) || 0.000001);
                const maxIter = Math.floor(ctx.parseNumber(normalizeScalar(args[3], ctx, visited) || 50));
                for (let i = 0; i < maxIter; i += 1) {
                    const fx = evalMathExpression(expr, { x, y: 0 });
                    const dfx = (evalMathExpression(expr, { x: x + eps, y: 0 }) - evalMathExpression(expr, { x: x - eps, y: 0 })) / (2 * eps);
                    if (!Number.isFinite(dfx) || Math.abs(dfx) < 1e-12) return "#POCHODNA=0";
                    const next = x - fx / dfx;
                    if (Math.abs(next - x) < eps) { x = next; break; }
                    x = next;
                }
                return x;
            }
            if (fn === "KOMBINACJE") {
                const n = Math.floor(ctx.parseNumber(normalizeScalar(args[0], ctx, visited)));
                const k = Math.floor(ctx.parseNumber(normalizeScalar(args[1], ctx, visited)));
                if (k < 0 || n < 0 || k > n) return 0;
                return factorial(n) / (factorial(k) * factorial(n-k));
            }
            if (fn === "PERMUTACJE") return factorial(ctx.parseNumber(normalizeScalar(args[0], ctx, visited)));
            if (fn === "WARIACJE") {
                const n = Math.floor(ctx.parseNumber(normalizeScalar(args[0], ctx, visited)));
                const k = Math.floor(ctx.parseNumber(normalizeScalar(args[1], ctx, visited)));
                if (k < 0 || n < 0 || k > n) return 0;
                return factorial(n) / factorial(n-k);
            }
            if (fn === "NORM.DIST") {
                const x = ctx.parseNumber(normalizeScalar(args[0], ctx, visited));
                const mean = ctx.parseNumber(normalizeScalar(args[1], ctx, visited));
                const sd = ctx.parseNumber(normalizeScalar(args[2], ctx, visited));
                const cumulative = String(normalizeScalar(args[3], ctx, visited)).toUpperCase() !== "FALSE";
                const z = (x - mean) / sd;
                return cumulative ? normalCdf(z) : Math.exp(-0.5*z*z)/(sd*Math.sqrt(2*Math.PI));
            }
            if (fn === "DWUMIAN") {
                const k = Math.floor(ctx.parseNumber(normalizeScalar(args[0], ctx, visited)));
                const n = Math.floor(ctx.parseNumber(normalizeScalar(args[1], ctx, visited)));
                const p = ctx.parseNumber(normalizeScalar(args[2], ctx, visited));
                return (factorial(n)/(factorial(k)*factorial(n-k))) * Math.pow(p,k) * Math.pow(1-p,n-k);
            }
            if (fn === "POISSON") {
                const k = Math.floor(ctx.parseNumber(normalizeScalar(args[0], ctx, visited)));
                const lambda = ctx.parseNumber(normalizeScalar(args[1], ctx, visited));
                return Math.exp(-lambda) * Math.pow(lambda, k) / factorial(k);
            }
            if (fn === "NACHYLENIE" || fn === "WYRAZ.WOLNY" || fn === "R2" || fn === "PROGNOZA") {
                let xRange = fn === "PROGNOZA" ? args[1] : args[0];
                let yRange = fn === "PROGNOZA" ? args[2] : args[1];
                const xVals = rangeValues(xRange, ctx, visited).map(ctx.parseNumber);
                const yVals = rangeValues(yRange, ctx, visited).map(ctx.parseNumber);
                const st = linearStats(xVals, yVals);
                if (!st) return "#BŁĄD";
                if (fn === "NACHYLENIE") return st.slope;
                if (fn === "WYRAZ.WOLNY") return st.intercept;
                if (fn === "R2") return st.r2;
                const x0 = ctx.parseNumber(normalizeScalar(args[0], ctx, visited));
                return st.slope * x0 + st.intercept;
            }

            if (fn === "IMPORTRANGE" || fn === "IMPORTHTML" || fn === "IMPORTDATA" || fn === "IMPORTFEED" || fn === "IMPORTXML" || fn === "GOOGLEFINANCE") {
                return `#${fn} wymaga backendu`;
            }

            if (fn === "BIN2DEC") return parseInt(String(normalizeScalar(args[0], ctx, visited)), 2);
            if (fn === "BIN2HEX") return parseInt(String(normalizeScalar(args[0], ctx, visited)), 2).toString(16).toUpperCase();
            if (fn === "BIN2OCT") return parseInt(String(normalizeScalar(args[0], ctx, visited)), 2).toString(8);
            if (fn === "BITAND") return parseInt(normalizeScalar(args[0], ctx, visited), 10) & parseInt(normalizeScalar(args[1], ctx, visited), 10);
            if (fn === "BITLSHIFT") return parseInt(normalizeScalar(args[0], ctx, visited), 10) << parseInt(normalizeScalar(args[1], ctx, visited), 10);
            if (fn === "BITOR") return parseInt(normalizeScalar(args[0], ctx, visited), 10) | parseInt(normalizeScalar(args[1], ctx, visited), 10);
            if (fn === "BITRSHIFT") return parseInt(normalizeScalar(args[0], ctx, visited), 10) >> parseInt(normalizeScalar(args[1], ctx, visited), 10);
            if (fn === "BITXOR") return parseInt(normalizeScalar(args[0], ctx, visited), 10) ^ parseInt(normalizeScalar(args[1], ctx, visited), 10);
            if (fn === "COMPLEX") return complexToString({ re: ctx.parseNumber(normalizeScalar(args[0], ctx, visited)), im: ctx.parseNumber(normalizeScalar(args[1], ctx, visited)) });
            if (fn === "DEC2BIN") return Number(normalizeScalar(args[0], ctx, visited)).toString(2);
            if (fn === "DEC2HEX") return Number(normalizeScalar(args[0], ctx, visited)).toString(16).toUpperCase();
            if (fn === "DEC2OCT") return Number(normalizeScalar(args[0], ctx, visited)).toString(8);
            if (fn === "DELTA") return Number(normalizeScalar(args[0], ctx, visited)) === Number(normalizeScalar(args[1], ctx, visited) || 0) ? 1 : 0;
            if (fn === "ERF") return erf(ctx.parseNumber(normalizeScalar(args[0], ctx, visited)));
            if (fn === "GESTEP") return ctx.parseNumber(normalizeScalar(args[0], ctx, visited)) >= ctx.parseNumber(normalizeScalar(args[1], ctx, visited) || 0) ? 1 : 0;
            if (fn === "HEX2BIN") return parseInt(String(normalizeScalar(args[0], ctx, visited)), 16).toString(2);
            if (fn === "HEX2DEC") return parseInt(String(normalizeScalar(args[0], ctx, visited)), 16);
            if (fn === "HEX2OCT") return parseInt(String(normalizeScalar(args[0], ctx, visited)), 16).toString(8);
            if (fn === "IMABS") return cAbs(ensureComplex(normalizeScalar(args[0], ctx, visited)));
            if (fn === "IMAGINARY") return ensureComplex(normalizeScalar(args[0], ctx, visited)).im;
            if (fn === "IMARGUMENT") return cArg(ensureComplex(normalizeScalar(args[0], ctx, visited)));
            if (fn === "IMCONJUGATE") {
                const z = ensureComplex(normalizeScalar(args[0], ctx, visited));
                return complexToString({ re: z.re, im: -z.im });
            }
            if (fn === "IMCOS") return complexToString(cCos(ensureComplex(normalizeScalar(args[0], ctx, visited))));
            if (fn === "IMCOSH") return complexToString(cCosh(ensureComplex(normalizeScalar(args[0], ctx, visited))));
            if (fn === "IMCOT") return complexToString(cDiv(cCos(ensureComplex(normalizeScalar(args[0], ctx, visited))), cSin(ensureComplex(normalizeScalar(args[0], ctx, visited)))));
            if (fn === "IMCOTH") return complexToString(cDiv(cCosh(ensureComplex(normalizeScalar(args[0], ctx, visited))), cSinh(ensureComplex(normalizeScalar(args[0], ctx, visited)))));
            if (fn === "IMCSC") return complexToString(cInv(cSin(ensureComplex(normalizeScalar(args[0], ctx, visited)))));
            if (fn === "IMCSCH") return complexToString(cInv(cSinh(ensureComplex(normalizeScalar(args[0], ctx, visited)))));
            if (fn === "IMDIV") return complexToString(cDiv(ensureComplex(normalizeScalar(args[0], ctx, visited)), ensureComplex(normalizeScalar(args[1], ctx, visited))));
            if (fn === "IMEXP") return complexToString(cExp(ensureComplex(normalizeScalar(args[0], ctx, visited))));
            if (fn === "IMLOG") return complexToString(cLog(ensureComplex(normalizeScalar(args[0], ctx, visited))));
            if (fn === "IMLOG10") {
                const z = cLog(ensureComplex(normalizeScalar(args[0], ctx, visited)));
                return complexToString({ re: z.re / Math.log(10), im: z.im / Math.log(10) });
            }
            if (fn === "IMLOG2") {
                const z = cLog(ensureComplex(normalizeScalar(args[0], ctx, visited)));
                return complexToString({ re: z.re / Math.log(2), im: z.im / Math.log(2) });
            }
            if (fn === "IMPRODUCT") {
                return complexToString(args.reduce((acc, arg) => cMul(acc, ensureComplex(normalizeScalar(arg, ctx, visited))), { re: 1, im: 0 }));
            }
            if (fn === "IMREAL") return ensureComplex(normalizeScalar(args[0], ctx, visited)).re;
            if (fn === "IMSIN") return complexToString(cSin(ensureComplex(normalizeScalar(args[0], ctx, visited))));
            if (fn === "IMSINH") return complexToString(cSinh(ensureComplex(normalizeScalar(args[0], ctx, visited))));
            if (fn === "IMSEC") return complexToString(cInv(cCos(ensureComplex(normalizeScalar(args[0], ctx, visited)))));
            if (fn === "IMSECH") return complexToString(cInv(cCosh(ensureComplex(normalizeScalar(args[0], ctx, visited)))));
            if (fn === "IMSUB") return complexToString(cSub(ensureComplex(normalizeScalar(args[0], ctx, visited)), ensureComplex(normalizeScalar(args[1], ctx, visited))));
            if (fn === "IMSUM") return complexToString(args.reduce((acc, arg) => cAdd(acc, ensureComplex(normalizeScalar(arg, ctx, visited))), { re: 0, im: 0 }));
            if (fn === "IMTAN") return complexToString(cTan(ensureComplex(normalizeScalar(args[0], ctx, visited))));
            if (fn === "IMTANH") return complexToString(cTanh(ensureComplex(normalizeScalar(args[0], ctx, visited))));
            if (fn === "OCT2BIN") return parseInt(String(normalizeScalar(args[0], ctx, visited)), 8).toString(2);
            if (fn === "OCT2DEC") return parseInt(String(normalizeScalar(args[0], ctx, visited)), 8);
            if (fn === "OCT2HEX") return parseInt(String(normalizeScalar(args[0], ctx, visited)), 8).toString(16).toUpperCase();

        } catch {
            return "#BŁĄD";
        }

        return "#N/D";
    }

    window.FormulaEngine = {
        evaluate,
        resolveName
    };
})();
