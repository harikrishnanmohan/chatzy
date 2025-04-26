import React from "react";

type InputProps = {
  placeholder?: string;
  Icon?: React.ElementType;
  name?: string;
  className?: string;
  ref?: React.Ref<HTMLInputElement>;
  type?: string;
  onEnter?: () => void;
  iconLeft?: boolean;
  onSubmit?: () => void;
  OnChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  label?: string;
};

const Input = ({
  placeholder,
  name,
  Icon,
  className,
  ref,
  type,
  onEnter,
  iconLeft,
  onSubmit,
  OnChange,
  value,
  label,
}: InputProps) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      onEnter && onEnter();
    }
  };
  return (
    <label
      htmlFor={name}
      className={`flex p-2 rounded-lg w-[100%]  border-[1px] border-solid border-borderPrimary relative ${className}`}
    >
      {
        <span className="absolute -top-2 px-2 bg-primary text-xs text-gray-400">
          {label}
        </span>
      }
      {iconLeft && <span onClick={onSubmit}>{Icon && <Icon />}</span>}
      <input
        type={type || "text"}
        placeholder={placeholder}
        name={name}
        className={`outline-none ml-2 text-sm w-[90%] bg-transparent ${
          label ? "p-1" : ""
        }`}
        ref={ref}
        onKeyDown={(e) => handleKeyDown(e)}
        value={value}
        onChange={OnChange}
      />
      {!iconLeft && (
        <span
          onClick={onSubmit}
          className={`${onSubmit ? "cursor-pointer" : ""}`}
        >
          {Icon && <Icon />}
        </span>
      )}
    </label>
  );
};

export default Input;
