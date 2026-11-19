import React, { useState, useEffect } from 'react';
import { X, Key, Check, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';
import { defaultGeminiClient } from '../core/agents/gemini_client';
import { isValidGeminiApiKey } from '../core/security/sanitizer';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyUpdated: () => void;
}

/**
 * Accessible modal dialog for configuring optional Google Gemini API credentials.
 * Implements Escape key listener, scroll lock, and secure input validation.
 */
export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  onKeyUpdated,
}) => {
  const [inputKey, setInputKey] = useState(defaultGeminiClient.getApiKey() || '');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sync key when modal opens
  useEffect(() => {
    if (isOpen) {
      setInputKey(defaultGeminiClient.getApiKey() || '');
      setValidationError(null);
      setSavedSuccess(false);
    }
  }, [isOpen]);

  // Escape key handler & background body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputKey.trim();

    if (trimmed && !isValidGeminiApiKey(trimmed)) {
      setValidationError('Please enter a valid Google Gemini API key (typically starts with AIzaSy).');
      return;
    }

    setValidationError(null);
    defaultGeminiClient.setApiKey(trimmed);
    setSavedSuccess(true);
    onKeyUpdated();
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  const handleClear = () => {
    setInputKey('');
    defaultGeminiClient.setApiKey('');
    setValidationError(null);
    onKeyUpdated();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="api-key-title"
      aria-describedby="api-key-desc"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        <div className="flex items-center space-x-2.5 mb-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Key className="w-4 h-4" aria-hidden="true" />
          </div>
          <h2 id="api-key-title" className="text-base font-bold text-white">
            Google Gemini 2.5 Flash Configuration
          </h2>
        </div>

        <p id="api-key-desc" className="text-xs text-slate-300 leading-relaxed mb-4">
          AtmoPraxis natively includes an offline, deterministic biophysical reasoning engine that works{' '}
          <strong className="text-emerald-400">100% offline with zero external keys</strong>. If you wish to enable live generative synthesis via Google Gemini, enter your API key below.
        </p>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label htmlFor="gemini-key-input" className="block text-xs font-semibold text-slate-400 mb-1.5">
              Gemini API Key (Optional)
            </label>
            <input
              id="gemini-key-input"
              type="password"
              value={inputKey}
              onChange={(e) => {
                setInputKey(e.target.value);
                if (validationError) setValidationError(null);
              }}
              placeholder="AIzaSy..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-600 text-xs font-mono focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
            {validationError && (
              <p className="flex items-center space-x-1 text-xs text-rose-400 mt-1.5">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                <span>{validationError}</span>
              </p>
            )}
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5">
              <span className="flex items-center space-x-1 text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                <span>Stored in local browser session only</span>
              </span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline flex items-center space-x-0.5"
              >
                <span>Get Key</span>
                <ExternalLink className="w-3 h-3" aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2">
            {inputKey && (
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-2 text-xs text-slate-400 hover:text-rose-400 transition-colors"
              >
                Clear Key
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-lg shadow-emerald-600/20"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" aria-hidden="true" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Key</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
