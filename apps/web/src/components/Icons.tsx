import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function BaseIcon({ children, ...props }: IconProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return <BaseIcon {...props}><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></BaseIcon>;
}

export function CompareIcon(props: IconProps) {
  return <BaseIcon {...props}><path d="M7 18V9" /><path d="M12 18V5" /><path d="M17 18v-6" /></BaseIcon>;
}

export function PrepareIcon(props: IconProps) {
  return <BaseIcon {...props}><path d="M5 12h13" /><path d="m14 7 5 5-5 5" /></BaseIcon>;
}

export function MicrophoneIcon(props: IconProps) {
  return <BaseIcon {...props}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0" /><path d="M12 18v3" /></BaseIcon>;
}

export function AttachmentIcon(props: IconProps) {
  return <BaseIcon {...props}><path d="m20 11-8.5 8.5a5 5 0 0 1-7-7L14 3a3 3 0 0 1 4 4l-9 9a1 1 0 0 1-1.5-1.5L16 6" /></BaseIcon>;
}

export function CheckIcon(props: IconProps) {
  return <BaseIcon {...props}><path d="m5 12 4 4L19 6" /></BaseIcon>;
}

export function CloseIcon(props: IconProps) {
  return <BaseIcon {...props}><path d="m6 6 12 12" /><path d="m18 6-12 12" /></BaseIcon>;
}

export function ExternalIcon(props: IconProps) {
  return <BaseIcon {...props}><path d="M14 5h5v5" /><path d="m19 5-8 8" /><path d="M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" /></BaseIcon>;
}

export function MoonIcon(props: IconProps) {
  return <BaseIcon {...props}><path d="M20 15.5A8 8 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z" /></BaseIcon>;
}

export function SunIcon(props: IconProps) {
  return <BaseIcon {...props}><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></BaseIcon>;
}
