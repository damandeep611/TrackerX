"use client";

import { toast } from "react-hot-toast";

/** A toast with an Undo action, used instead of confirmation dialogs for reversible actions. */
export function undoToast(message: string, onUndo: () => void, duration = 6000) {
  toast(
    (t) => (
      <span className="flex items-center gap-3 text-sm">
        {message}
        <button
          type="button"
          onClick={() => {
            toast.dismiss(t.id);
            onUndo();
          }}
          className="rounded-md px-2 py-1 text-xs font-medium text-brand hover:bg-brand-soft outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
        >
          Undo
        </button>
      </span>
    ),
    { duration }
  );
}
