// components/ui/Input.jsx
import React, { forwardRef } from "react";

const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      className = "",
      inputClassName = "",
      type = "text",
      required = false,
      disabled = false,
      placeholder,
      value,
      onChange,
      onBlur,
      onFocus,
      icon,
      rightIcon,
      ...props
    },
    ref
  ) => {
    const baseInputClasses = "input-field";
    const errorClasses = error ? "input-error" : "";
    const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";

    const inputClasses = `${baseInputClasses} ${errorClasses} ${disabledClasses} ${inputClassName}`;

    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">{icon}</span>
            </div>
          )}

          <input
            ref={ref}
            type={type}
            className={`${inputClasses} ${icon ? "pl-10" : ""} ${
              rightIcon ? "pr-10" : ""
            }`}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            onFocus={onFocus}
            disabled={disabled}
            required={required}
            {...props}
          />

          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {rightIcon}
            </div>
          )}
        </div>

        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
