import React from "react";
import { IconAlertCircle } from "hds-react";
import { useI18n } from "next-localization";
import Button from "./QuestionButton";
import ServicepointLandingSummaryContent from "./ServicepointLandingSummaryContent";
import { ServicepointLandingSummaryProps } from "../types/general";
import styles from "./ServicepointLandingSummary.module.scss";

const ServicepointLandingSummary = ({ header, data }: ServicepointLandingSummaryProps): JSX.Element => {
  const i18n = useI18n();
  const handleEditorAddPointData = () => {
    if (data) {
      console.log("edit data clicked, todo create logic");
    } else {
      console.log("create servicepoint data clicked, todo create logic");
    }
  };
  const buttonText = data ? i18n.t("servicepoint.buttons.editServicepoint") : i18n.t("servicepoint.buttons.createServicepoint");
  return (
    <div className={styles.maincontainer}>
      <div className={styles.headercontainer}>
        <h2> {header} </h2>
        <Button variant="primary" onClickHandler={handleEditorAddPointData}>
          {buttonText}
        </Button>
      </div>
      <div>
        {/* TODO: Get header and children from data */}
        {data ? (
          <>
            <ServicepointLandingSummaryContent contentHeader="testi on dataa 1">
              {" "}
              <ul>
                <li>
                  <p>data 1</p>
                </li>
                <li>
                  <p>data 2</p>
                </li>
              </ul>{" "}
            </ServicepointLandingSummaryContent>
            <ServicepointLandingSummaryContent contentHeader="PH: Pääsisäänkäynnin sijainti">
              {" "}
              <ul>
                <li>
                  <p>data 1</p>
                </li>
                <li>
                  <p>data 2</p>
                </li>
              </ul>{" "}
            </ServicepointLandingSummaryContent>
            <ServicepointLandingSummaryContent contentHeader="PH: Pääsisäänkäynti">
              {" "}
              <ul>
                <li>
                  <p>data 1</p>
                </li>
                <li>
                  <p>data 2</p>
                </li>
              </ul>{" "}
            </ServicepointLandingSummaryContent>
            <ServicepointLandingSummaryContent contentHeader="PH: Sisätilat">
              {" "}
              <ul>
                <li>
                  <p>data 1</p>
                </li>
                <li>
                  <p>data 2</p>
                </li>
              </ul>{" "}
            </ServicepointLandingSummaryContent>
          </>
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

export default ServicepointLandingSummary;