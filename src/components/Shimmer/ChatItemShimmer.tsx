import Shimmer from "../../atom/Shimmer";

const ChatItemShimmer = () => {
  return (
    <div className="mb-2 p-2 rounded-lg flex text-sm w-full justify-between items-start bg-secondary animate-pulse">
      <Shimmer classNameOuter="w-10 h-10 rounded-lg bg-primary" />

      <div className="flex flex-col justify-center ml-2 flex-grow space-y-2">
        <Shimmer classNameOuter="w-24 h-4 rounded-md" />
        <Shimmer classNameOuter="w-36 h-3 rounded-md" />
      </div>

      <div className="text-right text-[12px] flex flex-col justify-start items-end space-y-2 ml-2">
        <Shimmer classNameOuter="w-10 h-3 rounded-md" />
        <Shimmer classNameOuter="w-5 h-5 rounded-full bg-secondary" />
      </div>
    </div>
  );
};

export default ChatItemShimmer;
