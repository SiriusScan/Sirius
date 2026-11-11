import { safeErrorForLogging } from "~/server/safeErrorForLogging";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { hash, compare } from "bcrypt";

// Define types for our user management
export interface UserProfile {
  id: number;
  email: string;
  displayName?: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  message?: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message?: string;
}

const sessionUserIdSchema = z
  .string()
  .regex(/^[1-9]\d*$/)
  .transform(Number)
  .pipe(z.number().int().positive().safe());

function getCurrentUserId(
  sessionUserId: string,
  requestedUserId: number
): number {
  const result = sessionUserIdSchema.safeParse(sessionUserId);
  if (!result.success) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  // Keep the existing settings payload compatible, but never use it as authority.
  if (requestedUserId !== result.data) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return result.data;
}

const profileSelect = { id: true, email: true, name: true } as const;

export const userRouter = createTRPCRouter({
  updateProfile: protectedProcedure
    .input(
      z.object({
        userId: z.coerce.number().int().positive().safe(),
        displayName: z.string().min(1).max(50),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = getCurrentUserId(ctx.session.user.id, input.userId);
      try {
        const user = await ctx.prisma.user.update({
          where: { id: userId },
          data: {
            name: input.displayName,
          },
          select: profileSelect,
        });
        return { success: true, user };
      } catch (error) {
        console.error(
          "Error updating user profile:",
          safeErrorForLogging(error)
        );
        throw new Error("Failed to update profile");
      }
    }),

  changePassword: protectedProcedure
    .input(
      z
        .object({
          userId: z.coerce.number().int().positive().safe(),
          currentPassword: z.string(),
          newPassword: z.string().min(8),
          confirmPassword: z.string(),
        })
        .refine((data) => data.newPassword === data.confirmPassword, {
          message: "Passwords don't match",
          path: ["confirmPassword"],
        })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = getCurrentUserId(ctx.session.user.id, input.userId);
      try {
        // Get user with current password hash
        const user = await ctx.prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, password: true },
        });

        if (!user?.password) {
          throw new Error("User not found or no password set");
        }

        // Verify current password
        const isValid = await compare(input.currentPassword, user.password);
        if (!isValid) {
          throw new Error("Current password is incorrect");
        }

        // Hash new password and update
        const hashedPassword = await hash(input.newPassword, 10);
        await ctx.prisma.user.update({
          where: { id: userId },
          data: { password: hashedPassword },
        });

        return { success: true };
      } catch (error) {
        console.error("Error changing password:", safeErrorForLogging(error));
        throw error;
      }
    }),

  getProfile: protectedProcedure
    .input(z.object({ userId: z.coerce.number().int().positive().safe() }))
    .query(async ({ ctx, input }) => {
      const userId = getCurrentUserId(ctx.session.user.id, input.userId);
      try {
        const user = await ctx.prisma.user.findUnique({
          where: { id: userId },
          select: profileSelect,
        });
        return user;
      } catch (error) {
        console.error(
          "Error fetching user profile:",
          safeErrorForLogging(error)
        );
        return null;
      }
    }),
});
