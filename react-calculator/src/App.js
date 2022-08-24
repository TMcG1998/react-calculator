import './App.css';
import DigitButton from './DigitButton';
import OperationButton from './OperationButton';
import { useReducer } from "react"

// Actions that will be used on our buttons
export const ACTIONS = {
  ADD_DIGIT: 'add-digit',
  CHOOSE_OPERATION: 'choose-operation',
  CLEAR: 'clear',
  DELETE_DIGIT: 'delete-digit',
  EVALUATE: 'evaluate'
}

// This handles ALL of the calculator logic
function reducer(state, { type, payload }) {
  switch(type) {
    // If adding a digit/decimal
    case ACTIONS.ADD_DIGIT:
      // If we just did a calculation, we will want to overwite the next immediate value
      if(state.overwrite) {
        return {
          ...state,
          currentOperand: payload.digit,
          overwrite: false
        }
      }
      // Don't allow multiple 0's to start
      if(payload.digit === "0" && state.currentOperand === "0") return state
      // Don't allow multiple .'s
      if(payload.digit === "." && state.currentOperand?.includes(".")) {
        return state
      }
      return {
        ...state,
        currentOperand: `${state?.currentOperand || ""}${payload.digit}`
      }
    // If selecting an operation
    case ACTIONS.CHOOSE_OPERATION:
      // If there's no numbers inserted yet, do nothing.
      if (state.currentOperand == null && state.previousOperand == null) return state

      // If there's one number with an operation, but we want to change the operation
      if(state.currentOperand == null && state.operation !== null) {
        return {
          ...state,
          operation: payload.operation
        }
      }

      // If this operation is being used on the first number we've entered in the calculator
      if (state.previousOperand == null) {
        return {
          ...state,
          operation: payload.operation,
          previousOperand: state.currentOperand,
          currentOperand: null
        }
      }

      return {
        ...state, 
        previousOperand: evaluate(state),
        operation: payload.operation,
        currentOperand: null,
      }
    // If clearing
    case ACTIONS.CLEAR:
      // Return an empty state
      return {}
    // If removing the last digit we entered
    case ACTIONS.DELETE_DIGIT:
      // If we're in the overwrite state, delete will just clear.
      if(state.overwrite) {
        return {
          ...state,
          overwrite: false,
          currentOperand: null
        }
      }
      // If we don't have a number displayed on the calculator, we can't do anything so return state
      if(state.currentOperand == null) {
        return state
      }
      // If we only have 1 number, just set it to null when deleting it
      if(state.currentOperand.length === 1) {
        return {
          ...state,
          currentOperand: null
        }
      }
      // Default case is to slice off the last number inserted
      return {
        ...state,
        currentOperand: state.currentOperand.slice(0, -1)
      }
    // If hitting the equals button
    case ACTIONS.EVALUATE:
      // If we don't have all of the information we need, return the current state.
      if(state.operation == null || state.currentOperand == null || state.previousOperand == null) {
        return state
      }
      // Default evaluation. Setting overwrite to true is so that we cannot add new digits to the end of the number calculated
      return {
        ...state, 
        overwrite: true,
        previousOperand: null,
        operation: null,
        currentOperand: evaluate(state),
      }
    default: 
      return state
  }
}

function evaluate({ currentOperand, previousOperand, operation }) {
  const previous = parseFloat(previousOperand)
  const current = parseFloat(currentOperand)
  // If one of the values is not a number, return a blank string
  if(isNaN(previous) || isNaN(current)) return ""
  let computation = ""
  switch(operation) {
    case "+":
      computation = previous + current
      break;
    case "-":
      computation = previous - current
      break;
    case "*":
      computation = previous * current
      break;
    case "/":
      computation = previous / current
      break;  
  }
  return computation.toString()
}

// Used to format the integers
const INTEGER_FORMATTER = new Intl.NumberFormat("en-us", {
  maximumFractionDigits: 0
})

function formatOperand(operand) {
  // If there is no number to format, just return nothing
  if (operand == null) return
  // Split the integer and decimal place and store them
  const [integer, decimal] = operand?.split('.')
  // If there is no decimal, format the integer
  if (decimal == null) return INTEGER_FORMATTER.format(integer)
  return `${INTEGER_FORMATTER.format(integer)}.${decimal}`
}

function App() {
  const [{ currentOperand, previousOperand, operation }, dispatch] = useReducer(
    reducer, 
    {}
  )

  return (
    <div className="calculator-grid">
      <div className="output">
        <div className="previous-operand">
          {formatOperand(previousOperand)} {operation}
        </div>
        <div className="current-operand">{formatOperand(currentOperand)}</div>
      </div>
      <button className="span-two" onClick={() => dispatch({ type: ACTIONS.CLEAR })}>AC</button>
      <button onClick={() => dispatch({ type: ACTIONS.DELETE_DIGIT })}>DEL</button>
      <OperationButton operation="/" dispatch={dispatch} />
      <DigitButton digit="1" dispatch={dispatch} />
      <DigitButton digit="2" dispatch={dispatch} />
      <DigitButton digit="3" dispatch={dispatch} />
      <OperationButton operation="*" dispatch={dispatch} />
      <DigitButton digit="4" dispatch={dispatch} />
      <DigitButton digit="5" dispatch={dispatch} />
      <DigitButton digit="6" dispatch={dispatch} />
      <OperationButton operation="+" dispatch={dispatch} />
      <DigitButton digit="7" dispatch={dispatch} />
      <DigitButton digit="8" dispatch={dispatch} />
      <DigitButton digit="9" dispatch={dispatch} />
      <OperationButton operation="-" dispatch={dispatch} />
      <DigitButton digit="." dispatch={dispatch} />
      <DigitButton digit="0" dispatch={dispatch} />
      <button className="span-two"
        onClick={() => dispatch({ type: ACTIONS.EVALUATE })}
      >
        =
      </button>
    </div>
  );
}

export default App;
