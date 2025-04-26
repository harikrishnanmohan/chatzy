import { useEffect, useState } from "react";
import Avathar from "../atom/Avathar";

import CloseIcon from "../asset/CloseIcon";
// import nature from "../asset/nature.jpg";
import Button from "../atom/Button";
import { ChatType } from "../BuildEntry";
import { getFullName } from "../util";

type DetailsProps = {
  showDetails: boolean;
  setShowDetails: React.Dispatch<React.SetStateAction<boolean>>;
  activeChat: ChatType | null;
};

const Details = ({ showDetails, setShowDetails, activeChat }: DetailsProps) => {
  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  // const [expandMedia, setExpandMedia] = useState(false);

  useEffect(() => {
    let openTimer: NodeJS.Timeout;
    let closeTimer: NodeJS.Timeout;

    if (showDetails) {
      setShouldRender(true);
      openTimer = setTimeout(() => {
        setIsVisible(true);
      }, 10);
    } else {
      setIsVisible(false);
      closeTimer = setTimeout(() => setShouldRender(false), 500);
    }

    return () => {
      clearTimeout(openTimer);
      clearTimeout(closeTimer);
    };
  }, [showDetails]);

  if (!shouldRender) return null;

  return (
    <div
      className={`
        bg-[#121212] overflow-hidden transition-[width,opacity] duration-500 ease-in-out absolute md:relative h-full
        ${isVisible ? " w-full md:w-[40%] opacity-100" : "w-0 opacity-0"}
      `}
    >
      <div
        className={` flex flex-col justify-between items-start
          m-6 mt-7 transition-all duration-700 ease-in-out
          ${isVisible ? "opacity-100 max-h-[999px]" : "opacity-0 max-h-0"}
          overflow-hidden space-y-6 delay-300
        `}
      >
        <div className="flex justify-between w-full ">
          <h2 className="transition-opacity duration-700 delay-300">
            Chat Details
          </h2>
          <Button
            label="close"
            onlyIcon
            Icon={CloseIcon}
            onClick={() => setShowDetails((prev) => !prev)}
          />
        </div>
        <div className="w-full">
          <div className="bg-[#1f2329] w-full flex justify-center items-center rounded-lg p-4">
            <Avathar
              avatarBase64={activeChat?.otherUser?.avatarBase64}
              name={getFullName(activeChat)}
            />
          </div>
          <div className="mt-7 bg-[#1f2329] rounded-lg p-4 text-textSecondary">
            {activeChat?.otherUser?.about}
          </div>
        </div>
        {/* <div className="flex justify-between w-full">
          <div className="flex gap-1 items-end">
            <span>Media</span>
            <span className="text-gray-500 text-sm mb-[1px]">123</span>
          </div>
          <Button
            label={`${expandMedia ? "Show less" : "Show more"}`}
            className="text-gray-500"
            onClick={() => setExpandMedia((pre) => !pre)}
          />
        </div> */}
        {/* <div
          className={`flex gap-2 max-h-96 ${
            expandMedia ? "flex-wrap overflow-auto" : "overflow-x-auto"
          }`}
        >
          <img
            src={nature}
            alt="nature"
            className="w-[45%] object-contain rounded-md"
          />
          <img
            src={nature}
            alt="nature"
            className="w-[45%] object-contain rounded-md"
          />
          <img
            src={nature}
            alt="nature"
            className="w-[45%] object-contain rounded-md"
          />
          <img
            src={nature}
            alt="nature"
            className="w-[45%] object-contain rounded-md"
          />
          <img
            src={nature}
            alt="nature"
            className="w-[45%] object-contain rounded-md"
          />
          <img
            src={nature}
            alt="nature"
            className="w-[45%] object-contain rounded-md"
          />
          <img
            src={nature}
            alt="nature"
            className="w-[45%] object-contain rounded-md"
          />
          <img
            src={nature}
            alt="nature"
            className="w-[45%] object-contain rounded-md"
          />
          <img
            src={nature}
            alt="nature"
            className="w-[45%] object-contain rounded-md"
          />
          <img
            src={nature}
            alt="nature"
            className="w-[45%] object-contain rounded-md"
          />
          <img
            src={nature}
            alt="nature"
            className="w-[45%] object-contain rounded-md"
          />
          <img
            src={nature}
            alt="nature"
            className="w-[45%] object-contain rounded-md"
          />
          <img
            src={nature}
            alt="nature"
            className="w-[45%] object-contain rounded-md"
          />
        </div> */}
      </div>
    </div>
  );
};

export default Details;
