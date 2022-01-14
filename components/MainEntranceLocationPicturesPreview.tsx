import React from "react";
import { useI18n } from "next-localization";
import styles from "./MainEntranceLocationPicturesPreview.module.scss";
import Map from "./common/Map";
import { useAppSelector } from "../state/hooks";

// usage: component for main location and pictures, used in details and preview pages
// notes: todo: some parts might stille be placeholders e.g. pictures
const MainEntranceLocationPicturesPreview = (): JSX.Element => {
  const i18n = useI18n();
  const coordinates = useAppSelector((state) => state.generalSlice.coordinatesWGS84) ?? [60.1, 24.9];
  return (
    <div className={styles.maincontainer}>
      <div className={styles.mapcontainer}>
        <h4>{i18n.t("servicepoint.mainEntranceLocationLabel")}</h4>
        <div className={styles.map}>
          <Map initCenter={coordinates} initLocation={coordinates} initZoom={17} draggableMarker={false} questionId={-1} makeStatic isPreview />
          {coordinates && coordinates.length === 2 ? (
            <p>{`${i18n.t("servicepoint.mainEntranceLocationCoordinatesLabel")}: E ${coordinates[0].toFixed(2)}, N ${coordinates[1].toFixed(2)}`}</p>
          ) : null}
        </div>
      </div>
      <div className={styles.picturescontainer}>
        <h4>{i18n.t("servicepoint.mainEntrancePicturesLabel")}</h4>
        <div className={styles.pictures}>
          <div
            className={styles.picture}
            style={{
              backgroundImage:
                `url(` +
                `https://images.unsplash.com/photo-1531989417401-0f85f7e673f8?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80}` +
                `)`,
            }}
          />
          <div
            className={styles.picture}
            style={{
              backgroundImage:
                `url(` +
                `https://images.unsplash.com/photo-1531989417401-0f85f7e673f8?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80}` +
                `)`,
            }}
          />
          <div
            className={styles.picture}
            style={{
              backgroundImage:
                `url(` +
                `https://images.unsplash.com/photo-1531989417401-0f85f7e673f8?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80}` +
                `)`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default MainEntranceLocationPicturesPreview;
