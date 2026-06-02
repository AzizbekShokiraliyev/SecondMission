import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { Provider } from "react-redux"
import { store } from "./features/store/store.ts"

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <StrictMode>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </StrictMode>
  </Provider>
)