import Layout from "~/components/Layout";
import { EmptyState } from "~/components/shared/EmptyState";
import { ArrowRight, Radar } from "lucide-react";

/** Unknown routes render inside the app shell, with a way back in. */
export default function NotFoundPage() {
  return (
    <Layout title="Page not found">
      <div className="mx-auto max-w-2xl py-16">
        <EmptyState
          variant="not-found"
          icon={Radar}
          title="This page doesn't exist"
          reason="The link may be old. Hosts live under Environment; each one opens at /host/<address>."
          primary={{ label: "Go to Dashboard", icon: ArrowRight, href: "/dashboard" }}
          secondary={{ label: "Open Environment", href: "/environment" }}
        />
      </div>
    </Layout>
  );
}
