import React from "react";
import { useI18n } from "next-localization";
import Map from "./common/Map";
import SkipMapButton from "./common/SkipMapButton";
import { useAppSelector } from "../state/hooks";
import { MAP_MAX_ZOOM } from "../types/constants";
import { SummaryLocationPictureProps } from "../types/general";
import { convertCoordinates, formatAddress, isLocationValid } from "../utils/utilFunctions";
import styles from "./SummaryLocationPicture.module.scss";

// usage: component for entrance location and picture, used in details page
const SummaryLocationPicture = ({
  entranceKey,
  entranceData,
  servicepointData,
  isMainEntrance,
  isMapDisplayed,
}: SummaryLocationPictureProps): JSX.Element => {
  const i18n = useI18n();
  const curLocale = i18n.locale();

  // const coordinates = useAppSelector((state) => state.generalSlice.coordinatesWGS84) ?? [60.1, 24.9];
  const servicepointCoordinatesWGS84 = useAppSelector((state) => state.generalSlice.coordinatesWGS84);

  const { loc_easting, loc_northing, photo_url, photo_source_text, photo_text_fi, photo_text_sv, photo_text_en } = entranceData || {};
  const coordinatesEuref = [loc_easting ?? 0, loc_northing ?? 0] as [number, number];
  const coordinatesWGS84 = convertCoordinates("EPSG:3067", "WGS84", coordinatesEuref).reverse() as [number, number];

  const entranceName = entranceData && entranceData[`name_${curLocale}`] ? entranceData[`name_${curLocale}`] : "";
  const locationLabel = isMainEntrance
    ? formatAddress(servicepointData.address_street_name, servicepointData.address_no, servicepointData.address_city)
    : entranceName ?? "";

  const photoTitle = isMainEntrance ? i18n.t("servicepoint.mainEntrancePicturesLabel") : i18n.t("servicepoint.entrancePicturesLabel");
  const altText = entranceData ? (entranceData[`photo_text_${curLocale}`] as string | undefined) : undefined;

  const isDevelopment = false;

  return isMapDisplayed || photo_url || isDevelopment ? (
    <div className={styles.maincontainer}>
      {isMapDisplayed && (
        <div className={styles.subcontainer}>
          <h4>{isMainEntrance ? i18n.t("servicepoint.mainEntranceLocationLabel") : i18n.t("servicepoint.entranceLocationLabel")}</h4>

          <div className={styles.mappicturecontainer}>
            <div className={styles.label}>
              <div>{locationLabel}</div>
              <SkipMapButton idToSkipTo={`#picturecontainer_${entranceKey}`} />
            </div>

            <div className={styles.map} aria-hidden>
              <Map
                curLocation={isLocationValid(coordinatesEuref) ? coordinatesWGS84 : servicepointCoordinatesWGS84}
                initZoom={MAP_MAX_ZOOM}
                draggableMarker={false}
                makeStatic
              />
            </div>
          </div>
        </div>
      )}

      {(photo_url || isDevelopment) && (
        <div id={`picturecontainer_${entranceKey}`} className={styles.subcontainer}>
          <h4>{photoTitle}</h4>

          <div className={styles.mappicturecontainer}>
            <div className={styles.label}>
              {photo_text_fi && <div>{`FI: ${photo_text_fi ?? ""}`}</div>}
              {photo_text_sv && <div>{`SV: ${photo_text_sv ?? ""}`}</div>}
              {photo_text_en && <div>{`EN: ${photo_text_en ?? ""}`}</div>}
              {photo_source_text && <div>{`${i18n.t("servicepoint.photoSource")}: ${photo_source_text ?? ""}`}</div>}
            </div>

            <div className={styles.picture}>
              {photo_url && <img alt={altText || photoTitle} src={photo_url} />}

              {/* Placeholder photo for development */}
              {!photo_url && isDevelopment && (
                <img
                  alt={photoTitle}
                  src="https://images.unsplash.com/photo-1531989417401-0f85f7e673f8?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  ) : (
    <></>
  );
};

export default SummaryLocationPicture;
