import React from "react";
import { MapProps } from "../../types/general";
import styles from "./Map.module.scss";
import dynamic from "next/dynamic";

// usage: container and middle-component for leaflet map (mapwrapper)
// notes: dynamic import of MapWrapper is important for leaflet functionality
const Map = ({
  questionId,
  initCenter,
  initZoom,
  initLocation,
  draggableMarker,
  makeStatic = false,
  isPreview = false,
}: MapProps): JSX.Element => {
  const MapWrapper = dynamic(() => import("./MapWrapper"), { ssr: false });

  return (
    <div
      style={isPreview ? { height: "20rem" } : {}}
      className={!makeStatic ? styles.mapcontainer : styles.mapstaticpreview}
    >
      <MapWrapper
        questionId={questionId}
        initialZoom={initZoom}
        initLocation={initLocation}
        draggableMarker={draggableMarker}
        makeStatic={makeStatic}
      />
    </div>
  );
};

export default Map;
