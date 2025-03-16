// components/Layout.tsx
import React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Head from "next/head";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { Toaster } from "~/components/lib/ui/sonner";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout = ({ children, title = "Sirius Scan" }: LayoutProps) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-violet-500"></div>
      </div>
    );
  }

  if (!session?.user && router.pathname !== "/") {
    void router.push("/");
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="ml-20 flex w-full flex-1 flex-col overflow-x-hidden">
        <Header title={title} />

        <Head>
          <title>{title}</title>
          <meta name="description" content="The Sirius Vulnerability Scanner" />
          <link rel="icon" href="/sirius-logo-square.png" />
        </Head>

        <main className="flex-1">
          {/* Hexagonal gradient background */}
          <div className="hexgrad fixed inset-0 -z-10" />

          {/* Main content */}
          <div className="relative px-6">
            <div className="mx-auto max-w-[1920px]">{children}</div>
          </div>
        </main>
      </div>

      <Toaster />
    </div>
  );
};

export default Layout;
