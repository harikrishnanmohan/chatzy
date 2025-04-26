import dayjs from "dayjs";
import { ref, onValue } from "firebase/database";
import {
  getStorage,
  ref as reff,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

import { getDatabase } from "firebase/database";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

type UserStatus = {
  state: "online" | "offline";
  lastChanged: number; // Timestamp
};

export const listenToUserStatus = (
  userId: string,
  callback: (status: UserStatus) => void
): (() => void) => {
  const db = getDatabase();
  const statusRef = ref(db, `/status/${userId}`);

  const unsubscribe = onValue(statusRef, (snapshot) => {
    const status = snapshot.val();
    if (status) {
      callback({
        state: status.state,
        lastChanged: status.lastChanged,
      });
    }
  });

  return () => unsubscribe();
};

export const formatLastMessageTime = (timestamp: any) => {
  const date = dayjs(
    new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1e6)
  );

  if (date?.isToday()) {
    return date.format("h:mm A");
  } else if (date?.isYesterday()) {
    return "Yesterday";
  } else {
    return date?.format("MMM D");
  }
};

export const formatLastSeen = (timestamp: any) => {
  if (!timestamp?.seconds) return "";

  const date = dayjs(
    new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000)
  );
  const now = dayjs();

  if (now.isSame(date, "day")) {
    return date.format("h:mm A");
  } else if (now.subtract(1, "day").isSame(date, "day")) {
    return "yesterday";
  } else {
    return date.format("MMM D");
  }
};

export const getFullName = (chat: any) => {
  return chat?.otherUser?.firstName + " " + chat?.otherUser?.lastName;
};

export const getUreadMessageCount = (
  unread: { [key: string]: number },
  userId: string | undefined
) => {
  if (userId === undefined) return 0;
  return Object.entries(unread).find(([key]) => key === userId)?.[1] || 0;
};

export const getChatId = (user1: string, user2: string) => {
  return [user1, user2].sort().join("_");
};

export const getSessionValue = (key: string) => {
  const value = sessionStorage.getItem(key);
  return value;
};

export const formatDateTime = (utcDate: Date) => {
  const formatted = dayjs
    .utc(utcDate)
    .tz("Asia/Kolkata")
    .format("DD MMMM YYYY [at] HH:mm:ss [UTC+5:30]");

  return formatted;
};

export const uploadImageToStorage = async (file: File, userId: string) => {
  const storage = getStorage();
  const imageRef = reff(
    storage,
    `chatImages/${userId}/${Date.now()}_${file.name}`
  );
  await uploadBytes(imageRef, file);
  return getDownloadURL(imageRef);
};
