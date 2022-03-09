import React from "react";
import { IconAlertCircle } from "hds-react";
import { useI18n } from "next-localization";
import ServicepointLandingSummaryContent from "./ServicepointLandingSummaryContent";
import ServicepointLandingSummaryModifyButton from "./ServicepointLandingSummaryModifyButton";
import { ServicepointLandingSummaryContactProps } from "../types/general";
import styles from "./ServicepointLandingSummaryContact.module.scss";

// usage: used in details/landing page for main contact information
const ServicepointLandingSummaryContact = ({ entranceData, hasData, hasModifyButton }: ServicepointLandingSummaryContactProps): JSX.Element => {
  const i18n = useI18n();
  const curLocale = i18n.locale();

  return (
    <div className={styles.maincontainer}>
      <div className={styles.headercontainer}>
        <h3>{i18n.t("servicepoint.contactInfoHeader")}</h3>
        {hasModifyButton && <ServicepointLandingSummaryModifyButton entranceData={entranceData} hasData={hasData} />}
      </div>

      <div>
        {hasData ? (
          <ServicepointLandingSummaryContent>
            <div className={styles.contactInformation}>
              <div className={styles.infocontainer}>
                <h4>{i18n.t("servicepoint.contactPerson")}</h4>
                <p>{entranceData?.[`contact_person_${curLocale}`] ?? i18n.t("servicepoint.noInfo")}</p>
              </div>
              <div className={styles.infocontainer}>
                <h4>{i18n.t("servicepoint.phoneNumber")}</h4>
                <p>{entranceData?.accessibility_phone ?? i18n.t("servicepoint.noInfo")}</p>
              </div>
              <div className={styles.infocontainer}>
                <h4>{i18n.t("servicepoint.email")}</h4>
                <p>{entranceData?.accessibility_email ?? i18n.t("servicepoint.noInfo")}</p>
              </div>
            </div>
          </ServicepointLandingSummaryContent>
        ) : (
          <div className={styles.nodatacontainer}>
            <ServicepointLandingSummaryContent>
              <span>
                <div>
                  <IconAlertCircle />
                </div>
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
