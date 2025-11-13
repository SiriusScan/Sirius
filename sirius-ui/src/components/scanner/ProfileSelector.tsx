import React from "react";
import { api } from "~/utils/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/lib/ui/select";

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
      <Select value={value} onValueChange={onChange} disabled={isLoading}>
        <SelectTrigger className="relative h-12 w-full rounded-lg border-violet-500/30 bg-gray-900/50 px-4 pr-10 text-sm text-white shadow-sm focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50 [&>svg]:absolute [&>svg]:right-3 [&>svg]:top-1/2 [&>svg]:h-4 [&>svg]:w-4 [&>svg]:-translate-y-1/2 [&>svg]:text-violet-400 [&>svg]:opacity-70">
          <SelectValue
            placeholder={isLoading ? "Loading profiles..." : "Select profile"}
          />
        </SelectTrigger>
        <SelectContent className="z-50 border-violet-500/20 bg-gray-900/95 text-white shadow-xl backdrop-blur-sm">
          {isLoading ? (
            <SelectItem value="loading" disabled className="text-gray-400">
              Loading profiles...
            </SelectItem>
          ) : profiles && profiles.length > 0 ? (
            profiles.map((profile) => (
              <SelectItem
                key={profile.id}
                value={profile.id}
                className="cursor-pointer text-white hover:bg-violet-500/20 focus:bg-violet-500/20 focus:text-violet-100"
              >
                {profile.name}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="none" disabled className="text-gray-400">
              No profiles available
            </SelectItem>
          )}
        </SelectContent>
      </Select>
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
