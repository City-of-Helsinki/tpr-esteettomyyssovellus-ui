import React from "react";
import styles from "./SummaryContent.module.scss";
import { SummaryContentProps } from "../types/general";

// usage: used in details/landing page for content to ServicepointLandingSummary
const SummaryContent = ({ contentHeader, children }: SummaryContentProps): JSX.Element => {
  return (
    <div className={styles.maincontainer}>
      <h2 className={styles.header}>{contentHeader}</h2>
      <div className={styles.container}>{children}</div>
    </div>
  );
};

export default SummaryContent;
