import { LoadingSpinner } from "hds-react";
import React from "react";

import styles from "./LoadSpinner.module.scss";

// usage: general loading animation used with nextjs router events
const LoadSpinner = (): JSX.Element => {
  return (
    <div className={styles.maincontainer}>
      <LoadingSpinner
        theme={{
          "--spinner-color": "var(--color-bus)",
        }}
      />
    </div>
  );
};

export default LoadSpinner;
