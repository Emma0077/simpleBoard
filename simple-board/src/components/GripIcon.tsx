interface GripIconProps {
  className?: string;
  size?: number;
}

export default function GripIcon({ className = "", size = 12 }: GripIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M8 6C8 6.55228 7.55228 7 7 7C6.44772 7 6 6.55228 6 6C6 5.44772 6.44772 5 7 5C7.55228 5 8 5.44772 8 6Z"
        fill="currentColor"
      />
      <path
        d="M8 12C8 12.5523 7.55228 13 7 13C6.44772 13 6 12.5523 6 12C6 11.4477 6.44772 11 7 11C7.55228 11 8 11.4477 8 12Z"
        fill="currentColor"
      />
      <path
        d="M8 18C8 18.5523 7.55228 19 7 19C6.44772 19 6 18.5523 6 18C6 17.4477 6.44772 17 7 17C7.55228 17 8 17.4477 8 18Z"
        fill="currentColor"
      />
      <path
        d="M14 6C14 6.55228 13.5523 7 13 7C12.4477 7 12 6.55228 12 6C12 5.44772 12.4477 5 13 5C13.5523 5 14 5.44772 14 6Z"
        fill="currentColor"
      />
      <path
        d="M14 12C14 12.5523 13.5523 13 13 13C12.4477 13 12 12.5523 12 12C12 11.4477 12.4477 11 13 11C13.5523 11 14 11.4477 14 12Z"
        fill="currentColor"
      />
      <path
        d="M14 18C14 18.5523 13.5523 19 13 19C12.4477 19 12 18.5523 12 18C12 17.4477 12.4477 17 13 17C13.5523 17 14 17.4477 14 18Z"
        fill="currentColor"
      />
      <path
        d="M20 6C20 6.55228 19.5523 7 19 7C18.4477 7 18 6.55228 18 6C18 5.44772 18.4477 5 19 5C19.5523 5 20 5.44772 20 6Z"
        fill="currentColor"
      />
      <path
        d="M20 12C20 12.5523 19.5523 13 19 13C18.4477 13 18 12.5523 18 12C18 11.4477 18.4477 11 19 11C19.5523 11 20 11.4477 20 12Z"
        fill="currentColor"
      />
      <path
        d="M20 18C20 18.5523 19.5523 19 19 19C18.4477 19 18 18.5523 18 18C18 17.4477 18.4477 17 19 17C19.5523 17 20 17.4477 20 18Z"
        fill="currentColor"
      />
    </svg>
  );
} 