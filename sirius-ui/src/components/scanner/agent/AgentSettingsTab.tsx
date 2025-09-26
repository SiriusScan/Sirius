import React from "react";
import { Label } from "~/components/lib/ui/label";
import { Switch } from "~/components/lib/ui/switch";
import { Input } from "~/components/lib/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/lib/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/lib/ui/card";
import { Badge } from "~/components/lib/ui/badge";

interface AgentSettingsTabProps {
  agentSyncEnabled: boolean;
  setAgentSyncEnabled: (value: boolean) => void;
  agentScanMode: string;
  setAgentScanMode: (value: string) => void;
  agentTimeout: number;
  setAgentTimeout: (value: number) => void;
  agentConcurrency: number;
  setAgentConcurrency: (value: number) => void;
}

const AgentSettingsTab: React.FC<AgentSettingsTabProps> = ({
  agentSyncEnabled,
  setAgentSyncEnabled,
  agentScanMode,
  setAgentScanMode,
  agentTimeout,
  setAgentTimeout,
  agentConcurrency,
  setAgentConcurrency,
}) => {
  return (
    <div className="space-y-6">
      {/* Agent Sync Settings */}
      <Card className="border-gray-600 bg-gray-800/20">
        <CardHeader>
          <CardTitle className="text-white">Agent Synchronization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Switch
                id="agentSyncEnabled"
                checked={agentSyncEnabled}
                onCheckedChange={setAgentSyncEnabled}
              />
              <Label
                htmlFor="agentSyncEnabled"
                className="text-sm font-semibold text-gray-400"
              >
                Enable Agent Content Sync
              </Label>
            </div>
            <Badge variant="outline" className="text-xs">
              {agentSyncEnabled ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="text-xs text-gray-500">
            Synchronizes custom templates and scripts from UI to Agent Server
            via RabbitMQ
          </p>
        </CardContent>
      </Card>

      {/* Scan Configuration */}
      <Card className="border-gray-600 bg-gray-800/20">
        <CardHeader>
          <CardTitle className="text-white">Scan Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label
              htmlFor="agentScanMode"
              className="mb-2 block text-sm font-semibold text-gray-400"
            >
              Scan Mode
            </Label>
            <Select value={agentScanMode} onValueChange={setAgentScanMode}>
              <SelectTrigger className="w-full rounded-md border border-gray-600 bg-gray-800/20 px-4 py-2 text-white">
                <SelectValue placeholder="Select scan mode" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 text-white">
                <SelectItem value="comprehensive">
                  Comprehensive (Templates + Scripts)
                </SelectItem>
                <SelectItem value="templates-only">Templates Only</SelectItem>
                <SelectItem value="scripts-only">Scripts Only</SelectItem>
                <SelectItem value="custom">Custom Selection</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label
              htmlFor="agentTimeout"
              className="mb-2 block text-sm font-semibold text-gray-400"
            >
              Agent Timeout (seconds): {agentTimeout}
            </Label>
            <input
              type="range"
              min="30"
              max="600"
              value={agentTimeout}
              onChange={(e) => setAgentTimeout(Number(e.target.value))}
              className="w-full"
            />
            <span className="text-xs text-gray-500">
              Maximum time for agent scan operations
            </span>
          </div>

          <div>
            <Label
              htmlFor="agentConcurrency"
              className="mb-2 block text-sm font-semibold text-gray-400"
            >
              Concurrency Limit: {agentConcurrency}
            </Label>
            <input
              type="range"
              min="1"
              max="10"
              value={agentConcurrency}
              onChange={(e) => setAgentConcurrency(Number(e.target.value))}
              className="w-full"
            />
            <span className="text-xs text-gray-500">
              Maximum concurrent agent operations
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Connection Status */}
      <Card className="border-gray-600 bg-gray-800/20">
        <CardHeader>
          <CardTitle className="text-white">Connection Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Agent Server</span>
            <Badge variant="outline" className="text-xs text-green-400">
              Connected
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">RabbitMQ Queue</span>
            <Badge variant="outline" className="text-xs text-green-400">
              Active
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Content Sync</span>
            <Badge variant="outline" className="text-xs text-green-400">
              {agentSyncEnabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card className="border-gray-600 bg-gray-800/20">
        <CardHeader>
          <CardTitle className="text-white">Advanced Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label
              htmlFor="rabbitmqUrl"
              className="mb-2 block text-sm font-semibold text-gray-400"
            >
              RabbitMQ URL
            </Label>
            <Input
              id="rabbitmqUrl"
              value="amqp://guest:guest@sirius-rabbitmq:5672/"
              readOnly
              className="w-full rounded-md border border-gray-600 bg-gray-800/20 px-4 py-2 text-white"
            />
            <span className="text-xs text-gray-500">
              RabbitMQ connection URL for content sync
            </span>
          </div>

          <div>
            <Label
              htmlFor="syncQueue"
              className="mb-2 block text-sm font-semibold text-gray-400"
            >
              Sync Queue Name
            </Label>
            <Input
              id="syncQueue"
              value="agent_content_sync"
              readOnly
              className="w-full rounded-md border border-gray-600 bg-gray-800/20 px-4 py-2 text-white"
            />
            <span className="text-xs text-gray-500">
              Queue name for agent content synchronization
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentSettingsTab;
