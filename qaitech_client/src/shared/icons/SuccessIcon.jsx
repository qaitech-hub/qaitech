export function SuccessIcon({ size = 25 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
    >
      <g fill="none" stroke="#fff" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m7.393 12.084l2.593 2.593a.983.983 0 0 0 1.395 0l5.227-5.226"
        ></path>
        <rect width={18.5} height={18.5} x={2.75} y={2.75} rx={6}></rect>
      </g>
    </svg>
  );
}
