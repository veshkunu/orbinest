import { cn } from "../../lib/cn";
import { fullName, initials } from "../../lib/format";

// Soft backgrounds with dark text of the same hue — readable, never loud
const palettes = [
  "bg-[oklch(0.93_0.04_270)] text-[oklch(0.4_0.12_270)]",
  "bg-[oklch(0.93_0.045_155)] text-[oklch(0.38_0.09_155)]",
  "bg-[oklch(0.94_0.05_75)] text-[oklch(0.42_0.09_60)]",
  "bg-[oklch(0.93_0.04_20)] text-[oklch(0.42_0.13_20)]",
  "bg-[oklch(0.93_0.04_220)] text-[oklch(0.4_0.1_230)]",
  "bg-[oklch(0.93_0.04_320)] text-[oklch(0.4_0.12_320)]",
];

const sizes = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-16 text-xl",
};

function hash(text) {
  let h = 0;
  for (const char of text) h = (h * 31 + char.charCodeAt(0)) >>> 0;
  return h;
}

/** Decorative by default (a visible name is always nearby). Pass `label` when the avatar stands alone. */
export function Avatar({ person, size = "md", label, className }) {
  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn(
        "inline-grid shrink-0 place-items-center rounded-full font-semibold select-none",
        palettes[hash(person?.id ?? fullName(person)) % palettes.length],
        sizes[size],
        className,
      )}
    >
      <span aria-hidden="true">{initials(person)}</span>
    </span>
  );
}
