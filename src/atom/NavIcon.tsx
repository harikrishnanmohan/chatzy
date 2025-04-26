type NavIconProps = {
  Icon: React.ElementType;
  label: string;
  isExpanded: boolean;
  count?: number;
  onClick?: () => void;
  fillColor?: string;
};

const NavIcon = ({
  Icon,
  label,
  isExpanded,
  count,
  onClick,
  fillColor,
}: NavIconProps) => {
  return (
    <button
      className={`flex transition-all duration-500 justify-center items-center overflow-hidden p-6 py-6 md:pl-6`}
      onClick={onClick}
    >
      <div className="relative">
        <Icon fillColor={fillColor} />
        {typeof count === "number" && count > 0 && (
          <span className="absolute -top-4 -right-4 rounded-full bg-primary w-6 text-center">
            {count}
          </span>
        )}
      </div>
      <span
        className={`text-lg font-normal whitespace-nowrap overflow-hidden transition-opacity duration-700 ease-in-out pl-2 hidden md:block  ${
          isExpanded ? "opacity-100" : "opacity-0"
        }`}
        style={{
          visibility: isExpanded ? "visible" : "hidden",
        }}
      >
        {label}
      </span>
    </button>
  );
};

export default NavIcon;
