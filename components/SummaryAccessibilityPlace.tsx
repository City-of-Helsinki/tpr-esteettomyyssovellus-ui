import React from "react";
import { useI18n } from "next-localization";
import Map from "./common/Map";
import SkipMapButton from "./common/SkipMapButton";
import { MAP_MAX_ZOOM } from "../types/constants";
import { SummaryAccessibilityPlaceProps } from "../types/general";
import { convertCoordinates, isLocationValid } from "../utils/utilFunctions";
import styles from "./SummaryAccessibilityPlace.module.scss";

// usage: component for accessibility place location and picture, used in details page
const SummaryAccessibilityPlace = ({ entrancePlaceName, entrancePlaceData, uniqueId }: SummaryAccessibilityPlaceProps): JSX.Element => {
  const i18n = useI18n();
  const curLocale = i18n.locale();

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

            const coordinatesEuref = [loc_easting ?? 0, loc_northing ?? 0] as [number, number];
            const coordinatesWGS84 = convertCoordinates("EPSG:3067", "WGS84", coordinatesEuref).reverse() as [number, number];

            const photoTitle = `${i18n.t("additionalInfo.pictureTitle")} ${order_number}`;
            const altText = entrancePlaceBox[`photo_text_${curLocale}`] as string | undefined;

            return (
              <div key={key} className={styles.boxcontainer}>
                {photo_url && (
                  <div className={styles.subcontainer}>
                    <h5>{photoTitle}</h5>

                    <div className={styles.mappicturecontainer}>
                      <div className={styles.label}>
                        {photo_text_fi && <div>{`FI: ${photo_text_fi ?? ""}`}</div>}
                        {photo_text_sv && <div>{`SV: ${photo_text_sv ?? ""}`}</div>}
                        {photo_text_en && <div>{`EN: ${photo_text_en ?? ""}`}</div>}
                        {photo_source_text && <div>{`${i18n.t("servicepoint.photoSource")}: ${photo_source_text ?? ""}`}</div>}
                      </div>

                      <div className={styles.picture}>
                        <img alt={altText ?? photoTitle} src={photo_url} />
                      </div>
                    </div>
                  </div>
                )}

                {isLocationValid(coordinatesWGS84) && (
                  <div className={styles.subcontainer}>
                    <h5>{`${i18n.t("additionalInfo.locationTitle")} ${order_number}`}</h5>

                    <div className={styles.mappicturecontainer}>
                      <div className={styles.label}>
                        {location_text_fi && <div>{`FI: ${location_text_fi ?? ""}`}</div>}
                        {location_text_sv && <div>{`SV: ${location_text_sv ?? ""}`}</div>}
                        {location_text_en && <div>{`EN: ${location_text_en ?? ""}`}</div>}
                        <SkipMapButton idToSkipTo={`#afterplacemap_${uniqueId}_${index}`} />
                      </div>

                      <div className={styles.map} aria-hidden>
                        <Map curLocation={coordinatesWGS84} initZoom={MAP_MAX_ZOOM} draggableMarker={false} makeStatic />

                        <div id={`afterplacemap_${uniqueId}_${index}`} />
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
