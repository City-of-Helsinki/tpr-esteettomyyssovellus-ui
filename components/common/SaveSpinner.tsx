import React from "react";
import { LoadingSpinner } from "hds-react";
import { SaveSpinnerProps } from "../../types/general";

// usage: general saving animation used with save buttons
function SaveSpinner({ savingText, savingFinishedText }: SaveSpinnerProps) {
  return (
    <LoadingSpinner
      loadingText={savingText}
      loadingFinishedText={savingFinishedText}
      small
      theme={{
        "--spinner-color": "var(--color-bus)",
      }}
    />
  );
}

export default SaveSpinner;
