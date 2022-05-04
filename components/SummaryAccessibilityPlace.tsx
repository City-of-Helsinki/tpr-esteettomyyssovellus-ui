import React from "react";
import { useI18n } from "next-localization";
import Map from "./common/Map";
import { MAP_MAX_ZOOM } from "../types/constants";
import { SummaryAccessibilityPlaceProps } from "../types/general";
import { convertCoordinates, isLocationValid } from "../utils/utilFunctions";
import styles from "./SummaryAccessibilityPlace.module.scss";

// usage: component for accessibility place location and picture, used in details page
const SummaryAccessibilityPlace = ({ entrancePlaceName, entrancePlaceData }: SummaryAccessibilityPlaceProps): JSX.Element => {
  const i18n = useI18n();

  return (
    <div className={styles.maincontainer}>
      <h4>{entrancePlaceName}</h4>

      {entrancePlaceData &&
        entrancePlaceData
          .sort((a, b) => (a.order_number ?? 1) - (b.order_number ?? 1))
          .map((entrancePlaceBox, index) => {
            const {
              order_number,
              loc_easting,
              loc_northing,
              location_text_fi,
              location_text_sv,
              location_text_en,
              photo_url,
              photo_source_text,
              photo_text_fi,
              photo_text_sv,
              photo_text_en,
            } = entrancePlaceBox;
            const key = `box_${index}`;

            const coordinatesEuref: [number, number] = [loc_easting ?? 0, loc_northing ?? 0];
            const coordinatesWGS84 = convertCoordinates("EPSG:3067", "WGS84", coordinatesEuref).reverse() as [number, number];

            return (
              <div key={key} className={styles.boxcontainer}>
                {photo_url && (
                  <div className={styles.subcontainer}>
                    <h5>{`${i18n.t("additionalInfo.pictureTitle")} ${order_number}`}</h5>

                    <div className={styles.mappicturecontainer}>
                      <div className={styles.label}>
                        <div>{`FI: ${photo_text_fi ?? ""}`}</div>
                        <div>{`SV: ${photo_text_sv ?? ""}`}</div>
                        <div>{`EN: ${photo_text_en ?? ""}`}</div>
                        <div>{`${i18n.t("servicepoint.photoSource")}: ${photo_source_text ?? ""}`}</div>
                      </div>

                      <div className={styles.picture}>
                        <img alt={photo_text_fi} src={photo_url} />
                      </div>
                    </div>
                  </div>
                )}

                {isLocationValid(coordinatesWGS84) && (
                  <div className={styles.subcontainer}>
                    <h5>{`${i18n.t("additionalInfo.locationTitle")} ${order_number}`}</h5>

                    <div className={styles.mappicturecontainer}>
                      <div className={styles.label}>
                        <div>{`FI: ${location_text_fi ?? ""}`}</div>
                        <div>{`SV: ${location_text_sv ?? ""}`}</div>
                        <div>{`EN: ${location_text_en ?? ""}`}</div>
                      </div>

                      <div className={styles.map}>
                        <Map curLocation={coordinatesWGS84} initZoom={MAP_MAX_ZOOM} draggableMarker={false} questionId={-1} makeStatic />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
    </div>
  );
};

export default SummaryAccessibilityPlace;
