import { type NextPage } from "next";
import Layout from "~/components/Layout";
import TerminalWrapper from "~/components/TerminalWrapper";
import PageWrapper from "~/components/PageWrapper";

const Terminal: NextPage = () => {
  return (
    <Layout>
      <PageWrapper pageName="Terminal">
        {/* Negative margin pulls into Layout padding, height fills to viewport bottom */}
        <div className="-mx-6 -mb-6 h-[calc(100vh-4.5rem)]">
          <TerminalWrapper />
        </div>
      </PageWrapper>
    </Layout>
  );
};

export default Terminal;
