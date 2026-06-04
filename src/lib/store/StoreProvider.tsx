"use client";

import { useState, type ReactNode } from "react";
import { Provider } from "react-redux";
import { makeStore } from "./index";

export default function StoreProvider({ children }: { children: ReactNode }) {
  // Create the store once per client instance (lazy initializer runs once).
  const [store] = useState(makeStore);

  return <Provider store={store}>{children}</Provider>;
}
