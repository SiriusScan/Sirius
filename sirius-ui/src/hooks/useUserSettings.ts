import { useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
import { useToast } from "~/components/Toast";

export const useUserSettings = (_userId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const utils = api.useContext();
  const { showToast } = useToast();
  const { update: updateSession } = useSession();

  const { data: profile } = api.user.getProfile.useQuery(undefined, {
    enabled: !!_userId,
  });

  const updateProfile = api.user.updateProfile.useMutation({
    onSuccess: () => {
      showToast("Profile updated successfully", "success");
      void utils.user.getProfile.invalidate();
    },
    onError: (error) => {
      showToast(error.message || "Failed to update profile", "error");
    },
  });

  const changePassword = api.user.changePassword.useMutation({
    onSuccess: async () => {
      showToast("Password changed successfully", "success");
      // Refresh JWT so Layout stops forcing /settings for mustChangePassword.
      await updateSession();
      void utils.user.getProfile.invalidate();
    },
    onError: (error) => {
      showToast(error.message || "Failed to change password", "error");
    },
  });

  const handleUpdateProfile = async (displayName: string) => {
    setIsLoading(true);
    try {
      await updateProfile.mutateAsync({
        displayName,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ) => {
    setIsLoading(true);
    try {
      await changePassword.mutateAsync({
        currentPassword,
        newPassword,
        confirmPassword,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    profile,
    isLoading,
    handleUpdateProfile,
    handleChangePassword,
  };
};
