import { type NextPage } from "next";
import Layout from "~/components/Layout";
import TerminalWrapper from "~/components/TerminalWrapper";

const Terminal: NextPage = () => {
  return (
    <Layout>
      <div className="h-[calc(100vh-4rem)]">
        <TerminalWrapper />
      </div>
    </Layout>
  );
};

export default Terminal;
