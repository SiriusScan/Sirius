import { type NextPage } from "next";
import Layout from "~/components/Layout";
import TerminalWrapper from "~/components/TerminalWrapper";
import PageWrapper from "~/components/PageWrapper";

const Terminal: NextPage = () => {
  return (
    <Layout>
      <PageWrapper pageName="Terminal">
        <div className="h-[calc(100vh-4rem)]">
          <TerminalWrapper />
        </div>
      </PageWrapper>
    </Layout>
  );
};

export default Terminal;
