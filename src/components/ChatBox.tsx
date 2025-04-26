// import SearchIcon from "../asset/SearchIcon";
import SideBarIcon from "../asset/SideBarIcon";
// import MoreIcon from "../asset/MoreIcon";
import Input from "../atom/Input";
import Message from "./MessageSent";

import { memo, useContext, useEffect, useRef, useState } from "react";
import {
  formatLastMessageTime,
  getChatId,
  listenToUserStatus,
  // uploadImageToStorage,
} from "../util";
import UserContext from "../context/user-context";
import {
  collection,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  DocumentSnapshot,
  onSnapshot,
  where,
  writeBatch,
  doc,
  getDoc,
} from "firebase/firestore";
import { query, startAfter } from "firebase/firestore";
import { DummyMessagesShimmer } from "./Shimmer/ChatBoxShimmer";
import UserIcon from "../asset/UserIcon";
import Senticon from "../asset/SentIcon";
// import AddIcon from "../asset/AddIcon";
import EmojiIcon from "../asset/EmojiIcon";

import EmojiPicker, { Theme } from "emoji-picker-react";
import ThemeContext from "../context/theme-context";

// import Modal from "../atom/Modal";
// import { createPortal } from "react-dom";
// import Button from "../atom/Button";
// import CloseIcon from "../asset/CloseIcon";

type ChatBoxProps = {
  chatName: string;
  lastSeen?: string;
  setShowDetails: React.Dispatch<React.SetStateAction<boolean>>;
  friendId: string | null;
  avatar?: string;
};

type MessageType = {
  id: string;
  text: string;
  senderId: string;
  timestamp: any;
  isRead: boolean;
  status: string;
};

