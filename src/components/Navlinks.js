import AuthNavLink from "./AuthNavLink";
import TransitionLink from "./transitions/TransitionLink";

const links = [
  { href: "/", label: "Home" },
  { href: "/gallery", label: "Gallery" },
  { href: "/billetterie", label: "Tickets" },
];

export default function Navlinks({ onNavigate, className = "" }) {
  return (
    <>
      {links.map((link) => (
        <TransitionLink
          key={link.href}
          href={link.href}
          onNavigate={onNavigate}
          data-menu-item
          className={className}
        >
          {link.label}
        </TransitionLink>
      ))}
      <AuthNavLink
        onNavigate={onNavigate}
        data-menu-item
        className={className}
      />
    </>
  );
}
