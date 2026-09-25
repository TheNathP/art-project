"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import AutoHeightAnimation from "@/app/animations/AutoHeightAnimation";
import RollingNumber from "./RollingNumber";

const TICKETS = [
  {
    id: "adult",
    name: "Adult admission",
    detail: "Standard rate",
    price: 24,
  },
  {
    id: "child",
    name: "Under-12 admission",
    detail: "Ages 5 to 11 inclusive",
    price: 12,
  },
  {
    id: "young",
    name: "Youth admission, ages 12–25",
    detail: "Proof of eligibility may be requested",
    price: 18,
  },
  {
    id: "job-seeker",
    name: "Job seeker admission",
    detail: "Proof of eligibility required",
    price: 18,
  },
  {
    id: "accessibility",
    name: "Accessible admission",
    detail: "Step-free access throughout the museum",
    price: 18,
  },
  {
    id: "senior",
    name: "Senior admission",
    detail: "Ages 65 and over",
    price: 18,
  },
  {
    id: "under-five",
    name: "Under 5",
    detail: "A free ticket is required",
    price: 0,
  },
  {
    id: "group",
    name: "Group rate",
    detail: "For groups of 10 or more",
    price: 15,
    minimum: 10,
  },
];

const PAID_OPTIONS = [
  {
    id: "audio-guide",
    name: "Audio guide",
    detail: "Commentary on a selection of major artworks",
    price: 2,
  },
  {
    id: "paper-guide",
    name: "Printed guide",
    detail: "A take-away guide to the museum",
    price: 4,
  },
];

const INITIAL_TICKET_QUANTITIES = Object.fromEntries(
  TICKETS.map((ticket) => [ticket.id, 0]),
);

const INITIAL_OPTION_QUANTITIES = Object.fromEntries(
  PAID_OPTIONS.map((option) => [option.id, 0]),
);

function formatPrice(price) {
  return price === 0 ? "Free" : `€${price}`;
}

function QuantityControl({ label, value, onDecrease, onIncrease }) {
  return (
    <fieldset className="flex w-fit items-center gap-3" aria-label={label}>
      <button
        type="button"
        onClick={onDecrease}
        disabled={value === 0}
        aria-label={`Remove: ${label}`}
        className="grid h-10 min-w-10 w-fit place-items-center rounded-xs border border-black bg-white text-lg text-black shadow-[0_6px_18px_rgba(0,0,0,0.12)] transition-[background-color,border-radius] duration-300 hover:rounded-md hover:bg-[var(--main-highlight)] disabled:cursor-not-allowed disabled:opacity-25 disabled:hover:rounded-xs disabled:hover:bg-white"
      >
        −
      </button>

      <RollingNumber
        value={value}
        minimumDigits={2}
        className="min-w-7 text-center font-mono text-sm tabular-nums"
      />

      <button
        type="button"
        onClick={onIncrease}
        aria-label={`Add: ${label}`}
        className="grid h-10 min-w-10 w-fit place-items-center rounded-xs border border-black bg-white text-lg text-black shadow-[0_6px_18px_rgba(0,0,0,0.12)] transition-[background-color,border-radius] duration-300 hover:rounded-md hover:bg-[var(--main-highlight)]"
      >
        +
      </button>
    </fieldset>
  );
}

