import React from "react";
// import { Accordion, IconAlertCircle } from "hds-react";
import { IconAlertCircle } from "hds-react";
import { useI18n } from "next-localization";
import ServicepointLandingSummaryContent from "./ServicepointLandingSummaryContent";
import { BackendEntranceSentence } from "../types/backendModels";
import { SummaryAccessibilityProps } from "../types/general";
import styles from "./SummaryAccessibility.module.scss";

// usage: used in details/landing page to create a summary block of sentences etc
// this component more like a container -> used with SummarySideNavigation
const SummaryAccessibility = ({ sentenceGroup, hasData }: SummaryAccessibilityProps): JSX.Element => {
  const i18n = useI18n();

  const getSentenceAccordions = () => {
    if (sentenceGroup) {
      return sentenceGroup
        .sort((a: BackendEntranceSentence, b: BackendEntranceSentence) => {
          return a.sentence_order_text.localeCompare(b.sentence_order_text);
        })
        .map((s) => {
          return (
            /*
            <Accordion key={`sentence_${s.sentence_id}`} className={styles.accordion} heading={s.sentence}>
              <div>TODO</div>
            </Accordion>
            */
            <div key={`sentence_${s.sentence_id}`} className={styles.sentence}>
              {s.sentence}
            </div>
          );
        });
    }
  };

  return (
    <div className={styles.maincontainer}>
      {hasData ? (
        <div>
          <h4>{sentenceGroup && sentenceGroup.length > 0 ? sentenceGroup[0].sentence_group_name : ""}</h4>

          {getSentenceAccordions()}
        </div>
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
  );
};

export default SummaryAccessibility;
