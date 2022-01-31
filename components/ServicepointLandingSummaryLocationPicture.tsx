import React from "react";
import { useI18n } from "next-localization";
import styles from "./ServicepointLandingSummaryLocationPicture.module.scss";
import Map from "./common/Map";
import { ServicepointLandingSummaryLocationPictureProps } from "../types/general";
import { convertCoordinates } from "../utils/utilFunctions";

// usage: component for entrance location and picture, used in details page
const ServicepointLandingSummaryLocationPicture = ({ entranceKey, entranceData }: ServicepointLandingSummaryLocationPictureProps): JSX.Element => {
  const i18n = useI18n();
  // const coordinates = useAppSelector((state) => state.generalSlice.coordinatesWGS84) ?? [60.1, 24.9];
  const { loc_easting, loc_northing, photo_url } = entranceData || {};

  const entranceCoordinates: [number, number] = [loc_easting ?? 0, loc_northing ?? 0];

  // @ts-ignore : ignore types because .reverse() returns number[]
  const coordinates: [number, number] = convertCoordinates("EPSG:3067", "WGS84", entranceCoordinates).reverse();

  return (
    <div className={styles.maincontainer}>
      <div className={styles.mapcontainer}>
        <h4>{entranceKey === "main" ? i18n.t("servicepoint.mainEntranceLocationLabel") : i18n.t("servicepoint.entranceLocationLabel")}</h4>
        <div className={styles.map}>
          <Map initCenter={coordinates} initLocation={coordinates} initZoom={17} draggableMarker={false} questionId={-1} makeStatic />
          {/*coordinates && coordinates.length === 2 ? (
            <p>{`${i18n.t("servicepoint.mainEntranceLocationCoordinatesLabel")}: E ${coordinates[0].toFixed(2)}, N ${coordinates[1].toFixed(2)}`}</p>
          ) : null*/}
        </div>
      </div>

      <div className={styles.picturescontainer}>
        <h4>{entranceKey === "main" ? i18n.t("servicepoint.mainEntrancePicturesLabel") : i18n.t("servicepoint.entrancePicturesLabel")}</h4>
        <div className={styles.picture}>
          {photo_url && <img alt="" src={photo_url} />}

          {/* Placeholder photo for development */}
          {!photo_url && (
            <img
              alt=""
              src="https://images.unsplash.com/photo-1531989417401-0f85f7e673f8?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ServicepointLandingSummaryLocationPicture;
