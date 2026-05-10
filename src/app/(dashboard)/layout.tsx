import { Navbar } from "@/components/layout/Navbar";
import { LiveblocksProvider } from "@/liveblocks.config";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LiveblocksProvider>
      <div className="flex flex-col min-h-full bg-base">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 md:p-10 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </LiveblocksProvider>
  );
}
