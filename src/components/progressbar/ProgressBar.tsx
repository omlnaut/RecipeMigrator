type ProgressBarProps = { p: number };

export function ProgressBar({ p }: ProgressBarProps) {
  return (
    <div className="progress-bar outer">
      <div className="progress-bar inner" style={{ width: `${p}%` }} />
      {p}
    </div>
  );
}
