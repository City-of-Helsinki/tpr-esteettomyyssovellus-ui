import React, { KeyboardEvent, MouseEvent, useState } from "react";
import { SideNavigation } from "hds-react";
import { useI18n } from "next-localization";
import SummaryAccessibility from "./SummaryAccessibility";
import SummaryLocationPicture from "./SummaryLocationPicture";
import { BackendEntranceSentence } from "../types/backendModels";
import { AccessibilityData, SummarySideNavigationProps } from "../types/general";
import styles from "./SummarySideNavigation.module.scss";

// usage: used in details page to create a side menu for different entrance content
const SummarySideNavigation = ({ entranceKey, entranceData, servicepointData, accessibilityData }: SummarySideNavigationProps): JSX.Element => {
  const i18n = useI18n();

  const locationPictureLevelId = `sideNavigationLocationPicture_${entranceKey}`;
  const [activeLevel, setActiveLevel] = useState<string>(locationPictureLevelId);
  const [selectedSentenceGroupId, setSelectedSentenceGroupId] = useState<string>("");

  const handleSideNavigationClick = (e: MouseEvent | KeyboardEvent, sentenceGroupId?: string) => {
    e.preventDefault();
    setActiveLevel(e.currentTarget.id);
    setSelectedSentenceGroupId(sentenceGroupId ?? "");
  };

  const getGroupedAccessibilityData = (sentences?: BackendEntranceSentence[]): AccessibilityData | undefined => {
    if (sentences) {
      return sentences.reduce((acc: AccessibilityData, sentence) => {
        const { sentence_group_id } = sentence;
        return {
          ...acc,
          [sentence_group_id]: acc[sentence_group_id] ? [...acc[sentence_group_id], sentence] : [sentence],
        };
      }, {});
    }
  };

  const groupedAccessibilityData = getGroupedAccessibilityData(accessibilityData ? accessibilityData[entranceKey] : undefined);

  const getSentenceGroupSubLevels = (groupedSentences?: AccessibilityData) => {
    if (groupedSentences) {
      return Object.keys(groupedSentences).map((sentenceGroupId) => {
        const group = groupedSentences[sentenceGroupId];
        const subLevelId = `sideNavigationAccessibilityInfo_${entranceKey}_${sentenceGroupId}`;

        return (
          <SideNavigation.SubLevel
            key={`sentencegroup_${sentenceGroupId}`}
            id={subLevelId}
            active={activeLevel === subLevelId}
            label={group[0].sentence_group_name}
            href=""
            onClick={(e) => handleSideNavigationClick(e, sentenceGroupId)}
          />
        );
      });
    }
  };

  const hasAccessibilityData = accessibilityData && accessibilityData[entranceKey] && accessibilityData[entranceKey].length > 0;

  return (
    <div className={styles.maincontainer}>
      <div className={styles.sidenavigation}>
        <SideNavigation id="sideNavigation" toggleButtonLabel={i18n.t("servicepoint.navigateToPage")} defaultOpenMainLevels={[]}>
          <SideNavigation.MainLevel
            id={locationPictureLevelId}
            active={activeLevel === locationPictureLevelId}
            label={entranceKey === "main" ? i18n.t("servicepoint.mainEntranceLocationLabel") : i18n.t("servicepoint.entranceLocationLabel")}
            onClick={handleSideNavigationClick}
          />

          <SideNavigation.MainLevel id={`sideNavigationAccessibilityInfo_${entranceKey}`} label={i18n.t("servicepoint.contactFormSummaryHeader")}>
            {getSentenceGroupSubLevels(groupedAccessibilityData)}
          </SideNavigation.MainLevel>

          <SideNavigation.MainLevel id={`sideNavigationAccessibilityPlace_${entranceKey}`} label={i18n.t("servicepoint.picturesLocations")}>
            <SideNavigation.SubLevel
              id={`sideNavigationAccessibilityPlace_${entranceKey}_1_TODO`}
              active={activeLevel === `sideNavigationAccessibilityPlace_${entranceKey}_1_TODO`}
              label="TODO"
              href=""
              onClick={handleSideNavigationClick}
            />
          </SideNavigation.MainLevel>
        </SideNavigation>
      </div>

      <div className={styles.contentcontainer}>
        {activeLevel === locationPictureLevelId && (
          <SummaryLocationPicture entranceKey={entranceKey} entranceData={entranceData} servicepointData={servicepointData} />
        )}

        {activeLevel.indexOf("sideNavigationAccessibilityInfo") >= 0 && (
          <SummaryAccessibility
            sentenceGroup={groupedAccessibilityData ? groupedAccessibilityData[selectedSentenceGroupId] : undefined}
            hasData={hasAccessibilityData}
          />
        )}
      </div>
    </div>
  );
};

export default SummarySideNavigation;
