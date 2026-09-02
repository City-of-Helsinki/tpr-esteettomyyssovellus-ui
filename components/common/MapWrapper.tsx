import React, { ReactElement, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { useI18n } from "next-localization";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents, ZoomControl } from "react-leaflet";
import { Marker as LeafletMarker, Icon } from "leaflet";
import getOrigin from "../../utils/request";
import { MAP_INITIAL_CENTER, MAP_INITIAL_ZOOM, MAP_MAX_ZOOM, MAP_MIN_ZOOM } from "../../types/constants";
import { isLocationValid } from "../../utils/utilFunctions";
import styles from "./MapWrapper.module.scss";

interface MapWrapperProps {
  initialZoom: number;
  curLocation: [number, number];
  setLocation?: (location: [number, number]) => void;
  setMapReady?: (ready: boolean) => void;
  draggableMarker?: boolean;
  makeStatic: boolean;
}

// usage: leaflet map used in the project
// notes: editable in additionalinfo page, in form/details pages only static "preview"
// gets the main location from state (fetched from db). User can either click the map or drag-n-drop marker for new location
const MapWrapper = ({ initialZoom, curLocation, setLocation, setMapReady, draggableMarker, makeStatic }: MapWrapperProps): ReactElement => {
  const i18n = useI18n();
  const router = useRouter();

  const markerRef = useRef<LeafletMarker>(null);

  // Use the icon images from the public folder
  const icon = new Icon.Default({ imagePath: `${getOrigin(router)}/` });

  // Center on the marker if possible
  const center = isLocationValid(curLocation) ? curLocation : (MAP_INITIAL_CENTER as [number, number]);
  const zoom = isLocationValid(curLocation) ? initialZoom : MAP_INITIAL_ZOOM;

  // Set the initLocation in redux state after the marker is dragged to a new position
  // Note: this will cause the map to pan to centre on these coordinates
  const markerEventHandlers = {
    dragend: () => {
      const marker = markerRef.current;
      if (marker && setLocation) {
        setLocation([marker.getLatLng().lat, marker.getLatLng().lng]);
      }
    },
  };

  // Use a ref to store the previous initLocation, as described in the React hooks docs
  const usePrevious = (value: [number, number]) => {
    const ref = useRef<[number, number]>();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  };
  const prevLocation = usePrevious(curLocation);

  // A child component must be used in order to access the react-leaflet map hook
  const CustomMapHandler = () => {
    const map = useMap();

    if (makeStatic) {
      map.dragging.disable();
      map.touchZoom.disable();
      map.doubleClickZoom.disable();
      map.scrollWheelZoom.disable();
      map.boxZoom.disable();
      map.keyboard.disable();
      if (map.tap) {
        map.tap.disable();
      }
    }

    // Force a map update otherwise the map does not always render correctly after a page is first loaded
    map.invalidateSize();

    // If the initLocation in redux state has changed, by geocoding or dragging, pan the map to centre on the new position
    useEffect(() => {
      if (isLocationValid(curLocation) && prevLocation !== curLocation && !makeStatic) {
        map.setView(curLocation, MAP_MAX_ZOOM);
      }
    }, [map]);

    // The map centre is stored if needed, but currently the map is always centred on the marker position
    // If there is no initLocation, allow a map click (or tap) to store the click initLocation in redux, which then causes the marker to be shown
    useMapEvents({
      click: (evt) => {
        if (!isLocationValid(curLocation) && setLocation && !makeStatic) {
          setLocation([evt.latlng.lat, evt.latlng.lng]);
        }
      },
    });

    // Nothing to render for this
    return null;
  };

  const whenReady = () => {
    if (setMapReady) {
      setMapReady(true);
    }
  };

  return (
    <MapContainer
      className={styles.mapwrapper}
      zoomControl={false}
      center={center}
      zoom={zoom}
      minZoom={MAP_MIN_ZOOM}
      maxZoom={MAP_MAX_ZOOM}
      whenReady={whenReady}
    >
      <CustomMapHandler />
      {!makeStatic && <ZoomControl position="topleft" zoomInTitle={i18n.t("common.map.zoomIn")} zoomOutTitle={i18n.t("common.map.zoomOut")} />}
      <TileLayer
        url="http://tiles.hel.ninja/styles/hel-osm-bright/{z}/{x}/{y}@2x@fi.png"
        attribution={`<a href="https://www.openstreetmap.org/copyright" target="_blank">© ${i18n.t("common.map.osm")}</a>`}
      />
      {isLocationValid(curLocation) && (
        <Marker ref={markerRef} icon={icon} position={curLocation} draggable={draggableMarker} eventHandlers={markerEventHandlers} />
      )}
    </MapContainer>
  );
};

MapWrapper.defaultProps = {
  initLocation: undefined,
  setMapReady: undefined,
  draggableMarker: false,
};

export default MapWrapper;
