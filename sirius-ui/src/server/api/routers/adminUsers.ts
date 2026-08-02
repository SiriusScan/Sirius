import { randomUUID } from "crypto";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { hash } from "bcrypt";
import { adminProcedure, createTRPCRouter } from "~/server/api/trpc";

const usernameSchema = z
  .string()
  .min(2)
  .max(50)
  .regex(/^[a-zA-Z0-9._-]+$/, "Username must be alphanumeric (._- allowed)");

export const adminUsersRouter = createTRPCRouter({
  list: adminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findMany({
      orderBy: { id: "asc" },
      select: {
        id: true,
        subjectId: true,
        name: true,
        email: true,
        role: true,
        active: true,
        mustChangePassword: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }),

  createStudent: adminProcedure
    .input(
      z.object({
        username: usernameSchema,
        email: z.string().email().max(120),
        temporaryPassword: z.string().min(12).max(128),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const username = input.username.toLowerCase();
      if (username === "admin") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot create another admin via this endpoint",
        });
      }

      const existing = await ctx.prisma.user.findFirst({
        where: {
          OR: [{ name: username }, { email: input.email.toLowerCase() }],
        },
      });
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Username or email already exists",
        });
      }

      const passwordHash = await hash(input.temporaryPassword, 12);
      const user = await ctx.prisma.user.create({
        data: {
          subjectId: `local:${randomUUID()}`,
          name: username,
          email: input.email.toLowerCase(),
          password: passwordHash,
          role: "student",
          active: true,
          mustChangePassword: true,
          sessionVersion: 0,
        },
        select: {
          id: true,
          subjectId: true,
          name: true,
          email: true,
          role: true,
          active: true,
          mustChangePassword: true,
        },
      });
      return { success: true, user };
    }),

  setActive: adminProcedure
    .input(
      z.object({
        userId: z.number().int().positive(),
        active: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const target = await ctx.prisma.user.findUnique({
        where: { id: input.userId },
      });
      if (!target) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }
      if (target.role === "admin" && !input.active) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot deactivate the admin account",
        });
      }

      const user = await ctx.prisma.user.update({
        where: { id: input.userId },
        data: {
          active: input.active,
          sessionVersion: { increment: 1 },
        },
        select: {
          id: true,
          subjectId: true,
          name: true,
          active: true,
          sessionVersion: true,
        },
      });
      return { success: true, user };
    }),

  resetPassword: adminProcedure
    .input(
      z.object({
        userId: z.number().int().positive(),
        temporaryPassword: z.string().min(12).max(128),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const target = await ctx.prisma.user.findUnique({
        where: { id: input.userId },
      });
      if (!target) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      const passwordHash = await hash(input.temporaryPassword, 12);
      const user = await ctx.prisma.user.update({
        where: { id: input.userId },
        data: {
          password: passwordHash,
          mustChangePassword: true,
          sessionVersion: { increment: 1 },
        },
        select: {
          id: true,
          subjectId: true,
          name: true,
          mustChangePassword: true,
        },
      });
      return { success: true, user };
    }),
});
