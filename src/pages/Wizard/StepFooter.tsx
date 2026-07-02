import { Button } from "../../components/ui";

export function StepFooter({
  onPrev,
  onNext,
  nextLabel = "Prosegui",
  prevLabel = "Indietro",
  showPrev = true,
  nextDisabled = false,
}: {
  onPrev?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  prevLabel?: string;
  showPrev?: boolean;
  nextDisabled?: boolean;
}) {
  return (
    <div className="wizard__footer">
      {showPrev ? (
        <Button variant="base" onClick={onPrev}>
          {prevLabel}
        </Button>
      ) : (
        <span />
      )}
      {onNext && (
        <Button onClick={onNext} disabled={nextDisabled}>
          {nextLabel}
        </Button>
      )}
    </div>
  );
}
