import React from 'react';
import { LmStudioConfig } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: LmStudioConfig;
  onSave: (config: LmStudioConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, config, onSave }) => {
  const [localConfig, setLocalConfig] = React.useState(config);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 w-full max-w-md shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-4">Server Settings</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">LM Studio Endpoint URL</label>
            <input 
              type="text" 
              value={localConfig.baseUrl}
              onChange={(e) => setLocalConfig({...localConfig, baseUrl: e.target.value})}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500 outline-none"
              placeholder="http://localhost:1234"
            />
            <p className="text-xs text-slate-500 mt-1">Must be compatible with OpenAI Chat Completions API.</p>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Model ID</label>
            <input 
              type="text" 
              value={localConfig.model}
              onChange={(e) => setLocalConfig({...localConfig, model: e.target.value})}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500 outline-none"
              placeholder="google/gemma-3-12b"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              onSave(localConfig);
              onClose();
            }}
            className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-medium transition shadow-lg shadow-brand-500/20"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};