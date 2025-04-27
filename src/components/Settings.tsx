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
import CheckIcon from "../asset/CHeckIcon";
import { Message } from "../atom/Message";

const Settings = () => {
  const themeCtx = useContext(ThemeContext);
  const userCtx = useContext(UserContext);
  const user = userCtx?.getUser();
  const navigate = useNavigate();
  const [isEdited, setIsedited] = useState(false);
  const [message, setMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);

  const [about, setAbout] = useState(user?.about);

  useEffect(() => {
    if (user?.about) {
      setAbout(user.about);
    }
  }, [user?.about]);

  const onSetMessage = (value: boolean) => {
    setShowMessage(value);
    setTimeout(() => setShowMessage(!value), 5000);
  };

  const onSetAbout = async () => {
    if (!user?.userId) return;

    try {
      if (isEdited) {
        const userRef = doc(db, "users", user.userId);
        await updateDoc(userRef, {
          about: about,
        });
        console.log("About updated successfully!");
        setMessage("Success!");
        onSetMessage(true);
        setIsedited(false);
      }
    } catch (error) {
      console.error("Failed to update about:", error);
      setMessage("Something happened. Please tay again after sometime.");
      onSetMessage(true);
    }
  };

  const onSave = () => {
    if (user?.userId) {
      userCtx?.updateUser({
        ...user,
        about: about,
      });
      onSetAbout();
      setMessage("");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      userCtx?.clearUser();
      navigate("/chatzy/login");
    } catch (error) {
      console.error("Logout failed:", error);
      setMessage("Something happened. Please tay again after sometime.");
      onSetMessage(true);
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
          <div className="mt-8 flex justify-center">
            <Input
              label="About"
              OnChange={(e) => {
                setAbout(e.target.value);
                setIsedited(true);
              }}
              className="mr-2"
              value={about}
            />
            <Button
              Icon={CheckIcon}
              className={`${
                isEdited ? "" : "cursor-not-allowed"
              } border-[1px] border-solid border-borderPrimary rounded-lg px-2`}
              onClick={onSave}
              onlyIcon
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
      <Message
        message={message}
        show={showMessage}
        type={message === "Success!" ? "success" : "error"}
      />
    </div>
  );
};

export default Settings;
