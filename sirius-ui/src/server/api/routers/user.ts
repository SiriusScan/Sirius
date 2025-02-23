import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { hash, compare } from "bcrypt";

// Define types for our user management
export interface UserProfile {
  id: string;
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

export const userRouter = createTRPCRouter({
  updateProfile: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        displayName: z.string().min(1).max(50),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const user = await ctx.prisma.user.update({
          where: { id: input.userId },
          data: {
            name: input.displayName,
          },
        });
        return { success: true, user };
      } catch (error) {
        console.error("Error updating user profile:", error);
        throw new Error("Failed to update profile");
      }
    }),

  changePassword: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
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
      try {
        // Get user with current password hash
        const user = await ctx.prisma.user.findUnique({
          where: { id: input.userId },
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
          where: { id: input.userId },
          data: { password: hashedPassword },
        });

        return { success: true };
      } catch (error) {
        console.error("Error changing password:", error);
        throw error;
      }
    }),

  getProfile: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const user = await ctx.prisma.user.findUnique({
          where: { id: input.userId },
          select: {
            id: true,
            email: true,
            name: true,
          },
        });
        return user;
      } catch (error) {
        console.error("Error fetching user profile:", error);
        return null;
      }
    }),
}); 