import React from "react";
import dynamic from "next/dynamic";
import { MapProps } from "../../types/general";
import styles from "./Map.module.scss";

// usage: container and middle-component for leaflet map (mapwrapper)
// notes: dynamic import of MapWrapper is important for leaflet functionality
const Map = ({ initZoom, curLocation, setLocation, draggableMarker, makeStatic = false }: MapProps): JSX.Element => {
  const MapWrapper = dynamic(() => import("./MapWrapper"), { ssr: false });

  // The map should not be visible to screen readers, so use aria-hidden here
  return (
    <div className={!makeStatic ? styles.mapcontainer : styles.mapstaticpreview} aria-hidden>
      <MapWrapper
        initialZoom={initZoom}
        curLocation={curLocation}
        setLocation={setLocation}
        draggableMarker={draggableMarker}
        makeStatic={makeStatic}
      />
    </div>
  );
};

export default Map;
