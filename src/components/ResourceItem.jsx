import { useContext } from "react";
import { SidebarContext } from "./Sidebar";

const ResourceItem = ({ resource }) => {
  const { expanded } = useContext(SidebarContext);

  const handleClick = () => {
    if (resource.url) {
      window.open(resource.url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <li
      className="relative flex items-center py-2 px-3 my-1 font-medium rounded-md cursor-pointer hover:bg-indigo-50 text-gray-600"
      onClick={handleClick}
    >
      <span className={`overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"}`}>
        {resource.title}
      </span>
      {!expanded && (
        <div
          className={`absolute left-full rounded-md px-2 py-1 ml-6 bg-indigo-100 text-indigo-800 text-sm invisible opacity-20 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0`}
        >
          {resource.title}
        </div>
      )}
    </li>
  );
};

export default ResourceItem;