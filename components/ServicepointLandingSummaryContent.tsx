import React from "react";
import styles from "./ServicepointLandingSummaryContent.module.scss";
import { ServicepointLandingSummaryContentProps } from "../types/general";

// usage: used in details/landing page for content to ServicepointLandingSummary
const ServicepointLandingSummaryContent = ({
  contentHeader,
  children,
}: ServicepointLandingSummaryContentProps): JSX.Element => {
  return (
    <div className={styles.maincontainer}>
      <h2 className={styles.header}>{contentHeader}</h2>
      <div className={styles.container}>{children}</div>
    </div>
  );
};

export default ServicepointLandingSummaryContent;
