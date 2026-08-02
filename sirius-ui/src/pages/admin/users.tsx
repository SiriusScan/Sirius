import { type NextPage } from "next";
import { useState } from "react";
import Layout from "~/components/Layout";
import { Input } from "~/components/lib/ui/input";
import { Button } from "~/components/lib/ui/button";
import { Label } from "~/components/lib/ui/label";
import { Users } from "lucide-react";
import { api } from "~/utils/api";
import { withAdminAuth } from "~/utils/withAuth";

const AdminUsersPage: NextPage = () => {
  const utils = api.useContext();
  const { data: users, isLoading } = api.adminUsers.list.useQuery();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [resetPasswords, setResetPasswords] = useState<Record<number, string>>(
    {}
  );

  const createStudent = api.adminUsers.createStudent.useMutation({
    onSuccess: async () => {
      setFormError(null);
      setFormMessage(`Created student ${username}`);
      setUsername("");
      setEmail("");
      setTemporaryPassword("");
      await utils.adminUsers.list.invalidate();
    },
    onError: (err) => {
      setFormMessage(null);
      setFormError(err.message);
    },
  });

  const setActive = api.adminUsers.setActive.useMutation({
    onSuccess: async () => {
      await utils.adminUsers.list.invalidate();
    },
  });

  const resetPassword = api.adminUsers.resetPassword.useMutation({
    onSuccess: async (_data, vars) => {
      setResetPasswords((prev) => {
        const next = { ...prev };
        delete next[vars.userId];
        return next;
      });
      await utils.adminUsers.list.invalidate();
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormMessage(null);
    createStudent.mutate({
      username: username.trim(),
      email: email.trim(),
      temporaryPassword,
    });
  };

  return (
    <Layout title="Users">
      <div className="relative z-20 -mt-14 space-y-6">
        <div className="sticky top-2 z-30 -mx-4 border-b border-violet-500/20 bg-gray-900/95 px-4 py-3 shadow-lg shadow-black/20 backdrop-blur-sm md:-mx-6 md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 ring-2 ring-violet-500/20">
              <Users className="h-6 w-6 text-violet-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Users
              </h1>
              <p className="text-sm text-gray-400">
                Create and manage student accounts for class workspaces
              </p>
            </div>
          </div>
        </div>

        <section className="rounded-xl border border-violet-500/20 bg-gray-900/60 p-4">
          <h2 className="mb-3 text-lg font-semibold text-white">
            Create student
          </h2>
          <form
            onSubmit={handleCreate}
            className="grid gap-3 md:grid-cols-2 lg:grid-cols-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="off"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="temporaryPassword">Temporary password</Label>
              <Input
                id="temporaryPassword"
                type="password"
                value={temporaryPassword}
                onChange={(e) => setTemporaryPassword(e.target.value)}
                minLength={12}
                required
              />
            </div>
            <div className="flex items-end">
              <Button
                type="submit"
                disabled={createStudent.isLoading}
                className="w-full"
              >
                {createStudent.isLoading ? "Creating…" : "Create student"}
              </Button>
            </div>
          </form>
          {formError && (
            <p className="mt-2 text-sm text-red-400">{formError}</p>
          )}
          {formMessage && (
            <p className="mt-2 text-sm text-emerald-400">{formMessage}</p>
          )}
          <p className="mt-2 text-xs text-gray-500">
            Password must be at least 12 characters. Student must change it on
            next login flow via Settings.
          </p>
        </section>

        <section className="overflow-x-auto rounded-xl border border-violet-500/20 bg-gray-900/60">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-violet-500/20 text-gray-400">
              <tr>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Subject</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-gray-400">
                    Loading users…
                  </td>
                </tr>
              )}
              {!isLoading &&
                users?.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-white/5 text-gray-200"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-4 py-3 capitalize">{user.role}</td>
                    <td className="px-4 py-3">
                      {user.active ? (
                        <span className="text-emerald-400">Active</span>
                      ) : (
                        <span className="text-red-400">Inactive</span>
                      )}
                      {user.mustChangePassword && (
                        <span className="ml-2 text-xs text-amber-400">
                          must change password
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">
                      {user.subjectId}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-2">
                        {user.role !== "admin" && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={setActive.isLoading}
                            onClick={() =>
                              setActive.mutate({
                                userId: user.id,
                                active: !user.active,
                              })
                            }
                          >
                            {user.active ? "Deactivate" : "Activate"}
                          </Button>
                        )}
                        <div className="flex gap-2">
                          <Input
                            type="password"
                            placeholder="New temp password"
                            className="h-8 max-w-[180px]"
                            value={resetPasswords[user.id] ?? ""}
                            onChange={(e) =>
                              setResetPasswords((prev) => ({
                                ...prev,
                                [user.id]: e.target.value,
                              }))
                            }
                            minLength={12}
                          />
                          <Button
                            type="button"
                            size="sm"
                            disabled={
                              resetPassword.isLoading ||
                              (resetPasswords[user.id] ?? "").length < 12
                            }
                            onClick={() => {
                              const pw = resetPasswords[user.id] ?? "";
                              if (pw.length < 12) return;
                              resetPassword.mutate({
                                userId: user.id,
                                temporaryPassword: pw,
                              });
                            }}
                          >
                            Reset
                          </Button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </section>
      </div>
    </Layout>
  );
};

export const getServerSideProps = withAdminAuth();

export default AdminUsersPage;
