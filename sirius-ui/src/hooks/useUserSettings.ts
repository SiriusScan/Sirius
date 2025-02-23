import { useState } from "react";
import { api } from "~/utils/api";
import { useToast } from "~/components/Toast";

export const useUserSettings = (userId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const utils = api.useContext();
  const { showToast } = useToast();

  const { data: profile } = api.user.getProfile.useQuery(
    { userId },
    { enabled: !!userId }
  );

  const updateProfile = api.user.updateProfile.useMutation({
    onSuccess: () => {
      showToast("Profile updated successfully", "success");
      void utils.user.getProfile.invalidate({ userId });
    },
    onError: (error) => {
      showToast(error.message || "Failed to update profile", "error");
    },
  });

  const changePassword = api.user.changePassword.useMutation({
    onSuccess: () => {
      showToast("Password changed successfully", "success");
    },
    onError: (error) => {
      showToast(error.message || "Failed to change password", "error");
    },
  });

  const handleUpdateProfile = async (displayName: string) => {
    setIsLoading(true);
    try {
      await updateProfile.mutateAsync({
        userId,
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
        userId,
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