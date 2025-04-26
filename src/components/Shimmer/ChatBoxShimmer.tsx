import Shimmer from "../../atom/Shimmer";
import Button from "../../atom/Button";
import SentIcon from "../../asset/SentIcon";
import Input from "../../atom/Input";

export const DummyMessagesShimmer = () => {
  return (
    <>
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}
        >
          <div className="bg-secondary animate-pulse p-2 rounded-lg flex flex-col ">
            <Shimmer classNameOuter="w-12 h-4 rounded-md selft-start mb-1" />
            <Shimmer classNameOuter="w-8 h-3 rounded-lg bg-secondary self-end" />
          </div>
        </div>
      ))}
    </>
  );
};

const ChatBoxShimmer = () => {
  return (
    <div className="flex flex-col justify-between h-full w-full ">
      <div className="p-5 pt-0 flex justify-between items-center">
        <div className="flex flex-col space-y-1">
          <Shimmer classNameOuter="w-24 h-4 rounded-md" />
          <Shimmer classNameOuter="w-16 h-3 rounded-md" />
        </div>
        <div className="flex gap-4">
          {[...Array(3)].map((_, i) => (
            <Shimmer key={i} classNameOuter="w-5 h-5 rounded" />
          ))}
        </div>
      </div>

      <div className="p-5 h-full flex flex-col gap-2">
        <DummyMessagesShimmer />
      </div>

      <div className="p-5 flex justify-between">
        <Input type="text" placeholder="Your message" ref={null} />
        <Button
          label="send"
          onlyIcon
          Icon={SentIcon}
          onClick={() => {}}
          className="ml-2"
        />
      </div>
    </div>
  );
};

export default ChatBoxShimmer;
