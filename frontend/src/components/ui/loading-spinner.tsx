import { ClockLoader } from "react-spinners";

import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  color?: string;
  label?: string;
  size?: number | string;
}

function LoadingSpinner({
  className,
  color = "currentColor",
  label = "Loading",
  size = 32,
}: LoadingSpinnerProps) {
  return (
    <span
      aria-label={label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center text-primary",
        className
      )}
      role="status"
    >
      <ClockLoader aria-hidden="true" color={color} size={size} />
    </span>
  );
}

interface LoadingStateProps extends LoadingSpinnerProps {
  containerClassName?: string;
}

function LoadingState({
  className,
  containerClassName,
  ...spinnerProps
}: LoadingStateProps) {
  return (
    <div className={cn("flex items-center justify-center", containerClassName)}>
      <LoadingSpinner className={className} {...spinnerProps} />
    </div>
  );
}

export { LoadingSpinner, LoadingState };
