import React, { useState, useEffect, useRef } from 'react';

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export const SessionNotesDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const debouncedNotes = useDebounce(notes, 500);
  const initialMount = useRef(true);

  // Mock auto-save
  useEffect(() => {
    if (initialMount.current) {
      initialMount.current = false;
      return;
    }
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      // Save to localStorage or API here
      localStorage.setItem('session-notes', debouncedNotes);
      setSaveStatus('saved');
      
      const idleTimer = setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
      return () => clearTimeout(idleTimer);
    }, 500);

    return () => clearTimeout(timer);
  }, [debouncedNotes]);

  // Initial load
  useEffect(() => {
    const saved = localStorage.getItem('session-notes');
    if (saved) {
      setNotes(saved);
    }
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(notes);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        className={`fixed top-1/2 right-0 transform -translate-y-1/2 z-[100] bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-l-md shadow-lg transition-transform duration-300 ${isOpen ? 'translate-x-full opacity-0 pointer-events-none' : 'translate-x-0'}`}
        aria-label="Toggle Notes"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-80 sm:w-96 bg-white dark:bg-gray-800 shadow-2xl z-[100] transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Session Notes</h2>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {saveStatus === 'saving' && 'Menyimpan...'}
              {saveStatus === 'saved' && 'Tersimpan otomatis'}
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-gray-500 hover:bg-gray-100 rounded dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">
          <div className="flex space-x-2">
            <button
              onClick={() => setIsPreview(false)}
              className={`px-3 py-1 text-sm font-medium rounded ${!isPreview ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
            >
              Edit
            </button>
            <button
              onClick={() => setIsPreview(true)}
              className={`px-3 py-1 text-sm font-medium rounded ${isPreview ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
            >
              Preview
            </button>
          </div>
          <button
            onClick={handleCopy}
            title="Copy to clipboard"
            className="p-1.5 text-gray-600 hover:bg-gray-200 rounded dark:text-gray-300 dark:hover:bg-gray-700 transition-colors flex items-center gap-1 text-xs font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            Export
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          {isPreview ? (
            <div className="prose dark:prose-invert max-w-none text-sm text-gray-800 dark:text-gray-200 break-words whitespace-pre-wrap">
              {notes || <span className="italic text-gray-500 dark:text-gray-400">No notes yet. Switch to Edit mode to write.</span>}
            </div>
          ) : (
            <textarea
              className="w-full h-full p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100 text-sm"
              placeholder="Write your session notes here... (Markdown supported)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          )}
        </div>
      </div>
    </>
  );
};
