import { type NextPage } from "next";
import Layout from "~/components/Layout";
import TerminalWrapper from "~/components/TerminalWrapper";
import PageWrapper from "~/components/PageWrapper";

const Terminal: NextPage = () => {
  return (
    <Layout frame="workspace">
      <PageWrapper pageName="Terminal">
        <TerminalWrapper />
      </PageWrapper>
    </Layout>
  );
};

export default Terminal;
