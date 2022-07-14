import React from "react";
import { IconAlertCircle } from "hds-react";
import { useI18n } from "next-localization";
import SummaryContent from "./SummaryContent";
import SummaryModifyButton from "./SummaryModifyButton";
import { ServicepointLandingSummaryContactProps } from "../types/general";
import styles from "./SummaryContact.module.scss";

// usage: used in details/landing page for main contact information
const SummaryContact = ({ entranceData, hasData, hasModifyButton }: ServicepointLandingSummaryContactProps): JSX.Element => {
  const i18n = useI18n();
  const curLocale = i18n.locale();

  return (
    <div className={styles.maincontainer}>
      <div className={styles.headercontainer}>
        <h3>{i18n.t("servicepoint.contactInfoHeader")}</h3>
        {hasModifyButton && <SummaryModifyButton entranceData={entranceData} hasData={hasData} />}
      </div>

      <div>
        {hasData ? (
          <SummaryContent>
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
          </SummaryContent>
        ) : (
          <div className={styles.nodatacontainer}>
            <SummaryContent>
              <span>
                <div>
                  <IconAlertCircle />
                </div>
                <p>{i18n.t("servicepoint.noDataContactinfo")}</p>
              </span>
            </SummaryContent>
          </div>
        )}
      </div>
    </div>
  );
};

export default SummaryContact;
