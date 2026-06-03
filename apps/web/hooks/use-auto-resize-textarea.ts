"use client";

import { useLayoutEffect, useRef } from "react";

export function useAutoResizeTextarea(value: string) {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }
    node.style.height = "0px";
    node.style.height = `${Math.min(node.scrollHeight, 220)}px`;
  }, [value]);

  return ref;
}
