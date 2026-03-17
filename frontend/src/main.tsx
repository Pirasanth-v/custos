import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import './index.css'
import { RouterProvider } from "react-router-dom";
import { router } from './router';

// Set initial theme before rendering the app
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark' || 
  (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.documentElement.classList.add('dark')
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
