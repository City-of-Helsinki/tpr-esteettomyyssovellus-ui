import React from "react";
import styles from "./MainEntranceLocationPicturesPreview.module.scss";
import Map from "./common/Map";
import { useAppSelector } from "../state/hooks";

const MainEntranceLocationPicturesPreview = (): JSX.Element => {
  const coordinates = useAppSelector(
    (state) => state.generalSlice.coordinates
  ) ?? [0, 0];
  return (
    <div className={styles.maincontainer}>
      <div className={styles.mapcontainer}>
        <h4> ph: Pääsisäänkäynnin sijainti kartalla</h4>
        <div className={styles.map}>
          <Map
            initCenter={coordinates!}
            initLocation={coordinates}
            initZoom={17}
            draggableMarker={false}
            questionId={-1}
            makeStatic={true}
            isPreview={true}
          />
          {coordinates && coordinates.length === 2 ? (
            <p>
              {" "}
              {`PH: Koordinaatit: E ${coordinates[0]}, N ${coordinates[1]}`}{" "}
            </p>
          ) : null}
        </div>
      </div>
      <div className={styles.picturescontainer}>
        <h4> ph: Pääsisäänkäynnin valokuvat</h4>
        <div className={styles.pictures}>
          <div
            className={styles.picture}
            style={{
              backgroundImage:
                `url(` +
                `https://images.unsplash.com/photo-1531989417401-0f85f7e673f8?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80}` +
                `)`,
            }}
          ></div>
          <div
            className={styles.picture}
            style={{
              backgroundImage:
                `url(` +
                `https://images.unsplash.com/photo-1531989417401-0f85f7e673f8?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80}` +
                `)`,
            }}
          ></div>
          <div
            className={styles.picture}
            style={{
              backgroundImage:
                `url(` +
                `https://images.unsplash.com/photo-1531989417401-0f85f7e673f8?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80}` +
                `)`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default MainEntranceLocationPicturesPreview;
