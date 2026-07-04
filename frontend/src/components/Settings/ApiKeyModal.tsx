import { useState } from "react";
import { Key, Eye, EyeOff, CheckCircle } from "lucide-react";
import { useSettingsStore } from "../../store/useSettingsStore";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ApiKeyModal({ open, onClose }: Props) {
  const { apiKey, setApiKey } = useSettingsStore();
  const [value, setValue] = useState(apiKey);
  const [show, setShow] = useState(false);

  if (!open) return null;

  const handleSave = () => {
    setApiKey(value.trim());
    onClose();
  };

  const isValid = value.trim().startsWith("sk-ant-");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-accent-light flex items-center justify-center">
            <Key className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Anthropic API Key</h2>
            <p className="text-sm text-gray-500">Required to power Lucid's AI features</p>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Your key is stored locally in your browser and sent directly to Anthropic.
          It is never stored on Lucid's servers.
        </p>

        <div className="relative mb-6">
          <input
            type={show ? "text" : "password"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="sk-ant-api03-..."
            className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
          />
          <button
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {isValid && (
          <div className="flex items-center gap-2 text-sm text-green-600 mb-4">
            <CheckCircle className="w-4 h-4" />
            Key format looks valid
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid}
            className="flex-1 px-4 py-2.5 text-sm text-white bg-accent rounded-xl hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Save Key
          </button>
        </div>

        <p className="mt-4 text-xs text-gray-400 text-center">
          Get your key at{" "}
          <a
            href="https://console.anthropic.com/settings/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            console.anthropic.com
          </a>
        </p>
      </div>
    </div>
  );
}
