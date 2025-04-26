import React from "react";

type ButtonProps = {
  label?: string;
  onlyIcon?: boolean;
  Icon?: React.ElementType;
  icon?: string;
  onClick?: () => void;
  className?: string;
  iconClass?: string;
  children?: React.ReactNode;
};

const Button = ({
  label,
  onlyIcon,
  Icon,
  onClick,
  className,
  iconClass,
  icon,
  children,
}: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`${className} flex gap-2 items-center justify-center
    `}
    >
      {!onlyIcon && <span className="text-inherit">{label}</span>}
      {children}
      {Icon && <Icon />}
      {icon && <img src={icon} className={iconClass} />}
    </button>
  );
};

export default Button;
