import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import './index.css';
import { RouterProvider } from "react-router-dom";
import { router } from './router';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Set initial theme before rendering the app
const savedTheme = localStorage.getItem('theme');
if (
  savedTheme === 'dark' ||
  (
    !savedTheme &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )
) {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
);
