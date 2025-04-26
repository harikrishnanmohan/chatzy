type ToggleProps = {
  onClick?: () => void;
  value?: boolean;
};

const Toggle = ({ onClick, value }: ToggleProps) => {
  const toggleTheme = () => {
    onClick && onClick();
  };

  return (
    <button
      onClick={toggleTheme}
      className="w-12 h-6 flex items-center bg-gray-300 dark:bg-gray-600 rounded-full p-1 transition-all duration-300"
    >
      <div
        className={`bg-white dark:bg-black w-4 h-4 rounded-full shadow-md transform transition-all duration-300 ${
          value ? "translate-x-6" : "translate-x-0"
        }`}
      />
    </button>
  );
};

export default Toggle;
