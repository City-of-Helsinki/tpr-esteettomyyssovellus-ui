import React from "react";
import { IconAlertCircle } from "hds-react";
import { useI18n } from "next-localization";
import router from "next/router";
import Button from "./QuestionButton";
import ServicepointLandingSummaryContent from "./ServicepointLandingSummaryContent";
import { ServicepointLandingSummaryAccessibilityProps } from "../types/general";
import styles from "./ServicepointLandingSummary.module.scss";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { setStartDate } from "../state/reducers/formSlice";
import { FRONT_URL_BASE } from "../types/constants";
import { getCurrentDate } from "../utils/utilFunctions";
import MainEntranceLocationPicturesPreview from "./MainEntranceLocationPicturesPreview";

// usage: used in details/landing page to create a summary block of sentences etc
// this component more like a container -> used with ServicepointLandingSummaryContent
const ServicepointLandingSummaryAccessibility = ({ header, data: accessibilityData }: ServicepointLandingSummaryAccessibilityProps): JSX.Element => {
  const i18n = useI18n();
  const dispatch = useAppDispatch();
  const curEntranceId = useAppSelector((state) => state.formReducer.currentEntranceId);

  const handleEditorAddPointData = () => {
    if (accessibilityData) {
      const startedAnswering = getCurrentDate();
      dispatch(setStartDate(startedAnswering));
      const url = `${FRONT_URL_BASE}accessibilityEdit/${curEntranceId}`;
      router.push(url);
    } else {
      // todo: todo (?)
      console.log("create servicepoint data clicked, todo create logic");
    }
  };

  const hasData = accessibilityData !== undefined && accessibilityData.main !== undefined && accessibilityData.main.length !== 0;
  const keys = Object.keys(accessibilityData);

  const getItemList = (key: string) => {
    const itemList: JSX.Element[] = [];
    let currentTitle = "";
    if (accessibilityData[key]) {
      accessibilityData[key].forEach((x) => {
        if (x.sentence_group_name !== currentTitle) {
          currentTitle = x.sentence_group_name;
          // Add h3 titles in the container
          itemList.push(
            <h3 key={`sentencetitle_${x.sentence_id}`} className={styles.sentenceGroupName}>
              {currentTitle}
            </h3>
          );
        }
        itemList.push(<li key={`sentence_${x.sentence_id}`}>{x.sentence}</li>);
      });
    }
    return itemList;
  };

  // Make sure that the main entrance is listed before the side entrances.
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
          <>
            <ServicepointLandingSummaryContent contentHeader={i18n.t("common.mainEntranceLocation")}>
              <MainEntranceLocationPicturesPreview />
            </ServicepointLandingSummaryContent>
            <ServicepointLandingSummaryContent contentHeader={i18n.t("common.mainEntrance")}>
              <ul>{getItemList("main")}</ul>
            </ServicepointLandingSummaryContent>

            {keys
              .filter((key) => key !== "main")
              .map((key) => (
                <ServicepointLandingSummaryContent key={key} contentHeader={i18n.t("common.additionalEntrance")}>
                  <ul>{getItemList(key)}</ul>
                </ServicepointLandingSummaryContent>
              ))}
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

export default ServicepointLandingSummaryAccessibility;
