import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function RightSidebar({ resources }) {
  const [showAll, setShowAll] = useState(false);
  const displayedResources = showAll ? resources : resources.slice(0, 5);

  return (
    <aside className="h-screen w-64 bg-white border-l shadow-sm">
      <div className="p-4">
        <h2 className="text-lg font-semibold">Resources</h2>
        <ul className="mt-2 space-y-2">
          {displayedResources.map((resource, index) => (
            <li key={index} className="text-blue-500 underline">
              <a href={resource.url} target="_blank" rel="noopener noreferrer">
                {resource.title}
              </a>
            </li>
          ))}
        </ul>
        {resources.length > 5 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="mt-2 flex items-center text-indigo-500 hover:text-indigo-700"
          >
            <ChevronDown className={`w-4 h-4 ${showAll ? "rotate-180" : ""}`} />
            {showAll ? "See less" : `See all (${resources.length})`}
          </button>
        )}
      </div>
    </aside>
  );
}