import * as React from "react";

import { SidebarNav } from "@/components/layout/sidebar-nav";
import { HeaderMeta } from "@/components/layout/header-meta";
import { MobileNav } from "@/components/layout/mobile-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-background/85 px-4 backdrop-blur-[10px] md:px-8">
          <MobileNav />
          <HeaderMeta />
        </header>
        <main id="main-content" className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