export default function TicketingConfigurator() {
  const [ticketQuantities, setTicketQuantities] = useState(
    INITIAL_TICKET_QUANTITIES,
  );
  const [optionQuantities, setOptionQuantities] = useState(
    INITIAL_OPTION_QUANTITIES,
  );
  const [includeMap, setIncludeMap] = useState(false);
  const summaryViewportRef = useRef(null);
  const summaryContentRef = useRef(null);

  useLayoutEffect(() => {
    const animation = new AutoHeightAnimation({
      container: summaryViewportRef.current,
      content: summaryContentRef.current,
    });

    animation.mount();

    return () => animation.destroy();
  }, []);

  const selectedTickets = useMemo(
    () =>
      TICKETS.filter((ticket) => ticketQuantities[ticket.id] > 0).map(
        (ticket) => ({
          ...ticket,
          quantity: ticketQuantities[ticket.id],
        }),
      ),
    [ticketQuantities],
  );

  const selectedOptions = useMemo(
    () =>
      PAID_OPTIONS.filter((option) => optionQuantities[option.id] > 0).map(
        (option) => ({
          ...option,
          quantity: optionQuantities[option.id],
        }),
      ),
    [optionQuantities],
  );

  const visitorCount = selectedTickets.reduce(
    (total, ticket) => total + ticket.quantity,
    0,
  );
  const ticketTotal = selectedTickets.reduce(
    (total, ticket) => total + ticket.quantity * ticket.price,
    0,
  );
  const optionTotal = selectedOptions.reduce(
    (total, option) => total + option.quantity * option.price,
    0,
  );
  const total = ticketTotal + optionTotal;

  function updateTicket(ticket, direction) {
    setTicketQuantities((current) => {
      const currentQuantity = current[ticket.id];
      let nextQuantity = Math.max(0, currentQuantity + direction);

      if (ticket.minimum) {
        if (direction > 0 && currentQuantity === 0) {
          nextQuantity = ticket.minimum;
        } else if (direction < 0 && currentQuantity === ticket.minimum) {
          nextQuantity = 0;
        }
      }

      return {
        ...current,
        [ticket.id]: nextQuantity,
      };
    });
  }

  function updateOption(option, direction) {
    setOptionQuantities((current) => ({
      ...current,
      [option.id]: Math.max(0, current[option.id] + direction),
    }));
  }

  return (
    <section
      id="tickets"
      className="scroll-mt-8 bg-white px-4 py-20 text-black sm:px-8 lg:px-12 lg:py-32"
    >
      <div className="mx-auto max-w-[100rem]">
        <div className="grid gap-12 xl:grid-cols-[minmax(0,1fr)_minmax(21rem,27rem)] xl:items-start">
          <div className="space-y-24">
            <section aria-labelledby="ticket-types-title">
              <div className="mb-8 flex items-end justify-between gap-6">
                <div>
                  <p className="mb-3 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-black/50">
                    01 — Admission
                  </p>
                  <h2
                    id="ticket-types-title"
                    className="text-3xl font-medium uppercase tracking-[-0.045em] sm:text-5xl"
                  >
                    Build your group
                  </h2>
                </div>
                <p className="hidden max-w-52 text-right text-xs leading-5 text-neutral-600 md:block">
                  Add as many tickets as you need in each category.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {TICKETS.map((ticket, index) => (
                  <article
                    key={ticket.id}
                    className="relative isolate flex min-h-60 flex-col justify-between rounded-xs border border-black bg-white p-5 shadow-[0_14px_34px_rgba(0,0,0,0.12)] transition-[background-color,border-radius] duration-300 after:pointer-events-none after:absolute after:inset-1 after:rounded-xs after:border after:border-black after:transition-[border-radius] after:duration-300 hover:rounded-md hover:bg-[var(--main-highlight)] hover:after:rounded-sm sm:p-6"
                  >
                    <div className="relative z-10 flex items-start justify-between gap-5">
                      <span className="font-mono text-[0.65rem] tabular-nums text-neutral-500">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <p className="font-mono text-sm">
                        {formatPrice(ticket.price)}
                      </p>
                    </div>

                    <div className="relative z-10 my-8">
                      <h3 className="max-w-[18ch] text-2xl leading-none tracking-[-0.04em]">
                        {ticket.name}
                      </h3>
                      <p className="mt-2 text-xs text-neutral-500">
                        {ticket.detail}
                      </p>
                    </div>

                    <div className="relative z-10 w-fit">
                      <QuantityControl
                        label={ticket.name}
                        value={ticketQuantities[ticket.id]}
                        onDecrease={() => updateTicket(ticket, -1)}
                        onIncrease={() => updateTicket(ticket, 1)}
                      />
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section aria-labelledby="options-title">
              <div className="mb-8">
                <p className="mb-3 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-black/50">
                  02 — Options
                </p>
                <h2
                  id="options-title"
                  className="text-3xl font-medium uppercase tracking-[-0.045em] sm:text-5xl"
                >
                  Enhance your visit
                </h2>
              </div>

              <div className="grid gap-4">
                {PAID_OPTIONS.map((option) => (
                  <article
                    key={option.id}
                    className="grid gap-6 rounded-xs border border-black bg-white p-6 shadow-[0_10px_28px_rgba(0,0,0,0.1)] transition-[background-color,border-radius] duration-300 hover:rounded-md hover:bg-[var(--main-highlight)] sm:grid-cols-[1fr_auto_auto] sm:items-center"
                  >
                    <div>
                      <h3 className="text-xl tracking-[-0.03em]">
                        {option.name}
                      </h3>
                      <p className="mt-1 text-xs text-neutral-500">
                        {option.detail}
                      </p>
                    </div>
                    <p className="w-fit rounded-xs border border-black bg-white px-3 py-2 font-mono text-xs">
                      €{option.price} / person
                    </p>
                    <QuantityControl
                      label={option.name}
                      value={optionQuantities[option.id]}
                      onDecrease={() => updateOption(option, -1)}
                      onIncrease={() => updateOption(option, 1)}
                    />
                  </article>
                ))}

                <article className="grid gap-6 rounded-xs border border-black bg-white p-6 shadow-[0_10px_28px_rgba(0,0,0,0.1)] transition-[background-color,border-radius] duration-300 hover:rounded-md hover:bg-[var(--main-highlight)] sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <h3 className="text-xl tracking-[-0.03em]">Museum map</h3>
                    <p className="mt-1 text-xs text-neutral-500">
                      Free and available at reception on the day of your visit
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-pressed={includeMap}
                    onClick={() => setIncludeMap((current) => !current)}
                    className={`w-fit rounded-xs border border-black px-5 py-3 text-sm shadow-[0_6px_18px_rgba(0,0,0,0.12)] transition-[background-color,border-radius] duration-300 hover:rounded-md ${
                      includeMap
                        ? "bg-black text-white"
                        : "bg-white text-black hover:bg-[var(--main-highlight)]"
                    }`}
                  >
                    {includeMap ? "Map added ✓" : "Add for free"}
                  </button>
                </article>
              </div>
            </section>
          </div>

          <aside className="overflow-hidden rounded-xs border border-black bg-white text-black shadow-[0_18px_55px_rgba(0,0,0,0.18)] xl:sticky xl:top-44">
            <div className="flex items-center justify-between bg-black px-6 py-5 text-white">
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em]">
                Your selection
              </p>
              <span className="grid size-9 place-items-center rounded-xs bg-[var(--main-highlight)] font-mono text-xs text-black">
                <RollingNumber value={visitorCount} />
              </span>
            </div>

            <div
              ref={summaryViewportRef}
              className="min-h-64 overflow-hidden px-6 py-7"
            >
              <div ref={summaryContentRef}>
                {selectedTickets.length === 0 &&
                selectedOptions.length === 0 &&
                !includeMap ? (
                  <p className="max-w-64 text-2xl leading-tight tracking-[-0.04em] text-black/35">
                    Your visit starts taking shape here.
                  </p>
                ) : (
                  <div className="space-y-5">
                    {selectedTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="grid grid-cols-[1fr_auto] gap-5 text-sm"
                      >
                        <div>
                          <p>{ticket.name}</p>
                          <p className="mt-1 font-mono text-[0.65rem] text-black/45">
                            <RollingNumber value={ticket.quantity} /> ×{" "}
                            {formatPrice(ticket.price)}
                          </p>
                        </div>
                        {ticket.price === 0 ? (
                          <p className="font-mono">Free</p>
                        ) : (
                          <RollingNumber
                            value={ticket.quantity * ticket.price}
                            prefix="€"
                            className="font-mono"
                          />
                        )}
                      </div>
                    ))}

                    {selectedOptions.map((option) => (
                      <div
                        key={option.id}
                        className="grid grid-cols-[1fr_auto] gap-5 text-sm"
                      >
                        <div>
                          <p>{option.name}</p>
                          <p className="mt-1 font-mono text-[0.65rem] text-black/45">
                            <RollingNumber value={option.quantity} /> ×{" "}
                            {formatPrice(option.price)}
                          </p>
                        </div>
                        <RollingNumber
                          value={option.quantity * option.price}
                          prefix="€"
                          className="font-mono"
                        />
                      </div>
                    ))}

                    {includeMap && (
                      <div className="grid grid-cols-[1fr_auto] gap-5 text-sm">
                        <p>Museum map</p>
                        <p className="font-mono">Free</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-black bg-[var(--main-highlight)] p-6 text-black">
              <div className="flex items-end justify-between gap-6">
                <div>
                  <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em]">
                    Total
                  </p>
                  <p className="mt-1 text-xs text-black/55">Taxes included</p>
                </div>
                <RollingNumber
                  value={total}
                  prefix="€"
                  className="font-mono text-4xl tracking-[-0.06em] tabular-nums"
                />
              </div>

              <button
                type="button"
                disabled={visitorCount === 0}
                className="relative mt-8 w-fit rounded-xs border border-black bg-black px-6 py-4 text-sm text-white transition-[background-color,color,border-radius,transform] duration-300 after:pointer-events-none after:absolute after:inset-1 after:rounded-xs after:border after:border-white after:transition-[border-color,border-radius] after:duration-300 hover:-translate-y-0.5 hover:rounded-md hover:bg-white hover:text-black hover:after:rounded-sm hover:after:border-black disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:translate-y-0 disabled:hover:rounded-xs disabled:hover:bg-black disabled:hover:text-white disabled:hover:after:rounded-xs disabled:hover:after:border-white"
              >
                Complete booking ↗
              </button>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
