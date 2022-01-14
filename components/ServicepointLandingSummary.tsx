import React from "react";
import { IconAlertCircle } from "hds-react";
import { useI18n } from "next-localization";
import router from "next/router";
import Button from "./QuestionButton";
import ServicepointLandingSummaryContent from "./ServicepointLandingSummaryContent";
import { AccessibilityData, ServicepointLandingSummaryProps } from "../types/general";
import styles from "./ServicepointLandingSummary.module.scss";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { setStartDate } from "../state/reducers/formSlice";
import { Servicepoint } from "../types/backendModels";
import { FRONT_URL_BASE } from "../types/constants";
import { getCurrentDate } from "../utils/utilFunctions";
import MainEntranceLocationPicturesPreview from "./MainEntranceLocationPicturesPreview";

// usage: used in details/landing page to create a summary block of sentences etc
// this component more like a container -> used with ServicepointLandingSummaryContent
const ServicepointLandingSummary = ({ header, data }: ServicepointLandingSummaryProps): JSX.Element => {
  const i18n = useI18n();
  const dispatch = useAppDispatch();
  const curEntranceId = useAppSelector((state) => state.formReducer.currentEntranceId);

  const handleEditorAddPointData = () => {
    if (data) {
      const startedAnswering = getCurrentDate();
      dispatch(setStartDate(startedAnswering));
      const url = `${FRONT_URL_BASE}accessibilityEdit/${curEntranceId}`;
      router.push(url);
    } else {
      // todo: todo (?)
      console.log("create servicepoint data clicked, todo create logic");
    }
  };

  // Add React components to these arrays.
  let contents: JSX.Element[] = [];
  const mainEntrance: JSX.Element[] = [];
  let hasData = false;

  // If the data is of type servicePointData
  if (data && "servicepoint_id" in data) {
    const servicepoint = data as Servicepoint;

    // Keys of accessibility data values
    const keysToDisplay = ["accessibility_phone", "accessibility_email", "accessibility_www"];
    hasData = keysToDisplay.some((e) => servicepoint[e] !== null);
    const itemList = keysToDisplay.map((key) => {
      let title = "";
      switch (key) {
        case "accessibility_phone":
          title = i18n.t("servicepoint.phoneNumber");
          break;
        case "accessibility_email":
          title = i18n.t("servicepoint.email");
          break;
        case "accessibility_www":
          title = i18n.t("servicepoint.www");
          break;
        default:
          console.log("Incorrect key");
      }
      return (
        <div key={key} className={styles.infocontainer}>
          <h4>{title}</h4>
          <p>{servicepoint[key] ? servicepoint[key] : i18n.t("servicepoint.noInfo")}</p>
        </div>
      );
    });
    contents.push(
      <ServicepointLandingSummaryContent>
        <div className={styles.contactInformation}>{itemList}</div>
      </ServicepointLandingSummaryContent>
    );
    // Else if the data is of type accessibilityData
  } else if (data) {
    const accessibilityData = data as AccessibilityData;
    hasData = accessibilityData !== undefined && accessibilityData.main !== undefined && accessibilityData.main.length !== 0;

    const keys = Object.keys(accessibilityData);
    keys.forEach((key) => {
      const itemList: JSX.Element[] = [];
      let currentTitle = "";
      if (accessibilityData[key]) {
        accessibilityData[key].forEach((x) => {
          if (x.sentence_group_name !== currentTitle) {
            currentTitle = x.sentence_group_name;
            // Add h3 titles in the container
            itemList.push(<h3 className={styles.sentenceGroupName}>{currentTitle}</h3>);
          }
          itemList.push(<li>{x.sentence}</li>);
        });
      }

      // Check if main entrance.
      if (key === "main") {
        mainEntrance.push(
          <>
            <ServicepointLandingSummaryContent contentHeader={i18n.t("common.mainEntranceLocation")}>
              <MainEntranceLocationPicturesPreview />
            </ServicepointLandingSummaryContent>
            <ServicepointLandingSummaryContent contentHeader={i18n.t("common.mainEntrance")}>
              <ul>{itemList}</ul>
            </ServicepointLandingSummaryContent>
          </>
        );
      } else {
        contents.push(
          <ServicepointLandingSummaryContent contentHeader={i18n.t("common.additionalEntrance")}>
            <ul>{itemList}</ul>
          </ServicepointLandingSummaryContent>
        );
      }
    });
  }

  // Make sure that the main entrance is listed before the side entrances.
  contents = mainEntrance.concat(contents);

  // If has no data buttons should say create servicepoint otherwise edit servicepoint
  const buttonText = !hasData ? i18n.t("servicepoint.buttons.createServicepoint") : i18n.t("servicepoint.buttons.editServicepoint");

  return (
    <div className={styles.maincontainer}>
      <div className={styles.headercontainer}>
        <h2> {header} </h2>
        <Button variant="primary" onClickHandler={handleEditorAddPointData}>
          {buttonText}
        </Button>
      </div>
      <div>
        {hasData ? (
          <>{contents}</>
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
