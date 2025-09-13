"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";


function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
    const [client] = useState(new QueryClient())
  return (
     <QueryClientProvider client={client}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default QueryProvider

// QueryClient contains query cache
// Devtools help us to see the cache