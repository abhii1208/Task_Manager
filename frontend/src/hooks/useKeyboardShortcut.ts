import { useEffect } from "react";

type ShortcutOptions = {
  key: string;
  enabled?: boolean;
  ignoreInputTargets?: boolean;
  onTrigger: () => void;
};

const isInputLikeElement = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();
  return tagName === "input" || tagName === "textarea" || tagName === "select" || target.isContentEditable;
};

export const useKeyboardShortcut = ({
  key,
  enabled = true,
  ignoreInputTargets = true,
  onTrigger
}: ShortcutOptions) => {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const listener = (event: KeyboardEvent): void => {
      if (ignoreInputTargets && isInputLikeElement(event.target)) {
        return;
      }

      if (event.key.toLowerCase() === key.toLowerCase()) {
        event.preventDefault();
        onTrigger();
      }
    };

    window.addEventListener("keydown", listener);

    return () => {
      window.removeEventListener("keydown", listener);
    };
  }, [enabled, ignoreInputTargets, key, onTrigger]);
};