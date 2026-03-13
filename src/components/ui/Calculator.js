"use client";
import { useReducer, useEffect } from "react";

// ─── Pure calculator logic (no React state issues) ────────────────────────────
const MAX_DIGITS = 12;

function safeCompute(a, op, b) {
  const fa = parseFloat(a);
  const fb = parseFloat(b);
  if (isNaN(fa) || isNaN(fb)) return "Error";
  let result;
  if (op === "+") result = fa + fb;
  else if (op === "-") result = fa - fb;
  else if (op === "×") result = fa * fb;
  else if (op === "÷") {
    if (fb === 0) return "Error";
    result = fa / fb;
  } else return b;
  if (!isFinite(result)) return "Error";
  if (result === 0) return "0";
  const fixed = parseFloat(result.toPrecision(10));
  const str = String(fixed);
  return str.length > MAX_DIGITS ? result.toExponential(4) : str;
}

const init = { display: "0", expression: "", prevValue: null, pendingOp: null, resetOnNext: false };

function reducer(state, action) {
  const { display, prevValue, pendingOp, resetOnNext } = state;

  switch (action.type) {
    case "DIGIT": {
      const d = action.payload;
      if (display === "Error") return { ...init, display: d === "." ? "0." : d };
      if (resetOnNext) return { ...state, display: d === "." ? "0." : d === "0" ? "0" : d, resetOnNext: false };
      if (d === "." && display.includes(".")) return state;
      if (display.replace(/^-/, "").replace(".", "").length >= MAX_DIGITS) return state;
      return { ...state, display: display === "0" && d !== "." ? d : display + d };
    }

    case "OPERATOR": {
      const op = action.payload;
      if (display === "Error") return state;
      let base;
      if (prevValue !== null && !resetOnNext) {
        base = safeCompute(prevValue, pendingOp, display);
        if (base === "Error") return { ...init, display: "Error" };
      } else {
        base = display;
      }
      return { ...state, display: base, expression: `${base} ${op}`, prevValue: base, pendingOp: op, resetOnNext: true };
    }

    case "EQUAL": {
      if (prevValue === null || pendingOp === null) return state;
      const result = safeCompute(prevValue, pendingOp, display);
      return { ...state, display: result, expression: `${prevValue} ${pendingOp} ${display} =`, prevValue: null, pendingOp: null, resetOnNext: true };
    }

    case "CLEAR":
      return init;

    case "BACKSPACE": {
      if (resetOnNext || display === "Error") return { ...state, display: "0", resetOnNext: false };
      const next = display.length > 1 ? display.slice(0, -1) : "0";
      return { ...state, display: next === "-" ? "0" : next };
    }

    case "SIGN":
      if (display === "0" || display === "Error") return state;
      return { ...state, display: display.startsWith("-") ? display.slice(1) : "-" + display };

    case "PERCENT": {
      if (display === "Error") return state;
      const val = parseFloat(display) / 100;
      return { ...state, display: String(parseFloat(val.toPrecision(10))) };
    }

    default:
      return state;
  }
}

