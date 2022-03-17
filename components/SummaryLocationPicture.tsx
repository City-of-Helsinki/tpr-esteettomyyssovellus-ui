import React from "react";
import { useI18n } from "next-localization";
import styles from "./SummaryLocationPicture.module.scss";
import Map from "./common/Map";
import { SummaryLocationPictureProps } from "../types/general";
import { convertCoordinates, formatAddress } from "../utils/utilFunctions";

// usage: component for entrance location and picture, used in details page
const SummaryLocationPicture = ({ entranceKey, entranceData, servicepointData }: SummaryLocationPictureProps): JSX.Element => {
  const i18n = useI18n();
  const curLocale = i18n.locale();

  // const coordinates = useAppSelector((state) => state.generalSlice.coordinatesWGS84) ?? [60.1, 24.9];
  const { loc_easting, loc_northing, photo_url, photo_source_text, photo_text_fi, photo_text_sv, photo_text_en } = entranceData || {};

  const entranceCoordinates: [number, number] = [loc_easting ?? 0, loc_northing ?? 0];

  // @ts-ignore : ignore types because .reverse() returns number[]
  const coordinates: [number, number] =
    entranceCoordinates[0] > 0 && entranceCoordinates[1] > 0 ? convertCoordinates("EPSG:3067", "WGS84", entranceCoordinates).reverse() : [0, 0];

  const entranceName = entranceData && entranceData ? entranceData[`name_${curLocale}`] : "";
  const locationLabel =
    entranceKey === "main"
      ? formatAddress(servicepointData.address_street_name, servicepointData.address_no, servicepointData.address_city)
      : entranceName ?? "";

  const isDevelopment = false;

  return (
    <div className={styles.maincontainer}>
      <div className={styles.subcontainer}>
        <h4>{entranceKey === "main" ? i18n.t("servicepoint.mainEntranceLocationLabel") : i18n.t("servicepoint.entranceLocationLabel")}</h4>

        <div className={styles.mappicturecontainer}>
          <div className={styles.label}>
            <div>{locationLabel}</div>
          </div>

          <div className={styles.map}>
            <Map initLocation={coordinates} initZoom={17} draggableMarker={false} questionId={-1} makeStatic />
          </div>
        </div>
      </div>

      <div className={styles.subcontainer}>
        <h4>{entranceKey === "main" ? i18n.t("servicepoint.mainEntrancePicturesLabel") : i18n.t("servicepoint.entrancePicturesLabel")}</h4>

        <div className={styles.mappicturecontainer}>
          <div className={styles.label}>
            <div>{`FI: ${photo_text_fi ?? ""}`}</div>
            <div>{`SV: ${photo_text_sv ?? ""}`}</div>
            <div>{`EN: ${photo_text_en ?? ""}`}</div>
            <div>{`${i18n.t("servicepoint.photoSource")}: ${photo_source_text ?? ""}`}</div>
          </div>

          <div className={styles.picture}>
            {photo_url && (
              <img
                alt={entranceKey === "main" ? i18n.t("servicepoint.mainEntrancePicturesLabel") : i18n.t("servicepoint.entrancePicturesLabel")}
                src={photo_url}
              />
            )}

            {/* Placeholder photo for development */}
            {!photo_url && isDevelopment && (
              <img
                alt={entranceKey === "main" ? i18n.t("servicepoint.mainEntrancePicturesLabel") : i18n.t("servicepoint.entrancePicturesLabel")}
                src="https://images.unsplash.com/photo-1531989417401-0f85f7e673f8?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryLocationPicture;
