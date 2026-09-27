import { ClerkProvider } from "@clerk/clerk-react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { config, hasClerk } from "./lib/config";
import "./index.css";

const app = (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {hasClerk ? (
      <ClerkProvider publishableKey={config.clerkPublishableKey} afterSignOutUrl="/">
        {app}
      </ClerkProvider>
    ) : app}
  </StrictMode>,
);
