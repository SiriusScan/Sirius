import React from "react";
import { api } from "~/utils/api";

interface ProfileSelectorProps {
  value: string; // profile ID
  onChange: (profileId: string) => void;
  showDescription?: boolean;
}

const ProfileSelector: React.FC<ProfileSelectorProps> = ({
  value,
  onChange,
  showDescription = false,
}) => {
  // Using templates API temporarily - will migrate to profiles API in Phase 3
  const { data: profiles, isLoading } = api.templates.getTemplates.useQuery();

  const selectedProfile = profiles?.find((p) => p.id === value);

  return (
    <div className="space-y-2">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full rounded-lg border border-violet-500/30 bg-gray-900/50 px-4 text-sm text-white focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50"
        disabled={isLoading}
      >
        {isLoading ? (
          <option>Loading profiles...</option>
        ) : profiles && profiles.length > 0 ? (
          profiles.map((profile) => (
            <option key={profile.id} value={profile.id}>
              {profile.name}
            </option>
          ))
        ) : (
          <option>No profiles available</option>
        )}
      </select>
      {showDescription && selectedProfile && (
        <div className="rounded-lg bg-violet-500/5 p-2 text-xs text-violet-200/70">
          {selectedProfile.description}
        </div>
      )}
    </div>
  );
};

export { ProfileSelector };
export default ProfileSelector;
