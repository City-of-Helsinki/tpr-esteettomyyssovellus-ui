import React from "react";
import { MapProps } from "../../types/general";
import styles from "./Map.module.scss";
import dynamic from "next/dynamic";

const Map = ({
  questionId,
  initCenter,
  initZoom,
  initLocation,
  draggableMarker,
  updateLocationHandler,
}: MapProps): JSX.Element => {
  const MapWrapper = dynamic(() => import("./MapWrapper"), { ssr: false });

  return (
    <div className={styles.mapcontainer}>
      <MapWrapper
        questionId={questionId}
        initialCenter={initCenter}
        initialZoom={initZoom}
        initLocation={initLocation}
        draggableMarker
        setMapView={updateLocationHandler}
      />
    </div>
  );
};

export default Map;
