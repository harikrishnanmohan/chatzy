import Input from "../atom/Input";
import Search from "../asset/SearchIcon";

import ChatItem from "./ChatItem";
import ChatBox from "./ChatBox";
import { memo, useContext, useEffect, useRef, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import UserContext from "../context/user-context";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  formatLastMessageTime,
  getFullName,
  getUreadMessageCount,
} from "../util";
import { ChatLeftShimmer } from "./Shimmer/ChatShimmer";
import { ChatType } from "../BuildEntry";
import useInputDebouncer from "../hooks/useInputDebuncer";
import Details from "./Details";
import MenuIcon from "../asset/MenuIcon";
import UserIcon from "../asset/UserIcon";

dayjs.extend(relativeTime);
dayjs.extend(isToday);
dayjs.extend(isYesterday);

type ChatProps = {
  setShowDetails: React.Dispatch<React.SetStateAction<boolean>>;
  chats: ChatType[];
  isLoading: boolean;
  showDetails: boolean;
  setShowLeftBar: React.Dispatch<React.SetStateAction<boolean>>;
  showLeftBar: boolean;
};

const Chat = ({
  setShowDetails,
  chats,
  isLoading,
  showDetails,
  setShowLeftBar,
  showLeftBar,
}: ChatProps) => {
  const searchRef = useRef<HTMLInputElement>(null);
  const userCtx = useContext(UserContext);
  const [activeChat, setActiveChat] = useState<ChatType | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  // const [showLeftBar, setShowLeftBar] = useState<boolean>(false);

  useEffect(() => {
    const userId = userCtx?.getUser()?.userId;
    if (!userId) return;

    const updateLastSeen = async () => {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        lastSeen: Timestamp.fromDate(new Date()),
      });
    };

    updateLastSeen();

    const interval = setInterval(updateLastSeen, 60 * 1000);

    return () => clearInterval(interval);
  }, [userCtx]);

  useEffect(() => {
    if (activeChat?.chatId) {
      const stillExists = chats.some(
        (chat) => chat.chatId === activeChat.chatId
      );
      if (!stillExists) setActiveChat(null);
    }
  }, [chats]);

  useEffect(() => {
    if (activeChat?.chatId) {
      setShowDetails(false);
    }
  }, [activeChat]);

  const result = useInputDebouncer(searchQuery, 250);

  const handleStartChat = async (user: any) => {
    console.log("Starting chat with user:", user);
    const currentUser = userCtx?.getUser();
    if (!currentUser) return;

    try {
      const chatsRef = collection(db, "chats");

      const q = query(
        chatsRef,
        where("participants", "array-contains", currentUser.userId)
      );

      const snapshot = await getDocs(q);
      let existingChat: ChatType | null = null as ChatType | null;

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (
          data.participants.includes(user.userId) &&
          data.participants.includes(currentUser.userId)
        ) {
          existingChat = {
            chatId: doc.id,
            participants: data.participants || [],
            lastMessage: data.lastMessage || "",
            lastMessageTime: data.lastMessageTime || Timestamp.now(),
            unread: data.unread || {},
            otherUser: null,
          };
        }
      });

      if (existingChat) {
        existingChat.otherUser = {
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          lastSeen: user.lastSeen || null,
        };
        setActiveChat(existingChat);
        setShowLeftBar(false);
        // setIsActiveChat(true);
      } else {
        const chatId = [currentUser.userId, user.userId].sort().join("_");

        const newChatRef = doc(chatsRef, chatId);

        const newChatData = {
          participants: [currentUser.userId, user.userId],
          createdAt: Timestamp.now(),
          lastMessage: "",
          lastMessageTime: Timestamp.now(),
          unread: {},
        };

        await setDoc(newChatRef, newChatData);

        const newChat: ChatType = {
          ...newChatData,
          chatId: newChatRef.id,
          otherUser: {
            userId: user.userId,
            firstName: user.firstName,
            lastName: user.lastName,
            lastSeen: user.lastSeen || null,
          },
        };

        setActiveChat({ ...newChat, chatId: newChatRef.id });
        setShowLeftBar(false);
        // setIsActiveChat(true);
      }

      setSearchQuery("");
    } catch (err) {
      console.error("Error starting chat:", err);
    }
  };

  const setNewChat = (chat: ChatType) => {
    {
      setActiveChat(chat);
      setShowLeftBar(false);
      // setIsActiveChat(true);
    }
  };

  return (
    <>
      <div
        className={`transition-all duration-500 rounded-3xl flex w-full h-svh px-6 md:pr-0`}
      >
        {isLoading ? (
          <ChatLeftShimmer />
        ) : (
          <div
            className={`transition-all duration-500  md:w-[35%] relative pt-6 ${
              activeChat?.otherUser && !showLeftBar ? "w-4" : "w-full mb-20"
            }`}
          >
            <div
              // onClick={() => {
              //   setShowLeftBar((pre) => {
              //     if (pre) {
              //       setIsActiveChat(false);
              //     }
              //     return !pre;
              //   });
              // }}
              onClick={() => setShowLeftBar(true)}
              className={`md:hidden ${
                (activeChat?.otherUser && !showLeftBar) ||
                (!activeChat?.otherUser && !showLeftBar)
                  ? ""
                  : "hidden md:hidden"
              }`}
            >
              <MenuIcon />
            </div>
            <div
              className={` md:block ${
                activeChat?.otherUser && !showLeftBar ? "hidden" : "block"
              } transition-all duration-500`}
            >
              <Input
                name="search"
                Icon={Search}
                placeholder="Search friends or find new onces"
                className="mb-4"
                ref={searchRef}
                iconLeft
                OnChange={(e) => setSearchQuery(e.target.value)}
                value={searchQuery}
              />
              {searchQuery.trim() !== "" && (
                <ul className="absolute bg-primary border-[1px] border-solid border-borderPrimary w-full rounded-lg p-3 pb-1">
                  {result.length > 0 ? (
                    result.map((item) => (
                      <li
                        key={item.id}
                        className="bg-secondary rounded-lg p-3 cursor-pointer mb-2 flex justify-left items-center"
                        onClick={() => handleStartChat(item)}
                      >
                        {item.avatarBase64 ? (
                          <img
                            src={item.avatarBase64}
                            alt="user avatar"
                            className="w-9 h-9 rounded-[50%] object-cover "
                          />
                        ) : (
                          <UserIcon width="36px" height="36px" />
                        )}
                        <span className="ml-2">
                          {item.firstName + " " + item.lastName}
                        </span>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-muted">No users found.</li>
                  )}
                </ul>
              )}
              {chats.map((chat) => (
                <ChatItem
                  icon={chat.otherUser?.avatarBase64}
                  name={getFullName(chat)}
                  key={chat.chatId}
                  lastMessage={chat.lastMessage}
                  lastMessageTime={formatLastMessageTime(chat.lastMessageTime)}
                  newMessageCount={getUreadMessageCount(
                    chat.unread,
                    userCtx?.getUser()?.userId
                  )}
                  isActive={activeChat?.chatId === chat.chatId}
                  onClick={() => setNewChat(chat)}
                  chat={chat}
                />
              ))}
            </div>
          </div>
        )}

        {activeChat?.otherUser && (
          <div
            className={`flex md:w-[65%] w-full max-h-svh flex-col border-l-[1px] border-l-solid border-l-borderPrimary ml-6 ${
              showLeftBar ? "hidden" : "block"
            }`}
          >
            <ChatBox
              friendId={activeChat.otherUser.userId}
              chatName={getFullName(activeChat)}
              lastSeen={formatLastMessageTime(activeChat.otherUser.lastSeen)}
              setShowDetails={setShowDetails}
              avatar={activeChat.otherUser.avatarBase64}
            />
          </div>
        )}
      </div>
      <Details
        showDetails={showDetails}
        setShowDetails={setShowDetails}
        activeChat={activeChat}
      />
    </>
  );
};

export default memo(Chat);
