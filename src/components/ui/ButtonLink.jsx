import Link from "next/link";

const textColors = {
  gray: "text-gray",
  white: "text-white",
  red: "text-red",
  yellow: "text-yellow",
  purple: "text-purple",
};

const arrowColors = {
  gray: "text-gray",
  white: "text-white",
  red: "text-red",
  yellow: "text-yellow",
  purple: "text-purple",
};

export default function ButtonLink({
  href = "/",
  children = "докладніше",
  color = "gray",
  arrow = "red",
}) {
  return (
    <Link
      href={href}
      className="group mt-2 flex w-fit flex-col uppercase font-semibold"
    >
      <span
        className={`group-hover:opacity-80 transition-all duration-300 ${textColors[color] ?? textColors.gray}`}
      >
        {children}
      </span>

      <span
        className={`relative mt-1 block h-0.5 w-full bg-current transition-all duration-300 group-hover:w-[calc(100%+20px)] ${arrowColors[arrow] ?? arrowColors.red}`}
      >
        <span
          className="
            absolute right-0 top-1/2
            h-3 w-3
            -translate-y-1/2
            rotate-45
            border-r-2 border-t-2
            border-current
            opacity-0
            transition-opacity duration-200
            group-hover:opacity-100
          "
        />
      </span>
    </Link>
  );
}
