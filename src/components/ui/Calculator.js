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
      className={`flex items-center justify-center rounded-full h-17 w-full text-xl font-normal transition-all duration-75 active:scale-90 select-none ${cls}`}
    >
      {label}
    </button>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Calculator({ onClose }) {
  const [state, dispatch] = useReducer(reducer, init);
  const { display, expression, prevValue, pendingOp } = state;
  const activeOp = prevValue !== null ? pendingOp : null;

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
      ? "bg-white text-orange-500 ring-2 ring-orange-400"
      : "bg-orange-500 text-white hover:bg-orange-400";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-black rounded-[40px] shadow-2xl overflow-hidden select-none" style={{ width: 320 }}>

        {/* Close */}
        <div className="flex justify-end px-5 pt-5 pb-0">
          <button onClick={onClose} className="text-gray-700 hover:text-gray-400 transition-colors p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Display */}
        <div className="px-6 pt-2 pb-4 text-right">
          <p className="text-gray-500 text-sm h-6 truncate">{expression || "\u00a0"}</p>
          <p
            className={`text-white font-thin tracking-tight truncate transition-all ${
              display.length > 10 ? "text-3xl" : display.length > 7 ? "text-4xl" : display.length > 4 ? "text-5xl" : "text-6xl"
            }`}
          >
            {display}
          </p>
        </div>

        {/* Keyboard */}
        <div className="grid grid-cols-4 gap-3 px-5 pb-7">
          {/* Row 1 */}
          <CalcBtn label="C"  onClick={() => dispatch({ type: "CLEAR" })}                      cls="bg-[#a5a5a5] text-black hover:brightness-110" />
          <CalcBtn label="⌫"  onClick={() => dispatch({ type: "BACKSPACE" })}                  cls="bg-[#a5a5a5] text-black hover:brightness-110" />
          <CalcBtn label="%"  onClick={() => dispatch({ type: "PERCENT" })}                    cls="bg-[#a5a5a5] text-black hover:brightness-110" />
          <CalcBtn label="÷"  onClick={() => dispatch({ type: "OPERATOR", payload: "÷" })}     cls={opCls("÷")} />

          {/* Row 2 */}
          <CalcBtn label="7" onClick={() => dispatch({ type: "DIGIT", payload: "7" })} cls="bg-[#333] text-white hover:bg-[#444]" />
          <CalcBtn label="8" onClick={() => dispatch({ type: "DIGIT", payload: "8" })} cls="bg-[#333] text-white hover:bg-[#444]" />
          <CalcBtn label="9" onClick={() => dispatch({ type: "DIGIT", payload: "9" })} cls="bg-[#333] text-white hover:bg-[#444]" />
          <CalcBtn label="×" onClick={() => dispatch({ type: "OPERATOR", payload: "×" })} cls={opCls("×")} />

          {/* Row 3 */}
          <CalcBtn label="4" onClick={() => dispatch({ type: "DIGIT", payload: "4" })} cls="bg-[#333] text-white hover:bg-[#444]" />
          <CalcBtn label="5" onClick={() => dispatch({ type: "DIGIT", payload: "5" })} cls="bg-[#333] text-white hover:bg-[#444]" />
          <CalcBtn label="6" onClick={() => dispatch({ type: "DIGIT", payload: "6" })} cls="bg-[#333] text-white hover:bg-[#444]" />
          <CalcBtn label="−" onClick={() => dispatch({ type: "OPERATOR", payload: "-" })} cls={opCls("-")} />

          {/* Row 4 */}
          <CalcBtn label="1" onClick={() => dispatch({ type: "DIGIT", payload: "1" })} cls="bg-[#333] text-white hover:bg-[#444]" />
          <CalcBtn label="2" onClick={() => dispatch({ type: "DIGIT", payload: "2" })} cls="bg-[#333] text-white hover:bg-[#444]" />
          <CalcBtn label="3" onClick={() => dispatch({ type: "DIGIT", payload: "3" })} cls="bg-[#333] text-white hover:bg-[#444]" />
          <CalcBtn label="+" onClick={() => dispatch({ type: "OPERATOR", payload: "+" })} cls={opCls("+")} />

          {/* Row 5 */}
          <CalcBtn label="±" onClick={() => dispatch({ type: "SIGN" })} cls="bg-[#333] text-white hover:bg-[#444]" />
          {/* Wide 0 */}
          <button
            type="button"
            onClick={() => dispatch({ type: "DIGIT", payload: "0" })}
            className="col-span-2 flex items-center justify-start pl-7 rounded-full h-17 text-xl font-normal bg-[#333] text-white hover:bg-[#444] transition-all duration-75 active:scale-95"
          >
            0
          </button>
          <CalcBtn label="." onClick={() => dispatch({ type: "DIGIT", payload: "." })} cls="bg-[#333] text-white hover:bg-[#444]" />
          <CalcBtn label="=" onClick={() => dispatch({ type: "EQUAL" })}                cls="bg-orange-500 text-white hover:bg-orange-400" />
        </div>

        {/* Keyboard hint */}
        <p className="text-center text-gray-700 text-[10px] pb-4">Keyboard supported · Esc to close</p>
      </div>
    </div>
  );
}
