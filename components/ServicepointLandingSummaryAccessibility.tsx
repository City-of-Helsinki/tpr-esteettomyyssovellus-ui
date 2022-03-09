import React from "react";
import { Accordion, IconAlertCircle } from "hds-react";
import { useI18n } from "next-localization";
import ServicepointLandingSummaryContent from "./ServicepointLandingSummaryContent";
import ServicepointLandingSummaryLocationPicture from "./ServicepointLandingSummaryLocationPicture";
import ServicepointLandingSummaryModifyButton from "./ServicepointLandingSummaryModifyButton";
import { StoredSentence } from "../types/backendModels";
import { ServicepointLandingSummaryAccessibilityProps } from "../types/general";
import { formatAddress } from "../utils/utilFunctions";
import styles from "./ServicepointLandingSummaryAccessibility.module.scss";

// usage: used in details/landing page to create a summary block of sentences etc
// this component more like a container -> used with ServicepointLandingSummaryContent
const ServicepointLandingSummaryAccessibility = ({
  entranceKey,
  entranceData,
  servicepointData,
  accessibilityData,
  hasData,
  hasModifyButton,
}: ServicepointLandingSummaryAccessibilityProps): JSX.Element => {
  const i18n = useI18n();
  const curLocale = i18n.locale();

  const entranceName = entranceData ? entranceData[`name_${curLocale}`] : "";
  const header =
    entranceKey === "main"
      ? `${i18n.t("common.mainEntrance")}: ${formatAddress(
          servicepointData.address_street_name,
          servicepointData.address_no,
          servicepointData.address_city
        )}`
      : `${i18n.t("common.entrance")}: ${entranceName ?? ""}`;

  interface SentenceGroup {
    [key: string]: StoredSentence[];
  }
  const getGroupedAccessibilityData = (): SentenceGroup | undefined => {
    if (accessibilityData[entranceKey]) {
      return accessibilityData[entranceKey].reduce((acc: SentenceGroup, sentence) => {
        const { sentence_group_id } = sentence;
        return {
          ...acc,
          [sentence_group_id]: acc[sentence_group_id] ? [...acc[sentence_group_id], sentence] : [sentence],
        };
      }, {});
    }
  };

  const getSentenceGroupAccordions = () => {
    const grouped = getGroupedAccessibilityData();
    if (grouped) {
      return Object.keys(grouped).map((sentenceGroupId) => {
        const group = grouped[sentenceGroupId];

        return (
          <Accordion
            key={`sentencegroup_${sentenceGroupId}`}
            className={styles.accordion}
            heading={group[0].sentence_group_name}
            card
            border
            initiallyOpen
          >
            <ul>
              {group.map((s) => {
                return <li key={`sentence_${s.sentence_id}`}>{s.sentence}</li>;
              })}
            </ul>
          </Accordion>
        );
      });
    }
  };

  return (
    <div className={styles.maincontainer}>
      <div className={styles.headercontainer}>
        <h3>{header}</h3>
        {entranceKey !== "main" && hasModifyButton && <ServicepointLandingSummaryModifyButton entranceData={entranceData} hasData={hasData} />}
      </div>
      <div>
        {hasData ? (
          <>
            <ServicepointLandingSummaryContent>
              <ServicepointLandingSummaryLocationPicture entranceKey={entranceKey} entranceData={entranceData} />
            </ServicepointLandingSummaryContent>

            {getSentenceGroupAccordions()}
          </>
        ) : (
          <div className={styles.nodatacontainer}>
            <ServicepointLandingSummaryContent>
              <span>
                <IconAlertCircle />
                <p>{i18n.t("servicepoint.noDataMainEntrance")}</p>
              </span>
            </ServicepointLandingSummaryContent>
          </div>
        )}
      </div>

      {hasModifyButton && (
        <div className={styles.footercontainer}>
          <ServicepointLandingSummaryModifyButton entranceData={entranceData} hasData={hasData} />
        </div>
      )}
    </div>
  );
};

export default ServicepointLandingSummaryAccessibility;
