type MessageProps = {
  message: string;
  time: string;
  isSent: boolean;
  isRead: boolean;
  status?: string;
};

const Message = ({ message, isSent, time, status }: MessageProps) => {
  const getStatusIcon = () => {
    switch (status) {
      case "sent":
        return <span className="text-[10px] text-gray-300 mr-2">✓</span>;
      case "delivered":
        return <span className="text-[10px] text-gray-300 mr-2">✓✓</span>;
      case "read":
        return <span className="text-[10px] text-gray-950">✓✓</span>;
      default:
        return null;
    }
  };
  return (
    <div
      className={`rounded-lg  w-max max-w-[70%] min-w-[90px] break-words px-3 py-2 ${
        isSent ? "self-end bg-messagePrimary" : "self-start bg-messageSecondary"
      }`}
    >
      <p>{message}</p>
      <p
        className={`text-[10px] text-end ${
          isSent ? "text-gray-400" : "text-gray-500"
        }`}
      >
        {isSent && (
          <span className="text-[10px] text-gray-300 mr-2">
            {getStatusIcon()}
          </span>
        )}
        {time}
      </p>
    </div>
  );
};

export default Message;
