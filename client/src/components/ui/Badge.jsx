// components/ui/Badge.jsx
import React from "react";

const Badge = ({
  children,
  variant = "info",
  size = "md",
  className = "",
  icon = null,
  ...props
}) => {
  const baseClasses = "inline-flex items-center font-medium rounded-full";

  const variants = {
    success: "badge-success",
    warning: "badge-warning",
    error: "badge-error",
    info: "badge-info",
    primary: "bg-brand/10 text-brand",
    secondary: "bg-gray-100 text-gray-800",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-0.5 text-xs",
    lg: "px-3 py-1 text-sm",
  };

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <span className={classes} {...props}>
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </span>
  );
};

export default Badge;
