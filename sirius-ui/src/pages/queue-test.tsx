import { type NextPage } from "next";
import { api } from "~/utils/api";
import Layout from "~/components/Layout";

const QueueTest: NextPage = () => {
  const executeCommand = api.terminal.executeCommand.useMutation({
    onSuccess: (data) => {
      console.log("Command response:", data);
    },
    onError: (error) => {
      console.error("Command error:", error);
    },
  });

  const testCommands = [
    "ls",
    "pwd",
    "whoami",
    "date",
    "echo hello world",
    "invalid_command",
  ];

  return (
    <Layout title="Queue Test">
      <div className="flex flex-col gap-4 p-4">
        <h1 className="text-2xl font-light text-white">Queue Test Panel</h1>

        <div className="flex flex-col gap-2">
          {testCommands.map((cmd) => (
            <div key={cmd} className="flex items-center gap-4">
              <button
                className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                onClick={() => executeCommand.mutateAsync({ command: cmd })}
              >
                Test: {cmd}
              </button>
              <pre className="text-white">
                {executeCommand.data?.output ?? "No response yet"}
              </pre>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <h2 className="mb-2 text-xl text-white">Last Response:</h2>
          <pre className="rounded bg-gray-800 p-4 text-white">
            {JSON.stringify(executeCommand.data, null, 2)}
          </pre>
        </div>
      </div>
    </Layout>
  );
};

export default QueueTest;
