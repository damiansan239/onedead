import React from "react";

const Button = ({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}): React.ReactElement => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative w-full h-full select-none rounded-2xl px-2 py-2 text-center text-3xl font-extrabold tracking-wide
        transition-all duration-150 ease-out flex justify-center items-center
        focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2
        active:translate-y-0.75 active:shadow-[0_1px_0_rgba(0,0,0,0.15),inset_0_1px_3px_rgba(0,0,0,0.15)]
        bg-linear-to-b from-white to-stone-100 text-stone-800 border border-stone-300
        shadow-[0_5px_0_#c8c4be,0_8px_16px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]
        hover:from-stone-50 hover:to-stone-200
      `}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
};

export default Button;
