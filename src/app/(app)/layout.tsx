import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { CommandPalette } from "@/components/command/command-palette";
import { ToastProvider } from "@/components/ui/toast";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ErrorBoundary } from "@/components/error/error-boundary";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <Topbar />
            <CommandPalette />
            <main className="flex-1 overflow-y-auto bg-white dark:bg-slate-950">
              <ErrorBoundary>{children}</ErrorBoundary>
            </main>
          </div>
        </div>
      </ToastProvider>
    </ThemeProvider>
  );
}
