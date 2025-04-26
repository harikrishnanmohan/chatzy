import { useEffect } from "react";
import {
  getDatabase,
  ref,
  onDisconnect,
  onValue,
  set,
} from "firebase/database";
import { formatDateTime } from "../util";

const useUserPresence = (userId: string) => {
  useEffect(() => {
    const db = getDatabase();
    const userStatusRef = ref(db, `status/${userId}`);
    const connectedRef = ref(db, ".info/connected");

    const unsubscribe = onValue(connectedRef, (snapshot) => {
      if (snapshot.val() === false) {
        return;
      }

      onDisconnect(userStatusRef)
        .set({
          state: "offline",
          lastSeen: formatDateTime(new Date()),
        })
        .then(() => {
          set(userStatusRef, {
            state: "online",
            lastSeen: formatDateTime(new Date()),
          });
        });
    });

    return () => unsubscribe();
  }, [userId]);
};

export { useUserPresence };
