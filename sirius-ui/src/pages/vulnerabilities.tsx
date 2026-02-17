import { type NextPage } from "next";
import Layout from "~/components/Layout";
import { VulnerabilityNavigator } from "~/components/vulnerability/VulnerabilityNavigator";

const VulnerabilitiesPage: NextPage = () => {
  return (
    <Layout title="Vulnerability Management">
      <VulnerabilityNavigator />
    </Layout>
  );
};

export default VulnerabilitiesPage;
