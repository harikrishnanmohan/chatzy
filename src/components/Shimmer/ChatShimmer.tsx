import ChatItemShimmer from "./ChatItemShimmer";
import ChatBoxShimmer from "./ChatBoxShimmer";
import SearchIcon from "../../asset/SearchIcon";
import Input from "../../atom/Input";

const ChatLeftShimmer = () => {
  return (
    <div className="w-full md:w-[35%] pt-6">
      <Input
        name="search"
        Icon={SearchIcon}
        placeholder="Search"
        className="mb-4"
        ref={null}
        iconLeft
      />
      <div className="p-2">
        {[...Array(4)].map((_, i) => (
          <ChatItemShimmer key={i} />
        ))}
      </div>
    </div>
  );
};

const ChatShimmer = ({
  parentClassName,
  chatBoxClassName,
}: {
  parentClassName?: string;
  chatBoxClassName?: string;
}) => {
  return (
    <div
      className={`bg-primary transition-all duration-500 rounded-3xl flex w-full ${parentClassName}`}
    >
      <ChatLeftShimmer />
      <div className={`flex w-[65%] ${chatBoxClassName}`}>
        <ChatBoxShimmer />
      </div>
    </div>
  );
};

export default ChatShimmer;
export { ChatLeftShimmer };
