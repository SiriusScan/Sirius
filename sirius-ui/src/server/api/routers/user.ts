import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { hash, compare } from "bcrypt";

export const userRouter = createTRPCRouter({
  /** Profile for the authenticated session user only. */
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const userId = Number(ctx.session.user.id);
    return ctx.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        subjectId: true,
        role: true,
        mustChangePassword: true,
      },
    });
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        displayName: z.string().min(1).max(50),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);
      try {
        const user = await ctx.prisma.user.update({
          where: { id: userId },
          data: { name: input.displayName },
          select: {
            id: true,
            email: true,
            name: true,
            subjectId: true,
            role: true,
          },
        });
        return { success: true, user };
      } catch (error) {
        console.error("Error updating user profile:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update profile",
        });
      }
    }),

  changePassword: protectedProcedure
    .input(
      z
        .object({
          currentPassword: z.string(),
          newPassword: z.string().min(12).max(128),
          confirmPassword: z.string(),
        })
        .refine((data) => data.newPassword === data.confirmPassword, {
          message: "Passwords don't match",
          path: ["confirmPassword"],
        })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = Number(ctx.session.user.id);
      const user = await ctx.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, password: true, name: true, email: true },
      });

      if (!user?.password) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const isValid = await compare(input.currentPassword, user.password);
      if (!isValid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Current password is incorrect",
        });
      }

      const lowered = input.newPassword.toLowerCase();
      if (
        lowered === user.name.toLowerCase() ||
        lowered === user.email.toLowerCase()
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Password must not match username or email",
        });
      }

      const hashedPassword = await hash(input.newPassword, 12);
      // Do not bump sessionVersion on self-service change — keep the current JWT valid.
      // Admin reset/deactivate still increments sessionVersion to revoke other sessions.
      await ctx.prisma.user.update({
        where: { id: userId },
        data: {
          password: hashedPassword,
          mustChangePassword: false,
        },
      });

      return { success: true };
    }),
});
