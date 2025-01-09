import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const queueRouter = createTRPCRouter().mutation("startScan", {
  input: publicProcedure.input({}),
  resolve: async () => {
    // Your backend logic for scanning
    console.log("Backend scan started");
    return "Scan complete";
  },
});
