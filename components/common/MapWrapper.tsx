// this files code from marketing project: needs editing or deleting

import React, { ReactElement, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { useI18n } from "next-localization";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { Marker as LeafletMarker, Icon, LatLngExpression } from "leaflet";
import getOrigin from "../../utils/request";
import styles from "./MapWrapper.module.scss";
import { useDispatch } from "react-redux";
import { addLocation } from "../../state/reducers/additionalInfoSlice";
import { useAppSelector } from "../../state/hooks";

interface MapWrapperProps {
  questionId: number;
  initialCenter: [number, number];
  initialZoom: number;
  initLocation: [number, number];
  setLocation?: (initLocation: [number, number]) => void;
  setMapView?: (center: LatLngExpression, zoom: number) => void;
  setMapReady?: (ready: boolean) => void;
  draggableMarker: boolean;
}

const MapWrapper = ({
  questionId,
  initialCenter,
  initialZoom,
  initLocation,
  setMapView,
  setMapReady,
  draggableMarker,
}: MapWrapperProps): ReactElement => {
  const i18n = useI18n();
  const router = useRouter();
  const dispatch = useDispatch();

  const markerRef = useRef<LeafletMarker>(null);

  const stateLocation = useAppSelector(
    (state) => state.additionalInfoReducer[questionId]?.locations?.coordinates
  );

  //todo: remove and add to general reducer
  initLocation = [60.5000754478697, 25.501958086223556];

  const curLocation: [number, number] =
    stateLocation && stateLocation !== undefined ? stateLocation : initLocation;

  const setLocation = (coordinates: [number, number]) => {
    dispatch(
      addLocation({
        questionId: questionId,
        coordinates: coordinates,
        locNorthing: coordinates[0],
        locEasting: coordinates[1],
      })
    );
  };

  // Use the icon images from the public folder
  const icon = new Icon.Default({ imagePath: `${getOrigin(router)}/` });

  // Helper function
  const isLocationValid = () =>
    curLocation &&
    curLocation.length === 2 &&
    curLocation[0] > 0 &&
    curLocation[1] > 0;

  // Center on the marker if possible
  const center = isLocationValid() ? curLocation : initialCenter;

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

    // Force a map update otherwise the map does not always render correctly after a page is first loaded
    map.invalidateSize();

    // If the initLocation in redux state has changed, by geocoding or dragging, pan the map to centre on the new position
    useEffect(() => {
      if (isLocationValid() && prevLocation !== curLocation) {
        map.flyTo(curLocation, 18);
      }
    }, [map]);

    // Store the map view in redux state, so that the same zoom can be used when changing pages
    // The map centre is stored if needed, but currently the map is always centred on the marker position
    // If there is no initLocation, allow a map click (or tap) to store the click initLocation in redux, which then causes the marker to be shown
    useMapEvents({
      moveend: () => {
        if (setMapView) {
          setMapView(map.getCenter(), map.getZoom());
        }
      },
      click: (evt) => {
        if (isLocationValid()) {
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
      center={center}
      zoom={initialZoom}
      minZoom={5}
      maxZoom={18}
      whenReady={whenReady}
    >
      <CustomMapHandler />
      <TileLayer
        url="http://tiles.hel.ninja/styles/hel-osm-bright/{z}/{x}/{y}@2x@fi.png"
        attribution={`<a href="https://www.openstreetmap.org/copyright" target="_blank">© ${i18n.t(
          "common.map.osm"
        )}</a>`}
      />
      {isLocationValid() && (
        <Marker
          ref={markerRef}
          icon={icon}
          position={curLocation}
          draggable={draggableMarker}
          eventHandlers={markerEventHandlers}
        />
      )}
    </MapContainer>
  );
};

MapWrapper.defaultProps = {
  setLocation: undefined,
  setMapView: undefined,
  setMapReady: undefined,
};

export default MapWrapper;
