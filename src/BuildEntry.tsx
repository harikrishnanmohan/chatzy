import SideBar from "./components/SideNav";
import Chat from "./components/Chat";

import { useContext, useEffect, useState } from "react";

import { useLocation, useNavigate } from "react-router-dom";
import UserContext from "./context/user-context";

import { useUserPresence } from "./hooks/useUserPresenceHook";

import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import { getSessionValue } from "./util";

import Settings from "./components/Settings";

export type ChatType = {
  chatId: string;
  lastMessage: string;
  lastMessageTime: any;
  otherUser?: {
    userId: string;
    firstName: string;
    lastName: string;
    lastSeen: any;
    avatarBase64?: string;
    about?: string;
  } | null;
  unread: Record<string, number>;
  participants: string[];
};

const BuildEntry = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [totalUnreadMessageCount, setTotalUnreadMessageCount] = useState(0);
  const [chats, setChats] = useState<ChatType[]>([]);
  const [isSctiveChat, setIsActiveChat] = useState<boolean>(false);

  const navigate = useNavigate();
  const location = useLocation();

  const userCtx = useContext(UserContext);

  if (userCtx?.getUser()) {
    useUserPresence(userCtx?.getUser().userId);
  }

  useEffect(() => {
    const storedUser = getSessionValue("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.email && user.firstName && user.lastName) {
          userCtx?.updateUser(user);
        }
      } catch (e) {
        console.error("Failed to parse user from sessionStorage", e);
      }
    }
  }, []);

  const getUserInfo = async (userId: string) => {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();

      return {
        userId,
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        lastSeen: userData.lastSeen || null,
        avatarBase64: userData.avatarBase64 || "",
        about: userData.about || "",
      };
    }
    return null;
  };

  useEffect(() => {
    if (!userCtx?.isLoggedIn()) {
      const storedUser = getSessionValue("user");
      if (!storedUser) {
        navigate("/login");
      }
    }

    const userId = userCtx?.getUser()?.userId;
    if (!userId) return;

    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", userId)
    );

    setIsLoading(true);
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchChatsWithUserData = async () => {
        const chatList = await Promise.all(
          querySnapshot.docs.map(async (doc) => {
            const chatData = doc.data();
            const otherUserId = chatData.participants.find(
              (id: string) => id !== userId
            );

            const otherUser = await getUserInfo(otherUserId);

            return {
              chatId: doc.id,
              lastMessageTime: chatData.lastMessageTime ?? null,
              otherUser,
              unread: chatData.unread ?? {},
              lastMessage: chatData.lastMessage || "",
              participants: chatData.participants || [],
              ...chatData,
            };
          })
        );

        const unreadMessagesCount = chatList.reduce((acc, chat) => {
          const unreadCount = chat?.otherUser?.userId
            ? chat.unread[userCtx.getUser().userId] || 0
            : 0;
          return acc + +unreadCount;
        }, 0);
        setTotalUnreadMessageCount(unreadMessagesCount);

        chatList.sort((a, b) => {
          const aTime = a.lastMessageTime?.toDate
            ? a.lastMessageTime.toDate().getTime()
            : new Date(a.lastMessageTime).getTime();
          const bTime = b.lastMessageTime?.toDate
            ? b.lastMessageTime.toDate().getTime()
            : new Date(b.lastMessageTime).getTime();
          return bTime - aTime;
        });
        setIsLoading(false);
        setChats(chatList);
      };

      fetchChatsWithUserData();
    });

    return () => {
      unsubscribe();
      setChats([]);
      setTotalUnreadMessageCount(0);
    };
  }, [userCtx?.user]);

  return (
    <div className="bg-primary text-textPrimary">
      <div className={`flex flex-col-reverse md:flex-row `}>
        <SideBar
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
          unReadMessageCount={totalUnreadMessageCount}
          className={`${isSctiveChat ? "hidden md:block" : ""}`}
        />
        <div className="flex justify-between min-h-svh w-full realative">
          {location.pathname === "/setting" ? (
            <Settings />
          ) : (
            <Chat
              setShowDetails={setShowDetails}
              chats={chats}
              isLoading={isLoading}
              showDetails={showDetails}
              setIsActiveChat={setIsActiveChat}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default BuildEntry;
