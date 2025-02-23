import React from "react";
import Layout from "~/components/Layout";
import { EnvironmentDataTable } from "~/components/EnvironmentDataTable";
import { columns } from "~/components/EnvironmentDataTableColumns";
import EnvironmentIcon from "~/components/icons/EnvironmentIcon";

import { api } from "~/utils/api";

const Environment = () => {
  const hosts = api.host.getAllHosts.useQuery() || [];

  return (
    <Layout>
      <div className="relative z-20 mb-5 h-56">
        <div className="z-10 flex flex-row items-center">
          <div className="ml-4 mt-7 flex dark:fill-white">
            <EnvironmentIcon width="35px" height="35px" fill="white" />
          </div>
          <h1 className="ml-3 mt-5 flex text-4xl font-extralight ">
            Environment {hosts ? null : "Loading..."}
          </h1>
        </div>
        <div className="py-6">
          {hosts?.data && <EnvironmentDataTable columns={columns} data={hosts.data} />}
        </div>
      </div>
    </Layout>
  );
};

export default Environment;
