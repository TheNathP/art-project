"use client";

import { useState } from "react";
import Nav from "./nav";

export default function Menu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-100 overflow-hidden rounded-sm border border-black">
      <div className="flex w-full items-center justify-between px-2 py-1">
        <p>LOGO</p>
        <p>Mon super menu</p>

        <button
          onClick={() => setOpen((current) => !current)}
          className={`
            grid size-8 place-items-center text-2xl
            transition-transform duration-1000
            ${open ? "rotate-45" : "rotate-0"}
          `}
        >
          +
        </button>
      </div>

      <nav
        className={`
          overflow-hidden
          transition-[max-height]
          duration-1000
          ${open ? "max-h-32" : "max-h-0"}
        `}
      >
        <div className={`
            flex w-full justify-center px-4 py-2
            transition-opacity duration-1000
            ${
              open
                ? "opacity-100"
                : "pointer-events-none opacity-0"
            }
          `}>

          </div>
      </nav>
    </div>
  );
}