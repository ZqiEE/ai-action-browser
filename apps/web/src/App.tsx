import { HashRouter } from "@/lib/navigation";
import { AppRouter } from "@/router";

export function App() {
  return (
    <HashRouter>
      <AppRouter />
    </HashRouter>
  );
}
