import Avathar from "../atom/Avathar";

import Toggle from "../atom/Toggle";
import { useContext, useEffect, useState } from "react";
import ThemeContext from "../context/theme-context";
import UserContext from "../context/user-context";
import Input from "../atom/Input";
import Button from "../atom/Button";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const themeCtx = useContext(ThemeContext);
  const userCtx = useContext(UserContext);
  const user = userCtx?.getUser();
  const navigate = useNavigate();

  const [about, setAbout] = useState(user?.about);
  const onSetAbout = async () => {
    if (!user?.userId) return;

    try {
      const userRef = doc(db, "users", user.userId);
      await updateDoc(userRef, {
        about: about,
      });
      console.log("About updated successfully!");
    } catch (error) {
      console.error("Failed to update about:", error);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (user?.userId) {
        userCtx?.updateUser({
          ...user,
          about: about,
        });
        onSetAbout();
      }
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [about]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      userCtx?.clearUser();
      navigate("/chatzy/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="p-4 w-full flex justify-center items-center h-full self-center">
      <div className=" w-full md:w-1/2 border-[1px] border-slid border-borderPrimary  rounded-lg p-6">
        <div className="flex justify-center items-center w-full">
          <Avathar
            name={user?.firstName + " " + user?.lastName}
            isEditable
            avatarBase64={user?.avatarBase64}
            className="w-auto"
          />
        </div>
        <div>
          <div className="flex justify-between items-center mt-4 bg-secondary p-4 rounded-lg">
            <p>Theme</p>
            <Toggle
              onClick={themeCtx.toggleTheme}
              value={themeCtx.theme === "dark"}
            />
          </div>
          <div className="mt-8 ">
            <Input
              label="About"
              OnChange={(e) => setAbout(e.target.value)}
              value={about}
            />
          </div>
          <div className="mt-8 w-full flex justify-center">
            <Button
              onClick={handleLogout}
              label="Log out"
              className=" text-red-400  hover:bg-red-500 hover:text-white px-3 py-2 rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
