import React from "react";
import { IconAlertCircle } from "hds-react";
import { useI18n } from "next-localization";
import ServicepointLandingSummaryContent from "./ServicepointLandingSummaryContent";
import ServicepointLandingSummaryModifyButton from "./ServicepointLandingSummaryModifyButton";
import { ServicepointLandingSummaryContactProps } from "../types/general";
import styles from "./ServicepointLandingSummaryContact.module.scss";

// usage: used in details/landing page to create a summary block of sentences etc
// this component more like a container -> used with ServicepointLandingSummaryContent
const ServicepointLandingSummaryContact = ({ servicepointData, entranceData, hasData }: ServicepointLandingSummaryContactProps): JSX.Element => {
  const i18n = useI18n();

  // Keys of accessibility data values
  const keysToDisplay = ["accessibility_phone", "accessibility_email", "accessibility_www"];

  const getTitle = (key: string) => {
    switch (key) {
      case "accessibility_phone":
        return i18n.t("servicepoint.phoneNumber");
      case "accessibility_email":
        return i18n.t("servicepoint.email");
      case "accessibility_www":
        return i18n.t("servicepoint.www");
      default:
        console.log("Incorrect key");
    }
  };

  return (
    <div className={styles.maincontainer}>
      <div className={styles.headercontainer}>
        <h3>{i18n.t("servicepoint.contactInfoHeader")}</h3>
        <ServicepointLandingSummaryModifyButton servicepointData={servicepointData} entranceData={entranceData} hasData={hasData} />
      </div>

      <div>
        {hasData ? (
          <ServicepointLandingSummaryContent>
            <div className={styles.contactInformation}>
              {keysToDisplay.map((key) => (
                <div key={key} className={styles.infocontainer}>
                  <h4>{getTitle(key)}</h4>
                  <p>{servicepointData[key] ? servicepointData[key] : i18n.t("servicepoint.noInfo")}</p>
                </div>
              ))}
            </div>
          </ServicepointLandingSummaryContent>
        ) : (
          <div className={styles.nodatacontainer}>
            <ServicepointLandingSummaryContent>
              <span>
                <IconAlertCircle />
                <p>{i18n.t("servicepoint.noDataContactinfo")}</p>
              </span>
            </ServicepointLandingSummaryContent>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicepointLandingSummaryContact;
