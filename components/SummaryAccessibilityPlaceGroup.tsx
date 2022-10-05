import React from "react";
import { useI18n } from "next-localization";
import SummaryAccessibilityPlace from "./SummaryAccessibilityPlace";
import CustomAccordion from "./common/CustomAccordion";
import { BackendEntrancePlace } from "../types/backendModels";
import { GroupedEntrancePlaceData, SummaryAccessibilityPlaceGroupProps } from "../types/general";
import styles from "./SummaryAccessibilityPlaceGroup.module.scss";

// usage: component for group of accessibility place location and picture, used in details page
const SummaryAccessibilityPlaceGroup = ({
  entranceKey,
  sentenceGroupKey,
  accessibilityPlaces,
  entrancePlaceData,
}: SummaryAccessibilityPlaceGroupProps): JSX.Element => {
  const i18n = useI18n();

  const getEntrancePlaceName = (entrancePlaceId: string) => {
    if (accessibilityPlaces) {
      const accessibilityPlace = accessibilityPlaces.find((place) => place.place_id === Number(entrancePlaceId));
      const { name } = accessibilityPlace ?? {};
      return name ?? i18n.t("additionalInfo.additionalInfo");
    }
    return i18n.t("additionalInfo.additionalInfo");
  };

  const getGroupedEntrancePlaceData = (entrancePlaces?: BackendEntrancePlace[]): GroupedEntrancePlaceData | undefined => {
    // Create grouped entrance place data with this structure:
    //   {
    //     sentence_group_id: {
    //       place_id: [
    //         (array of place boxes)
    //       ]
    //     }
    //   }
    if (entrancePlaces) {
      return entrancePlaces.reduce((acc: GroupedEntrancePlaceData, entrancePlace) => {
        const { sentence_group_id, place_id } = entrancePlace;
        if (sentence_group_id !== undefined) {
          return {
            ...acc,
            [sentence_group_id]: {
              ...acc[sentence_group_id],
              [place_id]:
                acc[sentence_group_id] && acc[sentence_group_id][place_id] ? [...acc[sentence_group_id][place_id], entrancePlace] : [entrancePlace],
            },
          };
        } else {
          return acc;
        }
      }, {});
    }
  };

  const groupedEntrancePlaceData = getGroupedEntrancePlaceData(entrancePlaceData ? entrancePlaceData[entranceKey] : undefined);
  const groupedPlaceData = groupedEntrancePlaceData ? groupedEntrancePlaceData[sentenceGroupKey] : undefined;

  return (
    <div className={styles.maincontainer}>
      {groupedPlaceData && (
        <CustomAccordion heading={i18n.t("servicepoint.picturesLocations")}>
          <>
            {Object.keys(groupedPlaceData).map((entrancePlaceId) => {
              const uniqueId = `${entranceKey}_${sentenceGroupKey}_${entrancePlaceId}`;

              return (
                <SummaryAccessibilityPlace
                  key={`entrance_sentence_group_place_${uniqueId}`}
                  entrancePlaceName={getEntrancePlaceName(entrancePlaceId)}
                  entrancePlaceData={groupedPlaceData[entrancePlaceId]}
                  uniqueId={uniqueId}
                />
              );
            })}
          </>
        </CustomAccordion>
      )}
    </div>
  );
};

export default SummaryAccessibilityPlaceGroup;
