"use client";

import { useRouter } from "next/navigation"; // Use 'next/navigation' for App Router
import { useActionsStore } from "@/hooks/actionsState";
import Animatedbutton from "./Animatedbutton";

export const PersistentQuickActions = () => {
  // 1. Listens to the global state from your Zustand store
  const { showActions, dismissActions } = useActionsStore();
  const router = useRouter();

  // 2. If the signal is false, it renders nothing
  if (!showActions) {
    return null;
  }

  // 3. This function will hide the banner *and* change the page
  const handleActionClick = (path: string) => {
    dismissActions(); // Hides the banner
    router.push(path); // Navigates
  };

  // 4. If the signal is true, it renders your buttons in a fixed banner
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-200 shadow-lg">
      <div className="container mx-auto flex flex-wrap gap-3 justify-center items-center">
        <span className="font-medium text-gray-900 mr-2 hidden sm:block">
          Upload complete! What&apos;s next?
        </span>

        {/* Your buttons are here */}
        <Animatedbutton
          onClick={() => handleActionClick("/dashboard")}
          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium"
        >
          Go to Dashboard
        </Animatedbutton>
        <Animatedbutton
          onClick={() => handleActionClick("/convert")}
          className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
        >
          Convert Files
        </Animatedbutton>
        <Animatedbutton
          onClick={() => handleActionClick("/resize")}
          className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
        >
          Resize Images
        </Animatedbutton>

        {/* A Animatedbutton to close the banner */}
        <Animatedbutton
          onClick={dismissActions}
          className="text-gray-400 hover:text-gray-600 ml-2"
          aria-label="Dismiss"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </Animatedbutton>
      </div>
    </div>
  );
};
