import React, { KeyboardEvent, MouseEvent, useState } from "react";
import { IconLocation, IconPersonWheelchair, IconPhoto, SideNavigation } from "hds-react";
import { useI18n } from "next-localization";
import SummaryAccessibility from "./SummaryAccessibility";
import SummaryAccessibilityPlace from "./SummaryAccessibilityPlace";
import SummaryLocationPicture from "./SummaryLocationPicture";
import { BackendEntrancePlace, BackendEntranceSentence } from "../types/backendModels";
import { AccessibilityData, EntrancePlaceData, SummarySideNavigationProps } from "../types/general";
import styles from "./SummarySideNavigation.module.scss";

// usage: used in details page to create a side menu for different entrance content
const SummarySideNavigation = ({
  entranceKey,
  entranceData,
  entrancePlaceData,
  servicepointData,
  accessibilityData,
  accessibilityPlaces,
  entranceChoiceData,
}: SummarySideNavigationProps): JSX.Element => {
  const i18n = useI18n();

  const locationPictureLevelId = `sideNavigationLocationPicture_${entranceKey}`;
  const [activeLevel, setActiveLevel] = useState<string>(locationPictureLevelId);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");

  const handleSideNavigationClick = (e: MouseEvent | KeyboardEvent, groupId?: string) => {
    e.preventDefault();
    setActiveLevel(e.currentTarget.id);
    setSelectedGroupId(groupId ?? "");
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

  const getEntrancePlaceName = (entrancePlaceId: string) => {
    if (accessibilityPlaces) {
      const accessibilityPlace = accessibilityPlaces.find((place) => place.place_id === Number(entrancePlaceId));
      const { name } = accessibilityPlace ?? {};
      return name ?? i18n.t("additionalInfo.additionalInfo");
    }
    return i18n.t("additionalInfo.additionalInfo");
  };

  const getGroupedEntrancePlaceData = (entrancePlaces?: BackendEntrancePlace[]): EntrancePlaceData | undefined => {
    if (entrancePlaces) {
      return entrancePlaces.reduce((acc: EntrancePlaceData, entrancePlace) => {
        const { place_id } = entrancePlace;
        return {
          ...acc,
          [place_id]: acc[place_id] ? [...acc[place_id], entrancePlace] : [entrancePlace],
        };
      }, {});
    }
  };

  const groupedEntrancePlaceData = getGroupedEntrancePlaceData(entrancePlaceData ? entrancePlaceData[entranceKey] : undefined);

  const getEntrancePlaceSubLevels = (groupedEntrancePlaces?: EntrancePlaceData) => {
    if (groupedEntrancePlaces) {
      return Object.keys(groupedEntrancePlaces).map((entrancePlaceId) => {
        const subLevelId = `sideNavigationAccessibilityPlace_${entranceKey}_${entrancePlaceId}`;

        return (
          <SideNavigation.SubLevel
            key={`entranceplace_${entrancePlaceId}`}
            id={subLevelId}
            active={activeLevel === subLevelId}
            label={getEntrancePlaceName(entrancePlaceId)}
            href=""
            onClick={(e) => handleSideNavigationClick(e, entrancePlaceId)}
          />
        );
      });
    }
  };

  const hasAccessibilityData = accessibilityData && accessibilityData[entranceKey] && accessibilityData[entranceKey].length > 0;

  return (
    <div className={styles.maincontainer}>
      <div className={styles.sidenavigation}>
        <SideNavigation id={`sideNavigation_${entranceKey}`} toggleButtonLabel={i18n.t("servicepoint.navigateToPage")} defaultOpenMainLevels={[]}>
          <SideNavigation.MainLevel
            id={locationPictureLevelId}
            active={activeLevel === locationPictureLevelId}
            label={entranceKey === "main" ? i18n.t("servicepoint.mainEntranceLocationLabel") : i18n.t("servicepoint.entranceLocationLabel")}
            icon={<IconLocation aria-hidden />}
            onClick={handleSideNavigationClick}
          />

          <SideNavigation.MainLevel
            id={`sideNavigationAccessibilityInfo_${entranceKey}`}
            label={i18n.t("servicepoint.contactFormSummaryHeader")}
            icon={<IconPersonWheelchair aria-hidden />}
          >
            {getSentenceGroupSubLevels(groupedAccessibilityData)}
          </SideNavigation.MainLevel>

          <SideNavigation.MainLevel
            id={`sideNavigationAccessibilityPlace_${entranceKey}`}
            label={i18n.t("servicepoint.picturesLocations")}
            icon={<IconPhoto aria-hidden />}
          >
            {getEntrancePlaceSubLevels(groupedEntrancePlaceData)}
          </SideNavigation.MainLevel>
        </SideNavigation>
      </div>

      <div className={styles.contentcontainer}>
        {activeLevel === locationPictureLevelId && (
          <SummaryLocationPicture entranceKey={entranceKey} entranceData={entranceData} servicepointData={servicepointData} />
        )}

        {activeLevel.indexOf("sideNavigationAccessibilityInfo") >= 0 && (
          <SummaryAccessibility
            entranceKey={entranceKey}
            sentenceGroupId={selectedGroupId}
            sentenceGroup={groupedAccessibilityData ? groupedAccessibilityData[selectedGroupId] : undefined}
            entranceChoiceData={entranceChoiceData}
            hasData={hasAccessibilityData}
          />
        )}

        {activeLevel.indexOf("sideNavigationAccessibilityPlace") >= 0 && (
          <SummaryAccessibilityPlace
            entrancePlaceName={getEntrancePlaceName(selectedGroupId)}
            entrancePlaceData={groupedEntrancePlaceData ? groupedEntrancePlaceData[selectedGroupId] : undefined}
          />
        )}
      </div>
    </div>
  );
};

export default SummarySideNavigation;
