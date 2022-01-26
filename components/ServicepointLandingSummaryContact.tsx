import React from "react";
import { IconAlertCircle } from "hds-react";
import { useI18n } from "next-localization";
import router from "next/router";
import Button from "./QuestionButton";
import ServicepointLandingSummaryContent from "./ServicepointLandingSummaryContent";
import { ServicepointLandingSummaryContactProps } from "../types/general";
import styles from "./ServicepointLandingSummary.module.scss";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { setStartDate } from "../state/reducers/formSlice";
import { FRONT_URL_BASE } from "../types/constants";
import { getCurrentDate } from "../utils/utilFunctions";

// usage: used in details/landing page to create a summary block of sentences etc
// this component more like a container -> used with ServicepointLandingSummaryContent
const ServicepointLandingSummaryContact = ({ header, data: servicepoint }: ServicepointLandingSummaryContactProps): JSX.Element => {
  const i18n = useI18n();
  const dispatch = useAppDispatch();
  const curEntranceId = useAppSelector((state) => state.formReducer.currentEntranceId);

  const handleEditorAddPointData = () => {
    if (servicepoint) {
      const startedAnswering = getCurrentDate();
      dispatch(setStartDate(startedAnswering));
      const url = `${FRONT_URL_BASE}accessibilityEdit/${curEntranceId}`;
      router.push(url);
    } else {
      // todo: todo (?)
      console.log("create servicepoint data clicked, todo create logic");
    }
  };

  // Keys of accessibility data values
  const keysToDisplay = ["accessibility_phone", "accessibility_email", "accessibility_www"];
  const hasData = keysToDisplay.some((e) => servicepoint[e] !== null);

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
        <h2>{header}</h2>
        <Button variant="primary" onClickHandler={handleEditorAddPointData}>
          {!hasData ? i18n.t("servicepoint.buttons.createServicepoint") : i18n.t("servicepoint.buttons.editServicepoint")}
        </Button>
      </div>
      <div>
        {hasData ? (
          <ServicepointLandingSummaryContent>
            <div className={styles.contactInformation}>
              {keysToDisplay.map((key) => (
                <div key={key} className={styles.infocontainer}>
                  <h4>{getTitle(key)}</h4>
                  <p>{servicepoint[key] ? servicepoint[key] : i18n.t("servicepoint.noInfo")}</p>
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
