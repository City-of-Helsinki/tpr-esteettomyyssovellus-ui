import React from "react";
import { IconAlertCircle } from "hds-react";
import { useI18n } from "next-localization";
import ServicepointLandingSummaryContent from "./ServicepointLandingSummaryContent";
import ServicepointLandingSummaryLocationPicture from "./ServicepointLandingSummaryLocationPicture";
import ServicepointLandingSummaryModifyButton from "./ServicepointLandingSummaryModifyButton";
import { ServicepointLandingSummaryAccessibilityProps } from "../types/general";
import styles from "./ServicepointLandingSummaryAccessibility.module.scss";

// usage: used in details/landing page to create a summary block of sentences etc
// this component more like a container -> used with ServicepointLandingSummaryContent
const ServicepointLandingSummaryAccessibility = ({
  entranceKey,
  entranceData,
  servicepointData,
  accessibilityData,
  hasData,
}: ServicepointLandingSummaryAccessibilityProps): JSX.Element => {
  const i18n = useI18n();
  const curLocale = i18n.locale();

  const entranceName = entranceData ? entranceData[`name_${curLocale}`] : "";
  const header =
    entranceKey === "main"
      ? `${i18n.t("common.mainEntrance")}: ${servicepointData.address_street_name} ${servicepointData.address_no}, ${servicepointData.address_city}`
      : `${i18n.t("common.entrance")}: ${entranceName}`;

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

  return (
    <div className={styles.maincontainer}>
      <div className={styles.headercontainer}>
        <h3>{header}</h3>
        {entranceKey !== "main" && <ServicepointLandingSummaryModifyButton entranceData={entranceData} hasData={hasData} />}
      </div>
      <div>
        {hasData ? (
          <>
            <ServicepointLandingSummaryContent>
              <ServicepointLandingSummaryLocationPicture entranceKey={entranceKey} entranceData={entranceData} />
            </ServicepointLandingSummaryContent>
            <ServicepointLandingSummaryContent key={entranceKey}>
              <ul>{getItemList(entranceKey)}</ul>
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

      <div>
        <ServicepointLandingSummaryModifyButton entranceData={entranceData} hasData={hasData} />
      </div>
    </div>
  );
};

export default ServicepointLandingSummaryAccessibility;
