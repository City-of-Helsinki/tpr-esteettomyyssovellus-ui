import React, { useEffect, useState } from "react";
import { MapProps } from "../../types/general";
import styles from "./Map.module.scss";
import dynamic from "next/dynamic";

const Map = ({
  questionId,
  initCenter,
  initZoom,
  initLocation,
  draggableMarker,
  makeStatic = false,
  updateLocationHandler,
}: MapProps): JSX.Element => {
  const MapWrapper = dynamic(() => import("./MapWrapper"), { ssr: false });

  return (
    <div
      className={!makeStatic ? styles.mapcontainer : styles.mapstaticpreview}
    >
      <MapWrapper
        questionId={questionId}
        initialCenter={initCenter}
        initialZoom={initZoom}
        initLocation={initLocation}
        draggableMarker={draggableMarker}
        setMapView={updateLocationHandler}
        makeStatic={makeStatic}
      />
    </div>
  );
};

export default Map;
