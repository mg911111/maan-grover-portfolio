import { useEffect, useRef } from "react";

const KEY_MAP = {
  ArrowUp: "forward",
  KeyW: "forward",
  ArrowDown: "backward",
  KeyS: "backward",
  ArrowLeft: "left",
  KeyA: "left",
  ArrowRight: "right",
  KeyD: "right",
  Space: "boost",
  Backspace: "reset",
};

const EMPTY_INPUT_STATE = {
  forward: false,
  reverse: false,
  backward: false,
  left: false,
  right: false,
  boost: false,
  reset: false,
  resetPressed: false,
  open: null,
};

function getActionForEvent(event, pressed = true) {
  if (event.code === "KeyR" && (event.shiftKey || !pressed)) return "reset";
  return KEY_MAP[event.code];
}

function writeDerivedInput(input, pressedKeys) {
  input.forward = pressedKeys.has("forward");
  input.reverse = pressedKeys.has("reverse");
  input.backward = input.reverse;
  input.left = pressedKeys.has("left");
  input.right = pressedKeys.has("right");
  input.boost = pressedKeys.has("boost");
  input.reset = pressedKeys.has("reset");
  input.open = null;
}

export function useKeyboardInput() {
  const pressedKeysRef = useRef(new Set());
  const input = useRef({ ...EMPTY_INPUT_STATE });

  useEffect(() => {
    const clearInput = () => {
      pressedKeysRef.current.clear();
      Object.assign(input.current, EMPTY_INPUT_STATE);
    };

    const setKey = (event, pressed) => {
      let action = getActionForEvent(event, pressed);
      if (!action) return;
      if (action === "backward") action = "reverse";

      event.preventDefault();

      if (event.repeat && action === "reset") return;
      if (action === "reset") {
        if (pressed && !pressedKeysRef.current.has(action)) {
          input.current.resetPressed = true;
        }
      }

      if (pressed) {
        pressedKeysRef.current.add(action);
      } else {
        pressedKeysRef.current.delete(action);
      }

      writeDerivedInput(input.current, pressedKeysRef.current);
    };

    const onKeyDown = (event) => setKey(event, true);
    const onKeyUp = (event) => setKey(event, false);
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") clearInput();
    };
    const onPointerLockChange = () => {
      if (!document.pointerLockElement) clearInput();
    };

    window.addEventListener("keydown", onKeyDown, { passive: false });
    window.addEventListener("keyup", onKeyUp, { passive: false });
    window.addEventListener("blur", clearInput);
    window.addEventListener("pagehide", clearInput);
    document.addEventListener("visibilitychange", onVisibilityChange);
    document.addEventListener("pointerlockchange", onPointerLockChange);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", clearInput);
      window.removeEventListener("pagehide", clearInput);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      document.removeEventListener("pointerlockchange", onPointerLockChange);
      clearInput();
    };
  }, []);

  return input;
}
