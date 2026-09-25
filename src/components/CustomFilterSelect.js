"use client";

import { useEffect, useRef, useState } from "react";

export default function CustomFilterSelect({
  id,
  label,
  value,
  options,
  defaultValue = "all",
  onChange,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const optionRefs = useRef([]);
  const listboxId = `${id}-options`;
  const selectedIndex = Math.max(
    options.findIndex((option) => option.value === value),
    0,
  );
  const selectedOption = options[selectedIndex];
  const isActive = open || value !== defaultValue;

  useEffect(() => {
    function closeFromOutside(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    window.addEventListener("pointerdown", closeFromOutside);

    return () => window.removeEventListener("pointerdown", closeFromOutside);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      optionRefs.current[selectedIndex]?.focus();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [open, selectedIndex]);

  function closeAndFocusTrigger() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  function selectOption(nextValue) {
    onChange(nextValue);
    closeAndFocusTrigger();
  }

  function handleTriggerKeyDown(event) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
    }
  }

  function handleOptionKeyDown(event, index) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeAndFocusTrigger();
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      const nextIndex = (index + direction + options.length) % options.length;
      optionRefs.current[nextIndex]?.focus();
      return;
    }

    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      const nextIndex = event.key === "Home" ? 0 : options.length - 1;
      optionRefs.current[nextIndex]?.focus();
    }
  }

  return (
    <div
      ref={rootRef}
      data-gallery-filter-item
      className={`relative w-[clamp(10rem,15vw,13rem)] ${className}`}
    >
      <button
        ref={triggerRef}
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={handleTriggerKeyDown}
        className={`group relative flex h-16 w-full items-center justify-between gap-4 px-4 py-3 text-left text-black shadow-[0_10px_30px_rgba(0,0,0,0.14)] outline-none transition-[background-color,border-radius] duration-300 after:pointer-events-none after:absolute after:inset-1 after:border after:border-black after:transition-[border-radius] after:duration-300 hover:rounded-md hover:bg-[var(--main-highlight)] hover:after:rounded-sm focus-visible:rounded-md focus-visible:bg-[var(--main-highlight)] focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:after:rounded-sm ${
          isActive
            ? "rounded-md bg-[var(--main-highlight)] after:rounded-sm"
            : "rounded-xs bg-white after:rounded-xs"
        }`}
      >
        <span className="relative z-10 min-w-0">
          <span className="block text-[0.6rem] uppercase tracking-[0.16em] text-black/55">
            {label}
          </span>
          <span className="mt-0.5 block truncate text-sm font-medium">
            {selectedOption?.label}
          </span>
        </span>

        <svg
          aria-hidden="true"
          viewBox="0 0 12 8"
          fill="none"
          className={`relative z-10 size-3 shrink-0 transition-transform duration-300 ${
            open ? "rotate-180" : "rotate-0"
          }`}
        >
          <path
            d="m1 1 5 5 5-5"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div
        id={listboxId}
        role="listbox"
        data-lenis-prevent
        aria-labelledby={id}
        aria-hidden={!open}
        inert={!open}
        className={`absolute bottom-[calc(100%+0.5rem)] left-0 z-50 max-h-72 w-max min-w-full overflow-y-auto rounded-xs border border-black bg-white p-1 shadow-[0_16px_45px_rgba(0,0,0,0.2)] transition-[opacity,transform] duration-200 ${
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-2 opacity-0"
        }`}
      >
        {options.map((option, index) => {
          const selected = option.value === value;

          return (
            <button
              key={option.value}
              ref={(element) => {
                optionRefs.current[index] = element;
              }}
              type="button"
              role="option"
              aria-selected={selected}
              tabIndex={open ? 0 : -1}
              onClick={() => selectOption(option.value)}
              onKeyDown={(event) => handleOptionKeyDown(event, index)}
              className={`block w-full cursor-pointer rounded-xs px-3 py-2 text-left text-sm text-black outline-none transition-colors duration-200 hover:bg-[var(--main-highlight)] focus-visible:bg-[var(--main-highlight)] ${
                selected ? "bg-[var(--main-highlight)] font-medium" : "bg-white"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