const ChatBox = ({
  chatName,
  lastSeen,
  setShowDetails,
  friendId,
  avatar,
}: ChatBoxProps) => {
  const messageRef = useRef<HTMLInputElement>(null);

  const userCtx = useContext(UserContext);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [status, setStatus] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [allMessagesFit, setAllMessagesFit] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const emojiIconRef = useRef<HTMLDivElement>(null);
  // const [uploadeFile, setUploadFile] = useState<string | ArrayBuffer | null>(
  //   null
  // );
  const [selectedEmoji, setSelectedEmoji] = useState<string>("");
  // const [IsModalOpen, setIsModalOpen] = useState<boolean>(false);
  // const [imageCaption, setImageCaption] = useState("");

  const themeCtx = useContext(ThemeContext);

  // const inputFileRef = useRef<HTMLInputElement | null>(null);

  const userId = userCtx?.getUser()?.userId;
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        emojiIconRef.current &&
        !emojiPickerRef.current.contains(event.target as Node) &&
        !emojiIconRef.current.contains(event.target as Node)
      ) {
        setShowPicker((prev) => !prev);
      }
    };

    if (showPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPicker]);

  const onSentMessage = async () => {
    const message = messageRef.current?.value?.trim();

    if (!message || !friendId || !userId) return;

    const db = getFirestore();
    const chatId = getChatId(userId, friendId);
    const messagesRef = collection(db, `chats/${chatId}/messages`);
    const chatRef = doc(db, "chats", chatId);

    const newMessage = {
      text: message,
      senderId: userId,
      receiverId: friendId,
      timestamp: new Date(),
      isRead: false,
      status: "sent",
    };

    try {
      const batch = writeBatch(db);
      const newMessageRef = doc(messagesRef);
      batch.set(newMessageRef, newMessage);

      const chatSnap = await getDoc(chatRef);
      const unread = chatSnap.exists() ? chatSnap.data().unread || {} : {};

      const currentUnread = unread[friendId] || 0;
      const updatedUnread = {
        ...unread,
        [friendId]: currentUnread + 1,
        [userId]: 0,
      };

      batch.update(chatRef, {
        lastMessage: message,
        lastMessageTime: new Date(),
        unread: updatedUnread,
      });

      await batch.commit();
      messageRef.current!.value = "";
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const fetchMessages = async (initial = false) => {
    if (!friendId || !userId || (!initial && (!lastDoc || !hasMore))) return;

    if (initial) {
      setInitialLoading(true);
    } else {
      setLoading(true);
    }

    const db = getFirestore();
    const chatId = getChatId(userId, friendId);
    const messagesRef = collection(db, `chats/${chatId}/messages`);

    let q = query(messagesRef, orderBy("timestamp", "asc"), limit(50));
    if (!initial && lastDoc) {
      q = query(
        messagesRef,
        orderBy("timestamp", "asc"),
        startAfter(lastDoc),
        limit(50)
      );
    }

    const snapshot = await getDocs(q);
    const newMessages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as MessageType[];

    setMessages((prev) => (initial ? newMessages : [...newMessages, ...prev]));
    setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
    if (snapshot.size < 50) setHasMore(false);

    setTimeout(() => {
      const container = scrollContainerRef.current;
      if (container) {
        const isScrollable = container.scrollHeight > container.clientHeight;
        setAllMessagesFit(!isScrollable);
      }
    }, 0);

    if (initial) {
      setInitialLoading(false);
    } else {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async (
    chatId: string,
    friendId: string,
    userId: string
  ) => {
    const db = getFirestore();

    const messagesRef = collection(db, `chats/${chatId}/messages`);
    const q = query(
      messagesRef,
      where("senderId", "==", friendId),
      where("isRead", "==", false),
      orderBy("timestamp", "asc")
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) return;

    const batch = writeBatch(db);

    snapshot.forEach((docSnap) => {
      const msgRef = doc(db, `chats/${chatId}/messages/${docSnap.id}`);
      batch.update(msgRef, {
        isRead: true,
        status: "read",
      });
    });

    const chatDocRef = doc(db, "chats", chatId);
    batch.update(chatDocRef, {
      [`unread.${userId}`]: 0,
    });

    await batch.commit();
  };

  useEffect(() => {
    if (!friendId || !userId) return;
    fetchMessages(true);
  }, [friendId, userId]);

  useEffect(() => {
    if (!friendId || !userId) return;

    setMessages([]);
    setLastDoc(null);
    setHasMore(true);

    const chatId = getChatId(userId, friendId);

    const db = getFirestore();
    const messagesRef = collection(db, `chats/${chatId}/messages`);
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribeMessages = onSnapshot(q, async (snapshot) => {
      const liveMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as MessageType[];

      setMessages(liveMessages);

      markMessagesAsRead(chatId, friendId, userId);

      if (liveMessages.length > 0) {
        setInitialLoading(false);
      }
    });

    const unsubscribeStatus = listenToUserStatus(friendId, ({ state }) => {
      if (state === "online") {
        setStatus("online");
      } else {
        setStatus(lastSeen);
      }
    });

    return () => {
      unsubscribeMessages();
      if (typeof unsubscribeStatus === "function") unsubscribeStatus();
    };
  }, [friendId, userId]);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const onScroll = () => {
      if (scrollContainer.scrollTop < 100 && !loading && hasMore) {
        fetchMessages();
      }
    };

    scrollContainer.addEventListener("scroll", onScroll);
    return () => scrollContainer.removeEventListener("scroll", onScroll);
  }, [loading, hasMore, lastDoc]);

  type ShowDetailsHandlerEvent = React.MouseEvent<
    HTMLDivElement | HTMLSpanElement
  >;

  const showDetailsHandler = (e: ShowDetailsHandlerEvent) => {
    e.stopPropagation();
    setShowDetails((pre: boolean) => !pre);
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !messages.length) return;

    container.scrollTop = container.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (selectedEmoji) {
      messageRef.current!.value =
        messageRef.current?.value?.trim() + selectedEmoji;
      setSelectedEmoji("");
    }
  }, [selectedEmoji]);
  const handleEmojiClick = (emojiData: any) => {
    setSelectedEmoji(emojiData.emoji);
    setShowPicker(false);
    messageRef.current?.focus();
  };

  // const handleFileClick = () => {
  //   if (inputFileRef.current) {
  //     inputFileRef.current.value = "";
  //     inputFileRef.current?.click();
  //   }
  // };

  // const header = (
  //   <div className="self-end m-6 w-min">
  //     <Button
  //       onlyIcon
  //       Icon={() => <CloseIcon fillColor="#f4f5fa" />}
  //       onClick={() => {
  //         setIsModalOpen(false);
  //         setUploadFile(null);
  //       }}
  //     />
  //   </div>
  // );
  // const body = (
  //   <div className="flex justify-center items-center">
  //     {uploadeFile && (
  //       <img
  //         className="w-[50%]"
  //         src={
  //           typeof uploadeFile === "string"
  //             ? uploadeFile
  //             : URL.createObjectURL(new Blob([uploadeFile]))
  //         }
  //       />
  //     )}
  //   </div>
  // );

  // const footer = (
  //   <div className="flex items-center justify-center mb-6">
  //     <Input
  //       className=" text-white bg-[#191a1b] w-[30%]"
  //       OnChange={(e) => setImageCaption(e.target.value)}
  //     />
  //     <div className="cursor-pointer ml-3" onClick={onSendImage}>
  //       <Senticon fillColor="#f4f5fa" />
  //     </div>
  //   </div>
  // );

  return (
    <>
      <div className="p-5  flex justify-between items-center rounded-t-3xl border-b-[1px] border-solid border-b-borderPrimary">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={(e) => showDetailsHandler(e)}
        >
          <div>
            {avatar ? (
              <img
                src={avatar}
                alt="user avatar"
                className="w-10 h-10 rounded-[50%]"
              />
            ) : (
              <UserIcon width="40px" height="40px" />
            )}
          </div>
          <div className="flex flex-col">
            <span>{chatName}</span>
            <span className="text-xs mt-1 text-gray-500">{status}</span>
          </div>
        </div>
        <div className="flex gap-4 ">
          {/* <span className="cursor-pointer">
            <SearchIcon />
          </span> */}
          <span
            onClick={(e) => showDetailsHandler(e)}
            className="cursor-pointer"
          >
            <SideBarIcon />
          </span>
          {/* <span className="cursor-pointer">
            <MoreIcon />
          </span> */}
        </div>
      </div>
      <div
        className="p-5  flex flex-col gap-2 overflow-x-auto max-h-svh h-full"
        ref={scrollContainerRef}
      >
        {initialLoading && (!messages.length || !allMessagesFit) && (
          <DummyMessagesShimmer />
        )}
        {messages.map((msg) => (
          <Message
            key={msg.id}
            isSent={msg.senderId === userId}
            message={msg.text}
            time={formatLastMessageTime(msg.timestamp)}
            isRead={msg.isRead}
            status={msg.status}
          />
        ))}
      </div>
      <div className="p-5 flex justify-between pb-6  rounded-b-3xl items-center relative">
        {/* <div
          className="border-[1px] border-solid border-borderPrimary rounded-lg mr-2 p-2 cursor-pointer"
          onClick={handleFileClick}
        >
          <AddIcon />
        </div>
        <input
          ref={inputFileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            console.log(file);
            if (file) {
              const reader = new FileReader();
              reader.onload = () => {
                console.log(reader.result);
                setUploadFile(reader.result);
                setIsModalOpen(true);
              };
              reader.readAsDataURL(file);
            }
          }}
        /> */}
        <Input
          placeholder="Your message"
          ref={messageRef}
          onEnter={onSentMessage}
          Icon={Senticon}
          onSubmit={onSentMessage}
          className="justify-between"
        />
        <div
          className="border-[1px] border-solid border-borderPrimary rounded-lg ml-2 p-2 cursor-pointer"
          ref={emojiIconRef}
          onClick={() => setShowPicker((prev) => !prev)}
        >
          <EmojiIcon />
        </div>
        {showPicker && (
          <div className="absolute right-5 bottom-20 z-50" ref={emojiPickerRef}>
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              theme={themeCtx.theme === "dark" ? Theme.DARK : Theme.LIGHT}
            />
          </div>
        )}
      </div>
      {/* {uploadeFile &&
        IsModalOpen &&
        createPortal(
          <Modal header={header} body={body} footer={footer} />,
          document.getElementById("modal")!
        )} */}
    </>
  );
};

export default memo(ChatBox);
