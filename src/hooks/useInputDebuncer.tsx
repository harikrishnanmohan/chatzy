import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase";

const useInputDebouncer = (input: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(input);
  const [result, setResult] = useState<any[]>([]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(input);
    }, delay);

    return () => clearTimeout(handler);
  }, [input, delay]);

  useEffect(() => {
    const fetchUsers = async () => {
      const query = debouncedValue.trim().toLowerCase();
      if (!query) return setResult([]);

      try {
        const snapshot = await getDocs(collection(db, "users"));
        const users = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const currentUserId = auth.currentUser?.uid;

        const matches = users.filter((user: any) => {
          const matchesQuery =
            user.firstName?.toLowerCase().includes(query) ||
            user.lastName?.toLowerCase().includes(query) ||
            user.email?.toLowerCase().includes(query);

          const isNotCurrentUser = user.userId !== currentUserId;

          return matchesQuery && isNotCurrentUser;
        });

        setResult(matches);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        setResult([]);
      }
    };

    fetchUsers();
  }, [debouncedValue]);

  return result;
};

export default useInputDebouncer;
