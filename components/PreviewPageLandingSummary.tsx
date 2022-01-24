import React from "react";
import { IconAlertCircle } from "hds-react";
import { useI18n } from "next-localization";
import { PreviewPageLandingSummaryProps } from "../types/general";
import ServicepointLandingSummaryContent from "./ServicepointLandingSummaryContent";
import styles from "./PreviewPageLandingSummary.module.scss";

// usage: summarizing preview page data component e.g. created sentences (list)
const PreviewPageLandingSummary = ({ data }: PreviewPageLandingSummaryProps): JSX.Element => {
  const i18n = useI18n();

  // Add React components to these arrays.
  let contents: JSX.Element[] = [];
  const mainEntrance: JSX.Element[] = [];
  let hasData = false;

  if (data) {
    hasData = data !== undefined && data.main.length !== 0;

    const keys = Object.keys(data);
    keys.forEach((key) => {
      const itemList: JSX.Element[] = [];
      let currentTitle = "";
      if (data[key]) {
        data[key].forEach((x) => {
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
          <ServicepointLandingSummaryContent contentHeader={i18n.t("common.mainEntrance")}>
            <ul>{itemList}</ul>
          </ServicepointLandingSummaryContent>
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

  return (
    <div className={styles.maincontainer}>
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

export default PreviewPageLandingSummary;
