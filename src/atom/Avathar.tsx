import React, { useContext, useRef, useState } from "react";
import EditIcon from "../asset/EditIcon";
import UserIcon from "../asset/UserIcon";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import UserContext from "../context/user-context";
import { Message } from "./Message";

type AvatharProps = {
  name: string;
  avatarBase64?: string;
  isEditable?: boolean;
  className?: string;
};

const Avathar = ({
  name,
  avatarBase64,
  isEditable,
  className,
}: AvatharProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const userCtx = useContext(UserContext);
  const [avatar, setAvatar] = useState("");
  const [message, setMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);

  const handleEditClick = () => {
    fileInputRef.current?.click();
  };

  const onSetMessage = (value: boolean) => {
    setShowMessage(value);
    setTimeout(() => setShowMessage(!value), 5000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const user = userCtx?.getUser();
    if (!file || !user?.userId) return;

    const reader = new FileReader();

    reader.onload = async () => {
      const base64 = reader.result as string;
      setAvatar(base64);

      try {
        const userRef = doc(db, "users", user.userId);
        await updateDoc(userRef, {
          avatarBase64: base64,
        });
        console.log("Avatar base64 saved to Firestore!");
        setMessage("Success!");
        onSetMessage(true);
        userCtx?.updateUser({ ...user, avatarBase64: base64 });
      } catch (err) {
        console.error("Failed to save avatar:", err);
        if (
          err ===
          'FirebaseError: The value of property "avatarBase64" is longer than 1048487 bytes.'
        ) {
          setMessage("Please select a smaller size file <1MB.");
        } else {
          setMessage("Something happened. Please tay again after sometime.");
        }
        onSetMessage(true);
      }
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className={`flex flex-col items-center w-24 ${className}`}>
      <div className="w-20 h-20 rounded-full overflow-hidden border-gray-300 bg-secondary flex justify-center items-center relative">
        {avatarBase64 || avatar ? (
          <img
            src={avatarBase64 || avatar}
            alt="Avatar"
            className="object-cover w-full h-full"
          />
        ) : (
          <UserIcon width="60px" height="60px" />
        )}
        {isEditable && (
          <>
            <div
              className="absolute bottom-0 right-0 bg-primary rounded-full p-1 cursor-pointer"
              onClick={handleEditClick}
            >
              <EditIcon />
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
          </>
        )}
      </div>
      <span className="mt-2 text-sm text-center text-gray-400">{name}</span>
      <Message
        message={message}
        show={showMessage}
        type={message === "Success!" ? "success" : "error"}
      />
    </div>
  );
};

export default Avathar;
