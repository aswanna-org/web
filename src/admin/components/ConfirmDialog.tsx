import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { Trash2, AlertTriangle, Info, X } from 'lucide-react';

export interface ConfirmOptions {
  title?: string;
  subtitle?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  itemName?: string;
}

interface ConfirmContextType {
  confirm: (options: string | ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
};

interface DialogState {
  isOpen: boolean;
  options: ConfirmOptions;
  resolve?: (value: boolean) => void;
}

const defaultOptions: ConfirmOptions = {
  title: 'Confirm Deletion',
  subtitle: 'මෙම අයිතමය ස්ථිරවම ඉවත් කිරීමට ඔබට අවශ්‍යද?',
  message: 'Are you sure you want to delete this item? This action cannot be undone.',
  confirmText: 'Confirm Delete',
  cancelText: 'Cancel',
  type: 'danger'
};

export const ConfirmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dialogState, setDialogState] = useState<DialogState>({
    isOpen: false,
    options: defaultOptions
  });

  const confirm = useCallback((options: string | ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      const parsedOptions: ConfirmOptions =
        typeof options === 'string'
          ? {
              ...defaultOptions,
              message: options,
              title: options.toLowerCase().includes('delete') ? 'Confirm Delete' : 'Please Confirm'
            }
          : {
              ...defaultOptions,
              ...options
            };

      setDialogState({
        isOpen: true,
        options: parsedOptions,
        resolve
      });
    });
  }, []);

  const handleConfirm = () => {
    if (dialogState.resolve) {
      dialogState.resolve(true);
    }
    setDialogState((prev) => ({ ...prev, isOpen: false, resolve: undefined }));
  };

  const handleCancel = () => {
    if (dialogState.resolve) {
      dialogState.resolve(false);
    }
    setDialogState((prev) => ({ ...prev, isOpen: false, resolve: undefined }));
  };

  const { options, isOpen } = dialogState;
  const isDanger = options.type !== 'warning' && options.type !== 'info';
  const isWarning = options.type === 'warning';

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {/* Confirmation Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
          onClick={handleCancel}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all p-6 space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div
                  className={`p-3 rounded-2xl shrink-0 ${
                    isDanger
                      ? 'bg-rose-100 text-rose-600'
                      : isWarning
                      ? 'bg-amber-100 text-amber-600'
                      : 'bg-blue-100 text-blue-600'
                  }`}
                >
                  {isDanger ? (
                    <Trash2 className="w-6 h-6" />
                  ) : isWarning ? (
                    <AlertTriangle className="w-6 h-6" />
                  ) : (
                    <Info className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                    {options.title || 'Confirm Deletion'}
                  </h3>
                  {options.subtitle && (
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      {options.subtitle}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleCancel}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Message Body */}
            <div
              className={`rounded-2xl p-4 text-xs space-y-2 border ${
                isDanger
                  ? 'bg-rose-50/70 border-rose-100/90 text-rose-900'
                  : isWarning
                  ? 'bg-amber-50/70 border-amber-100/90 text-amber-900'
                  : 'bg-blue-50/70 border-blue-100/90 text-blue-900'
              }`}
            >
              <p className="font-medium leading-relaxed whitespace-pre-line">
                {options.message}
              </p>
              {options.itemName && (
                <p className="font-bold text-slate-800 bg-white/80 p-2 rounded-lg border border-slate-200/60 truncate">
                  {options.itemName}
                </p>
              )}
              {isDanger && (
                <p className="text-[11px] text-rose-600/90 font-medium">
                  ⚠️ This action is permanent and cannot be undone.
                </p>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl transition-colors cursor-pointer"
              >
                {options.cancelText || 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                autoFocus
                className={`px-5 py-2.5 text-xs font-semibold text-white rounded-xl shadow-xs transition-all duration-150 flex items-center gap-2 cursor-pointer ${
                  isDanger
                    ? 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 shadow-rose-900/20'
                    : isWarning
                    ? 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800 shadow-amber-900/20'
                    : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-blue-900/20'
                }`}
              >
                {isDanger && <Trash2 size={14} className="shrink-0" />}
                <span>{options.confirmText || 'Confirm Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};

export default ConfirmProvider;
