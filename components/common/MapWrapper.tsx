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
import { Marker as LeafletMarker, Icon } from "leaflet";
import getOrigin from "../../utils/request";
import styles from "./MapWrapper.module.scss";
import { useDispatch } from "react-redux";
import { addLocation } from "../../state/reducers/additionalInfoSlice";
import { useAppSelector } from "../../state/hooks";
import { convertCoordinates, isLocationValid } from "../../utils/utilFunctions";

interface MapWrapperProps {
  questionId: number;
  initialZoom: number;
  initLocation: [number, number] | number[];
  setLocation?: (initLocation: [number, number]) => void;
  setMapReady?: (ready: boolean) => void;
  draggableMarker?: boolean;
  makeStatic: boolean;
}

// usage: leaflet map used in the project
// notes: editable in additionalinfo page, in form/details pages only static "preview"
// gets the main location from state (fetched from db). User can either click the map or drag-n-drop marker for new location
const MapWrapper = ({
  questionId,
  initialZoom,
  setMapReady,
  draggableMarker,
  makeStatic,
}: MapWrapperProps): ReactElement => {
  const i18n = useI18n();
  const router = useRouter();
  const dispatch = useDispatch();

  const markerRef = useRef<LeafletMarker>(null);

  const stateLocation = useAppSelector(
    (state) => state.additionalInfoReducer[questionId]?.locations?.coordinates
  );

  const initLocation = useAppSelector(
    (state) => state.generalSlice.coordinates
  );

  // @ts-ignore : ignore types because .reverse() returns number[]
  const curLocation: [number, number] =
    stateLocation && stateLocation !== undefined
      ? stateLocation
      : convertCoordinates("EPSG:3067", "WGS84", initLocation).reverse();

  const setLocation = (
    coordinates: [number, number],
    initNorthing?: number,
    initEasting?: number
  ) => {
    let locNor, locEas;
    // transform coordinates to northing and easting for db
    const LonLatReverseCoordinates: [number, number] = [
      coordinates[1],
      coordinates[0],
    ];
    // if init values are provided, set those to the state
    // otherwise transform coordinates (reversed) from wgs84 to 3067 and set to state
    if (initNorthing && initEasting) {
      locNor = initNorthing;
      locEas = initEasting;
    } else {
      [locEas, locNor] = convertCoordinates(
        "WGS84",
        "EPSG:3067",
        LonLatReverseCoordinates
      );
    }

    dispatch(
      addLocation({
        questionId: questionId,
        coordinates: coordinates,
        locNorthing: Math.round(locNor),
        locEasting: Math.round(locEas),
      })
    );
  };

  // Use the icon images from the public folder
  const icon = new Icon.Default({ imagePath: `${getOrigin(router)}/` });

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
      if (map.tap) map.tap.disable();
    }

    map.invalidateSize();

    // If the initLocation in redux state has changed, by geocoding or dragging, pan the map to centre on the new position
    useEffect(() => {
      if (
        isLocationValid(curLocation) &&
        prevLocation !== curLocation &&
        !makeStatic
      ) {
        map.setView(curLocation, 18);
        map.invalidateSize();
      }
    }, [map]);

    // Store the map view in redux state, so that the same zoom can be used when changing pages
    // The map centre is stored if needed, but currently the map is always centred on the marker position
    // If there is no initLocation, allow a map click (or tap) to store the click initLocation in redux, which then causes the marker to be shown
    useMapEvents({
      click: (evt) => {
        if (isLocationValid(curLocation) && !makeStatic) {
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
    if (!stateLocation || stateLocation === undefined) {
      setLocation(curLocation, initLocation[1], initLocation[0]);
    }
  };

  return (
    <MapContainer
      className={styles.mapwrapper}
      center={curLocation}
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
      {isLocationValid(curLocation) && (
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
  setMapReady: undefined,
};

export default MapWrapper;