// ─── Button (defined outside to satisfy React's rules of components) ──────────
function CalcBtn({ label, onClick, cls }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center rounded-full h-14 sm:h-16 w-full text-lg sm:text-xl font-normal transition-all duration-75 active:scale-90 select-none touch-manipulation ${cls}`}
    >
      {label}
    </button>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Calculator({ onClose }) {
  const [state, dispatch] = useReducer(reducer, init);
  const { display, expression, prevValue, pendingOp, resetOnNext } = state;
  const activeOp = prevValue !== null ? pendingOp : null;

  // Live answer preview while typing second operand
  const liveResult =
    prevValue !== null && pendingOp !== null && !resetOnNext
      ? safeCompute(prevValue, pendingOp, display)
      : null;
  const showLive = liveResult !== null && liveResult !== display && liveResult !== "Error";

  // Context line: shows "prevValue op" while entering 2nd number, or full expression after =
  const contextLine = prevValue !== null
    ? `${prevValue} ${pendingOp}`
    : expression || "\u00a0";

  // Keyboard support — dispatch is stable, so no stale closure issues
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      const k = e.key;
      if (k >= "0" && k <= "9") dispatch({ type: "DIGIT", payload: k });
      else if (k === ".") dispatch({ type: "DIGIT", payload: "." });
      else if (k === "+") dispatch({ type: "OPERATOR", payload: "+" });
      else if (k === "-") dispatch({ type: "OPERATOR", payload: "-" });
      else if (k === "*") dispatch({ type: "OPERATOR", payload: "×" });
      else if (k === "/") { e.preventDefault(); dispatch({ type: "OPERATOR", payload: "÷" }); }
      else if (k === "Enter" || k === "=") dispatch({ type: "EQUAL" });
      else if (k === "Backspace") dispatch({ type: "BACKSPACE" });
      else if (k === "Escape") onClose();
      else if (k === "Delete") dispatch({ type: "CLEAR" });
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const opCls = (op) =>
    activeOp === op
      ? "bg-blue-900 text-white ring-2 ring-blue-700"
      : "bg-blue-900 text-white hover:bg-blue-800";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-[32px] sm:rounded-[40px] shadow-2xl overflow-hidden select-none w-full max-w-[320px] sm:max-w-sm border border-gray-200">

        {/* Header */}
        <div className="bg-blue-900 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
          <h2 className="text-white text-lg sm:text-xl font-semibold">Calculator</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors p-2 touch-manipulation">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Display */}
        <div className="px-4 sm:px-6 pt-4 pb-3 sm:pb-4 text-right flex flex-col justify-end bg-white">
          {/* Context: shows prevValue + operator, or full expression after = */}
          <p className="text-gray-600 text-xs sm:text-sm truncate min-h-[18px] sm:min-h-[20px]">
            {contextLine}
          </p>

          {/* Current number — always large */}
          <p
            className={`text-black font-bold tracking-tight truncate transition-all ${
              display.length > 10 ? "text-3xl sm:text-4xl" : display.length > 7 ? "text-4xl sm:text-5xl" : display.length > 4 ? "text-5xl sm:text-6xl" : "text-6xl sm:text-7xl"
            }`}
          >
            {display}
          </p>

          {/* Live answer preview — small, visible while typing 2nd operand */}
          <div className={`transition-all duration-150 overflow-hidden ${showLive ? "max-h-10 opacity-100 mt-1" : "max-h-0 opacity-0"}`}>
            <p className="text-blue-600 text-lg sm:text-xl truncate">
              = {liveResult}
            </p>
          </div>
        </div>

        {/* Keyboard */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3 px-3 sm:px-5 pb-5 sm:pb-7">
          {/* Row 1 */}
          <CalcBtn label="C"  onClick={() => dispatch({ type: "CLEAR" })}                      cls="bg-gray-300 text-black hover:bg-gray-400" />
          <CalcBtn label="⌫"  onClick={() => dispatch({ type: "BACKSPACE" })}                  cls="bg-gray-300 text-black hover:bg-gray-400" />
          <CalcBtn label="%"  onClick={() => dispatch({ type: "PERCENT" })}                    cls="bg-gray-300 text-black hover:bg-gray-400" />
          <CalcBtn label="÷"  onClick={() => dispatch({ type: "OPERATOR", payload: "÷" })}     cls={opCls("÷")} />

          {/* Row 2 */}
          <CalcBtn label="7" onClick={() => dispatch({ type: "DIGIT", payload: "7" })} cls="bg-gray-100 text-black hover:bg-gray-200 border border-gray-300" />
          <CalcBtn label="8" onClick={() => dispatch({ type: "DIGIT", payload: "8" })} cls="bg-gray-100 text-black hover:bg-gray-200 border border-gray-300" />
          <CalcBtn label="9" onClick={() => dispatch({ type: "DIGIT", payload: "9" })} cls="bg-gray-100 text-black hover:bg-gray-200 border border-gray-300" />
          <CalcBtn label="×" onClick={() => dispatch({ type: "OPERATOR", payload: "×" })} cls={opCls("×")} />

          {/* Row 3 */}
          <CalcBtn label="4" onClick={() => dispatch({ type: "DIGIT", payload: "4" })} cls="bg-gray-100 text-black hover:bg-gray-200 border border-gray-300" />
          <CalcBtn label="5" onClick={() => dispatch({ type: "DIGIT", payload: "5" })} cls="bg-gray-100 text-black hover:bg-gray-200 border border-gray-300" />
          <CalcBtn label="6" onClick={() => dispatch({ type: "DIGIT", payload: "6" })} cls="bg-gray-100 text-black hover:bg-gray-200 border border-gray-300" />
          <CalcBtn label="−" onClick={() => dispatch({ type: "OPERATOR", payload: "-" })} cls={opCls("-")} />

          {/* Row 4 */}
          <CalcBtn label="1" onClick={() => dispatch({ type: "DIGIT", payload: "1" })} cls="bg-gray-100 text-black hover:bg-gray-200 border border-gray-300" />
          <CalcBtn label="2" onClick={() => dispatch({ type: "DIGIT", payload: "2" })} cls="bg-gray-100 text-black hover:bg-gray-200 border border-gray-300" />
          <CalcBtn label="3" onClick={() => dispatch({ type: "DIGIT", payload: "3" })} cls="bg-gray-100 text-black hover:bg-gray-200 border border-gray-300" />
          <CalcBtn label="+" onClick={() => dispatch({ type: "OPERATOR", payload: "+" })} cls={opCls("+")} />

          {/* Row 5 */}
          <CalcBtn label="±" onClick={() => dispatch({ type: "SIGN" })} cls="bg-gray-100 text-black hover:bg-gray-200 border border-gray-300" />
          {/* Wide 0 */}
          <button
            type="button"
            onClick={() => dispatch({ type: "DIGIT", payload: "0" })}
            className="col-span-2 flex items-center justify-start pl-5 sm:pl-7 rounded-full h-14 sm:h-16 text-lg sm:text-xl font-normal bg-gray-100 text-black hover:bg-gray-200 border border-gray-300 transition-all duration-75 active:scale-95 touch-manipulation"
          >
            0
          </button>
          <CalcBtn label="." onClick={() => dispatch({ type: "DIGIT", payload: "." })} cls="bg-gray-100 text-black hover:bg-gray-200 border border-gray-300" />
          <CalcBtn label="=" onClick={() => dispatch({ type: "EQUAL" })}                cls="bg-blue-900 text-white hover:bg-blue-800" />
        </div>

        {/* Keyboard hint */}
        <p className="text-center text-gray-500 text-[10px] pb-3 sm:pb-4 hidden sm:block bg-gray-50 border-t border-gray-200">Keyboard supported · Esc to close</p>
        <div className="sm:hidden pb-3" />
      </div>
    </div>
  );
}
