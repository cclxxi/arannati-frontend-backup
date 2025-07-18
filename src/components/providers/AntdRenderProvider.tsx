"use client";

import React, { useEffect } from "react";
import { unstableSetRender } from "antd";
import { createRoot } from "react-dom/client";

// Add type declaration to fix TypeScript errors
declare global {
  interface Element {
    _reactRoot?: ReturnType<typeof createRoot>;
  }
}

export function AntdRenderProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Implement unstableSetRender for React 19 compatibility
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    unstableSetRender((node: never, container: Element) => {
      container._reactRoot ||= createRoot(container);
      const root = container._reactRoot;
      root.render(node);
      return async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
        root.unmount();
      };
    });
  }, []);

  return <>{children}</>;
}
