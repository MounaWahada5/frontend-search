import React, { useState } from "react";

export default function ChatHistoryItem({ chat, expanded, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(chat.title || chat.content);

  const handleUpdate = () => {
    if (isEditing && editedText !== chat.title) {
      onUpdate(chat.id, editedText);
    }
    setIsEditing(!isEditing);
  };

  return (
    <li
      className="relative flex items-center py-2 px-3 my-1 font-medium rounded-md cursor-pointer hover:bg-indigo-50 text-gray-600"
    >
      {isEditing ? (
        <input
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
          className="w-full p-1"
        />
      ) : (
        <span className={`overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"}`}>
          {chat.title || chat.content}
        </span>
      )}
      {expanded && (
        <div className="flex space-x-2 ml-2">
          <button onClick={handleUpdate} className="text-blue-500">
            {isEditing ? "Save" : "Edit"}
          </button>
          <button onClick={() => onDelete(chat.id)} className="text-red-500">
            Delete
          </button>
        </div>
      )}
    </li>
  );
}