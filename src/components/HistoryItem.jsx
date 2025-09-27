import { useContext, useState } from "react";
import { MoreVertical } from "lucide-react";
import { SidebarContext } from "./Sidebar";
import { apiFetch } from "../utils/api";

const HistoryItem = ({ item, onClick }) => {
  const { expanded } = useContext(SidebarContext);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(item.search_query);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleUpdate = () => {
    setIsEditing(true);
    setMenuOpen(false);
  };

  const handleSave = async () => {
    try {
      await apiFetch("/history", {
        method: "PUT",
        body: JSON.stringify({ history_id: item.id, query: editedText }),
      });
      setIsEditing(false);
      // Refresh history after update
      const data = await apiFetch("/history", { method: "GET" });
      // Assuming parent component handles history state update
    } catch (error) {
      console.error("Failed to update history:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await apiFetch("/history", {
        method: "DELETE",
        body: JSON.stringify({ history_id: item.id }),
      });
      setMenuOpen(false);
      // Refresh history after delete
      const data = await apiFetch("/history", { method: "GET" });
      // Assuming parent component handles history state update
    } catch (error) {
      console.error("Failed to delete history:", error);
    }
  };

  return (
    <li
      onClick={onClick}
      className="relative flex items-center py-2 px-3 my-1 font-medium rounded-md cursor-pointer hover:bg-indigo-50 text-gray-600 group"
    >
      {isEditing ? (
        <input
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
          onBlur={handleSave}
          onKeyPress={(e) => e.key === "Enter" && handleSave()}
          className="w-full p-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
      ) : (
        <span className={`overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"}`}>
          {item.search_query}
        </span>
      )}
      {expanded && (
        <div className="ml-2 relative">
          <MoreVertical
            size={20}
            className="cursor-pointer text-gray-500 group-hover:text-gray-700"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
          />
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpdate();
                }}
                className="w-full text-left px-4 py-2 text-blue-500 hover:bg-gray-100"
              >
                Update
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      )}
      {!expanded && (
        <div className="absolute left-full rounded-md px-2 py-1 ml-6 bg-indigo-100 text-indigo-800 text-sm invisible opacity-20 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0">
          {item.search_query}
        </div>
      )}
    </li>
  );
};

export default HistoryItem;