import React from "react";
import { Label } from "~/components/lib/ui/label";
import { Input } from "~/components/lib/ui/input";

interface CallbacksTabProps {
  callbackUrl: string;
  setCallbackUrl: (value: string) => void;
}

const CallbacksTab: React.FC<CallbacksTabProps> = ({
  callbackUrl,
  setCallbackUrl,
}) => {
  return (
    <div>
      <Label
        htmlFor="callbackUrl"
        className="mb-2 block text-sm font-semibold text-gray-400"
      >
        Callback URL
      </Label>
      <Input
        id="callbackUrl"
        type="url"
        className="w-full rounded-md border border-gray-600 bg-gray-800/20 px-4 py-2 text-white placeholder-gray-500"
        placeholder="https://your-webhook-url.com/callback"
        value={callbackUrl}
        onChange={(e) => setCallbackUrl(e.target.value)}
      />
      <span className="mt-1 text-xs text-gray-500">
        URL to call when the scan completes
      </span>
    </div>
  );
};

export default CallbacksTab;
