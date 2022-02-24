import React from "react";
import { LoadingSpinner } from "hds-react";
import { SaveSpinnerProps } from "../../types/general";

// usage: general saving animation used with save buttons
const SaveSpinner = ({ savingText, savingFinishedText }: SaveSpinnerProps): JSX.Element => {
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
};

export default SaveSpinner;
