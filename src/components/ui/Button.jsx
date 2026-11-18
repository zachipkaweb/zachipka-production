import Link from "next/link";

export default function Button({
  href,
  onClick,
  children = "докладніше",
  color = "gray",
  bg = "yellow",
  uppercase = false,
  className = "",
  center = false,
  type = "button",
  disabled = false,
  ...props
}) {
  const bgColors = {
    yellow: "bg-yellow",
    white: "bg-white",
    red: "bg-red",
    gray: "bg-gray",
  };

  const textColors = {
    gray: "text-gray",
    white: "text-white",
    red: "text-red",
    black: "text-black",
    yellow: "text-yellow",
  };

  const commonClassName = `
    ${disabled ? "opacity-50 cursor-default" : "group cursor-pointer"}
    relative
    overflow-hidden
    isolate
    ${bgColors[bg] || "bg-yellow"}
    ${textColors[color] || "text-gray"}
    px-4 py-2.5
    text-sm font-medium
    sm:px-5 sm:py-3 sm:text-base
    ${uppercase ? "uppercase" : ""}
    ${center ? "text-center" : ""}
    ${className}
  `;

  const innerContent = (
    <>
      {!disabled && (
        <span
          aria-hidden
          className="
            bg-red
            pointer-events-none
            absolute inset-0
            -z-10
            [clip-path:circle(0%_at_100%_100%)]
            group-hover:[clip-path:circle(150%_at_100%_100%)]
            transition-[clip-path]
            duration-500
            ease-[cubic-bezier(0.65,0,0.35,1)]
          "
        />
      )}

      <span className="relative z-10">{children}</span>

      {!disabled && (
        <span
          aria-hidden
          className="
            absolute inset-0
            z-10
            flex items-center justify-center
            text-white
            pointer-events-none
            [clip-path:circle(0%_at_100%_100%)]
            group-hover:[clip-path:circle(150%_at_100%_100%)]
            transition-[clip-path]
            duration-500
            ease-[cubic-bezier(0.65,0,0.35,1)]
            px-4 py-2.5 sm:px-5 sm:py-3
          "
        >
          {children}
        </span>
      )}
    </>
  );

  if (href && !disabled) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={commonClassName}
        {...props}
      >
        {innerContent}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={commonClassName}
      {...props}
    >
      {innerContent}
    </button>
  );
}