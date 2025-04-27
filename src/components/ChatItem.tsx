import {
  collection,
  doc,
  getDocs,
  where,
  writeBatch,
} from "firebase/firestore";
import { useEffect } from "react";
import { db } from "../firebase";
import { query } from "firebase/firestore";
import { ChatType } from "../BuildEntry";
import UserIcon from "../asset/UserIcon";

type ChatItemProps = {
  icon?: string;
  name: string;
  lastMessage: string;
  newMessageCount: number;
  isActive: boolean;
  lastMessageTime: string | null;
  onClick: React.Dispatch<React.SetStateAction<ChatType | null>>;
  chat: ChatType;
};

const ChatItem = ({
  icon,
  name,
  lastMessage,
  newMessageCount,
  isActive,
  lastMessageTime,
  onClick,
  chat,
}: ChatItemProps) => {
  useEffect(() => {
    const markDelivered = async () => {
      if (!chat?.chatId || newMessageCount === 0) return;

      const messagesRef = collection(db, `chats/${chat.chatId}/messages`);
      const q = query(
        messagesRef,
        where("senderId", "==", chat.otherUser?.userId),
        where("status", "==", "sent")
      );

      const snapshot = await getDocs(q);
      const batch = writeBatch(db);

      snapshot.forEach((docSnap) => {
        const msgRef = doc(db, `chats/${chat.chatId}/messages/${docSnap.id}`);
        batch.update(msgRef, {
          status: "delivered",
        });
      });

      await batch.commit();
    };

    markDelivered();
  }, [chat?.chatId, newMessageCount]);

  return (
    <div
      onClick={() => onClick(chat)}
      className={`${
        isActive ? "bg-secondary" : "bg-transparent"
      } mb-2 p-4 pr-4 rounded-lg flex text-sm w-full justify-between items-start cursor-pointer hover:bg-secondary transition-all duration-300`}
    >
      {icon ? (
        <img
          src={icon}
          alt="user avatar"
          className="w-9 h-9 rounded-[50%] object-cover"
        />
      ) : (
        <UserIcon width="36px" height="36px" />
      )}
      <div className="flex flex-col justify-center ml-1 flex-grow ">
        <span className="ml-2">{name}</span>
        <span className="text-gray-500 ml-2">{lastMessage}</span>
      </div>
      <div className="text-right text-gray-500 text-[12px] flex flex-col justify-start items-end">
        <span>{lastMessageTime}</span>
        {newMessageCount > 0 && (
          <span className="rounded-full bg-secondary w-5 text-center">
            {newMessageCount}
          </span>
        )}
      </div>
    </div>
  );
};

export default ChatItem;
