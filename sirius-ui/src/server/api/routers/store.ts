import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";
import Valkey from "iovalkey";

const valkey = new Valkey({
  port: 6379,
  host: "sirius-valkey",
});

export const storeRouter = createTRPCRouter({
  // Returns the value of a key in the store
  getValue: publicProcedure
    .input(z.object({ key: z.string() }))
    .query(async ({ input }) => {
      const { key } = input;
      const value = valkey.get(key);
      return value ?? null;
    }),
  // Sets the value of a key in the store
  setValue: publicProcedure
    .input(z.object({ key: z.string(), value: z.string() }))
    .mutation(async ({ input }) => {
      const { key, value } = input;
      try {
        await valkey.set(key, value);
        console.log("Value set successfully");
      } catch (error) {
        console.error("Error setting value:", error);
      }

      return true;
    }),
});
