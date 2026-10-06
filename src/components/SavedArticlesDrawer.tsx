"use client";

import React, { useState, useEffect } from "react";
import { Bookmark, X, ArrowRight, Trash2, Briefcase } from "lucide-react";
import Link from "next/link";

interface SavedArticlesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORAGE_KEY = "kontyra_saved_vyntajobs";

export const SavedArticlesDrawer: React.FC<SavedArticlesDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const [savedJobs, setSavedJobs] = useState<any[]>([]);

  const loadSaved = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSavedJobs(JSON.parse(stored));
      } else {
        setSavedJobs([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadSaved();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleUpdate = () => loadSaved();
    window.addEventListener("vyntajobs_bookmarks_updated", handleUpdate);
    return () => window.removeEventListener("vyntajobs_bookmarks_updated", handleUpdate);
  }, []);

  const removeJob = (id: string) => {
    const updated = savedJobs.filter((p) => p.id !== id && p.slug !== id);
    setSavedJobs(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("vyntajobs_bookmarks_updated"));
  };

  const clearAll = () => {
    setSavedJobs([]);
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event("vyntajobs_bookmarks_updated"));
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] transition-opacity"
      />

      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-black border-l border-white/[0.1] z-[101] p-6 flex flex-col justify-between transition-transform duration-300 transform translate-x-0">
        <div>
          <div className="flex items-center justify-between pb-6 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <Bookmark size={18} className="text-white" />
              <h3 className="text-lg font-semibold text-white tracking-tight">Saved Jobs</h3>
              <span className="text-xs font-mono bg-white/[0.08] text-white/70 px-2 py-0.5 rounded-full">
                {savedJobs.length}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-6 space-y-4 max-h-[calc(100vh-180px)] overflow-y-auto pr-1">
            {savedJobs.length === 0 ? (
              <div className="py-16 text-center text-white/40 space-y-3">
                <Briefcase size={32} className="mx-auto text-white/20" />
                <p className="text-sm">No saved jobs yet.</p>
                <p className="text-xs text-white/30">
                  Bookmark job postings to review scopes and submit proposals later.
                </p>
              </div>
            ) : (
              savedJobs.map((item) => (
                <div
                  key={item.id || item.slug}
                  className="group p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] transition-all relative flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-white/40">
                    <span>{item.category || "VyntaJobs Opportunity"}</span>
                    <button
                      onClick={() => removeJob(item.id || item.slug)}
                      className="opacity-0 group-hover:opacity-100 text-white/40 hover:text-red-400 transition-opacity"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <Link
                    href={`/jobs/${item.slug || item.id}`}
                    onClick={onClose}
                    className="text-sm font-medium text-white hover:text-white/80 transition-colors line-clamp-2 leading-snug"
                  >
                    {item.title}
                  </Link>

                  <div className="flex items-center justify-between pt-2 border-t border-white/[0.04] text-[11px] text-white/40">
                    <span>Escrow Backed Contract</span>
                    <span className="flex items-center gap-1 text-white/70 group-hover:text-white">
                      View Job <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {savedJobs.length > 0 && (
          <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs">
            <button
              onClick={clearAll}
              className="text-white/40 hover:text-red-400 transition-colors font-mono uppercase text-[10px]"
            >
              Clear Saved Jobs
            </button>
            <span className="text-white/30 text-[10px] font-mono">
              Stored Locally
            </span>
          </div>
        )}
      </div>
    </>
  );
};

export default SavedArticlesDrawer;
