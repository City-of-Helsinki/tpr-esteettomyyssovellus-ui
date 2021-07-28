import React from "react";
import { IconAlertCircle } from "hds-react";
import { useI18n } from "next-localization";
import Button from "./QuestionButton";
import ServicepointLandingSummaryContent from "./ServicepointLandingSummaryContent";
import { ServicepointLandingSummaryProps } from "../types/general";
import styles from "./ServicepointLandingSummary.module.scss";
import router from "next/router";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { setStartDate } from "../state/reducers/formSlice";
import { FRONT_URL_BASE } from "../types/constants";
import { getCurrentDate } from "../utils/utilFunctions";

const ServicepointLandingSummary = ({
  header,
  data
}: ServicepointLandingSummaryProps): JSX.Element => {
  const i18n = useI18n();
  const dispatch = useAppDispatch();
  const curEntranceId = useAppSelector(
    (state) => state.formReducer.currentEntranceId
  );

  const handleEditorAddPointData = () => {
    if (data) {
      console.log("edit data clicked, todo create logic");
      const startedAnswering = getCurrentDate();
      dispatch(setStartDate(startedAnswering));
      const url = FRONT_URL_BASE + "accessibilityEdit/" + curEntranceId;
      // TODO: This preserves the state. Not necessary.
      router.push(url);
    } else {
      console.log("create servicepoint data clicked, todo create logic");
    }
  };

  // Add React components to these arrays.
  let contents: any = [];
  let mainEntrance: any = [];
  let hasData = false;

  // If the data is of type servicePointData
  if (data && "servicepoint_id" in data) {
    const keysToDisplay = ["accessibility_phone", "accessibility_email"];
    let itemList: any = [];
    hasData = keysToDisplay.some((e) => data[e] != null);
    keysToDisplay.map((key) => {
      let title = "";
      switch (key) {
        case "accessibility_phone":
          title = i18n.t("servicepoint.phoneNumber");
          break;
        case "accessibility_email":
          title = i18n.t("servicepoint.email");
          break;
        default:
          console.log("Incorrect key");
      }
      itemList.push(
        <div className={styles.infocontainer}>
          <h4>{title}</h4>
          <p>{data[key] ? data[key] : i18n.t("servicepoint.noInfo")}</p>
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
    hasData = data != undefined && data["main"].length != 0;

    let keys = Object.keys(data);
    keys.map((key) => {
      let itemList: any = [];
      let currentTitle = "";
      if (data[key]) {
        data[key].map((x: any) => {
          if (x.sentence_group_name != currentTitle) {
            currentTitle = x.sentence_group_name;
            // Add h3 titles in the container
            itemList.push(
              <h3 className={styles.sentenceGroupName}>{currentTitle}</h3>
            );
          }
          itemList.push(<li>{x.sentence}</li>);
        });
      }

      // Check if main entrance.
      if (key == "main") {
        mainEntrance.push(
          <ServicepointLandingSummaryContent
            contentHeader={i18n.t("common.mainEntrance")}
          >
            <ul>{itemList}</ul>
          </ServicepointLandingSummaryContent>
        );
      } else {
        contents.push(
          <ServicepointLandingSummaryContent
            contentHeader={i18n.t("common.additionalEntrance")}
          >
            <ul>{itemList}</ul>
          </ServicepointLandingSummaryContent>
        );
      }
    });
  }

  // Make sure that the main entrance is listed before the side entrances.
  contents = mainEntrance.concat(contents);

  // If has no data buttons should say create servicepoint otherwise edit servicepoint
  let buttonText = !hasData
    ? i18n.t("servicepoint.buttons.createServicepoint")
    : i18n.t("servicepoint.buttons.editServicepoint");

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
