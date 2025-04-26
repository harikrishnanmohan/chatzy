import icon from "../asset/icon.svg";
import NavIcon from "../atom/NavIcon";
import ChatIcon from "../asset/ChatIcon";

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SettingsIcon from "../asset/SettingsIcon";

type SideBarProps = {
  isExpanded: boolean;
  setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  unReadMessageCount: number;
  className?: string;
};

const SideBar = ({
  isExpanded,
  setIsExpanded,
  unReadMessageCount,
  className,
}: SideBarProps) => {
  const [show, setShow] = useState(isExpanded);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isExpanded) {
      setShow(true);
      return;
    }
    const timer = setTimeout(() => {
      setShow(isExpanded);
    }, 250);

    return () => clearTimeout(timer);
  }, [isExpanded]);

  const onMouseOutFromNav = () => {
    setIsExpanded(false);
  };

  return (
    <div
      className={`border-t-[1px] md:border-r-[1px] md:border-t-0 border-solid border-r-borderPrimary transition-all duration-500 flex flex-row md:justify-center md:flex-col sm:sticky sm:bottom-0 fixed w-full justify-arround ${
        show ? "md:w-[200px]" : "md:w-[80px]"
      } ${className}`}
      onMouseOver={() => setIsExpanded(true)}
      onMouseOut={onMouseOutFromNav}
    >
      <div
        className=" h-[15%] p-5 cursor-pointer w-1/3 md:w-full mt-0 md:mt-1"
        onClick={() => navigate("/")}
      >
        <div className="flex items-center">
          <img
            src={icon}
            alt="chatzy"
            className="max-w-9 max-h-9 ml-6 md:ml-0"
          />
          <span
            className={`ml-3 text-lg whitespace-nowrap overflow-hidden transition-opacity duration-500 ease-in-out hidden md:block  ${
              show ? "opacity-100" : "opacity-0"
            }`}
            style={{
              visibility: show ? "visible" : "hidden",
            }}
          >
            Chatzy
          </span>
        </div>
      </div>
      <div className=" flex flex-row md:flex-col md:justify-between h-[85%] justify-around w-2/3 md:w-full">
        <div
          className={` cursor-pointer hover:bg-secondary transition-all duration-200 ${
            location.pathname === "/" ? "bg-secondary" : ""
          }`}
          onClick={() => navigate("/")}
        >
          <NavIcon
            Icon={ChatIcon}
            label="Inbox"
            isExpanded={show}
            count={unReadMessageCount}
          />
        </div>
        <div
          className={`cursor-pointer hover:bg-secondary transition-all duration-200 ${
            location.pathname === "/setting" ? "bg-secondary" : ""
          }
          `}
          onClick={() => navigate("/setting")}
        >
          <NavIcon Icon={SettingsIcon} label="Settings" isExpanded={show} />
        </div>
      </div>
    </div>
  );
};

export default SideBar;
