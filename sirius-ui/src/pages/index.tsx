import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { api } from "~/utils/api";
import { useEffect, useState } from "react";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  // Get error param from the URL
  useEffect(() => {
    const errorParam = router.query?.error;
    if (errorParam === "CredentialsSignin") {
      setLoginError("Invalid username or password. Please try again.");
    }
  }, [router.query?.error]);

  const hello = api.example.hello.useQuery({ text: "from tRPC" });

  useEffect(() => {
    if (session?.user && router.pathname === "/") {
      void router.push("/dashboard");
    }
  }, [session, router]);

  const handleLogin = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    await signIn("credentials", { username: user, password });
    // Since useSession will automatically update the session state,
    // the useEffect watching session will handle the redirect
  };

  return (
    <div
      className="flex min-h-screen min-w-full items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage: 'url("/loginbg.jpg")',
      }}
    >
      <div className="container mx-auto flex justify-center p-4">
        <Head>
          <title>Sirius Scan</title>
          <meta name="description" content="The Sirius Vulnerability Scanner" />
          <link rel="icon" href="/sirius-logo-square.png" />
        </Head>
        <div className="relative mt-[-35px] flex h-[450px] w-[450px] flex-col items-center rounded-xl border-2 border-[#f7c1ac]/40 bg-transparent px-4 py-6 text-white shadow-lg backdrop-blur-md">
          <img src="/sirius-scan.png" alt="sirius-scan" className="h-[90px]" />

          <form onSubmit={handleLogin} className="w-full">
            <div className="mb-4 mt-4">
              <label className="mb-2 block text-sm font-bold text-[#9a8686]/60">
                Username{" "}
                {loginError && (
                  <div className="mt-2 text-red-500">{loginError}</div>
                )}
              </label>
              <input
                className="w-full rounded border-b-2 border-[#f7c1ac]/70 bg-transparent p-2 text-lg text-violet-100 hover:border-[#e88d7c]/70 focus:border-violet-600/40"
                type="text"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                required
              />
            </div>
            <div className="mb-6">
              <label className="mb-2 block text-sm font-bold text-[#9a8686]/60">
                Password
              </label>
              <input
                className="w-full rounded border-b-2 border-[#f7c1ac]/70 bg-transparent p-2 text-lg text-violet-100 hover:border-[#e88d7c]/70 focus:border-violet-600/40"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <label className="mb-4 flex items-center text-[#9a8686]/90">
              <input type="checkbox" className="form-checkbox text-blue-500" />
              <span className="ml-2">Remember me</span>
            </label>
            <div className="flex items-center justify-between">
              <button
                className="w-full rounded bg-gradient-to-r from-[#e9809a] via-[#f7ae99] to-[#f7ae99] py-3 text-lg font-bold text-black hover:bg-gradient-to-r hover:from-[#e9809a] hover:via-[#9e8f9b] hover:to-[#9e8f9b] hover:text-white"
                type="submit"
              >
                Join the Pack
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
