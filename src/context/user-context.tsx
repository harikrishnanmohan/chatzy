import { createContext, useState } from "react";
type User = {
  firstName: string;
  lastName: string;
  email: string;
  userId: string;
  avatarBase64?: string;
  about?: string;
};

type UserContextType = {
  user: User;
  updateUser: (newUser: User) => void;
  clearUser: () => void;
  getUser: () => {
    firstName: string;
    lastName: string;
    email: string;
    userId: string;
    avatarBase64?: string;
    about?: string;
  };
  isLoggedIn: () => boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    userId: "",
    avatarBase64: "",
    about: "",
  } as User);

  const updateUser = (newUser: User) => {
    setUser(newUser);
    sessionStorage.setItem("user", JSON.stringify(newUser));
  };
  const clearUser = () => {
    setUser({
      firstName: "",
      lastName: "",
      email: "",
      userId: "",
      avatarBase64: "",
      about: "",
    });
    sessionStorage.removeItem("user");
  };
  const getUser = () => {
    return user;
  };
  const isLoggedIn = () => {
    return user.email !== "";
  };

  return (
    <UserContext.Provider
      value={{ user, updateUser, clearUser, getUser, isLoggedIn }}
    >
      {children}
    </UserContext.Provider>
  );
};

export { UserProvider };
export default UserContext;
