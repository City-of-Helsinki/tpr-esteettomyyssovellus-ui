import React, { useCallback, useMemo, useState } from "react";
import { IconCross, IconLocation } from "hds-react";
import { useI18n } from "next-localization";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { editEntranceLocationPhoto } from "../state/reducers/additionalInfoSlice";
import { BackendEntranceAnswer } from "../types/backendModels";
import { MAP_MAX_ZOOM } from "../types/constants";
import { EntranceLocationPhoto, EntranceLocationProps } from "../types/general";
import { convertCoordinates, isLocationValid } from "../utils/utilFunctions";
import Map from "./common/Map";
import QuestionButton from "./QuestionButton";
import styles from "./EntranceLocation.module.scss";

// usage: entrance location photo page location component
// notes: remove geocoding if not needed
const EntranceLocation = ({ entranceLocationPhoto }: EntranceLocationProps): JSX.Element => {
  const i18n = useI18n();
  const dispatch = useAppDispatch();

  // geodocing related -> delete if not used in final production
  //   const [addressErrorText, setAddressErrorText] = useState("");

  const { entrance_id, modifiedAnswer } = entranceLocationPhoto;
  const { loc_easting, loc_northing } = modifiedAnswer || {};

  // const currentId = order_number;
  const questionId = -1;
  const isMainLocPicComponent = false;

  /*
  const coordinatesWGS84 = useAppSelector((state) => state.generalSlice.coordinatesWGS84);
  const fallbackLocation = !initValue && !isMainLocPicComponent ? coordinatesWGS84 : (initValue as [number, number]);

  const coordinates = useAppSelector((state) => state.additionalInfoReducer.additionalInfo[questionId].locations?.coordinates);
  const coords = !isMainLocPicComponent && coordinates ? coordinates : fallbackLocation;
  */
  const servicepointCoordinatesEuref = useAppSelector((state) => state.generalSlice.coordinatesEuref);
  const coordinatesEuref = [loc_easting ?? 0, loc_northing ?? 0] as [number, number];
  const coordinatesWGS84 = convertCoordinates("EPSG:3067", "WGS84", coordinatesEuref).reverse() as [number, number];

  const [mapInput, setMapInput] = useState(false);

  const updateLocationPhoto = useCallback(
    (updatedLocationPhoto: EntranceLocationPhoto) => {
      dispatch(
        editEntranceLocationPhoto({
          entrance_id,
          updatedLocationPhoto,
        })
      );
    },
    [entrance_id, dispatch]
  );

  const setLocation = useCallback(
    (coordinates: [number, number]) => {
      // Convert the coordinates to the Finnish system
      const lonLatReverseCoordinates = [coordinates[1], coordinates[0]] as [number, number];
      const [locEas, locNor] = convertCoordinates("WGS84", "EPSG:3067", lonLatReverseCoordinates);

      updateLocationPhoto({
        ...entranceLocationPhoto,
        modifiedAnswer: { ...((modifiedAnswer || {}) as BackendEntranceAnswer), loc_easting: Math.round(locEas), loc_northing: Math.round(locNor) },
      });
    },
    [entranceLocationPhoto, modifiedAnswer, updateLocationPhoto]
  );

  const handleAddLocation = () => {
    // If there is no valid location, use the servicepoint location as the default
    if (!isLocationValid(coordinatesEuref) && isLocationValid(servicepointCoordinatesEuref)) {
      updateLocationPhoto({
        ...entranceLocationPhoto,
        modifiedAnswer: {
          ...((modifiedAnswer || {}) as BackendEntranceAnswer),
          loc_easting: servicepointCoordinatesEuref[0],
          loc_northing: servicepointCoordinatesEuref[1],
        },
      });
    }

    setMapInput(true);
  };

  // on delete button clicked chain delete location from store and delete component cb
  const handleOnDelete = () => {
    updateLocationPhoto({
      ...entranceLocationPhoto,
      modifiedAnswer: {
        ...((modifiedAnswer || {}) as BackendEntranceAnswer),
        loc_easting: undefined,
        loc_northing: undefined,
      },
    });
    setMapInput(false);
  };

  // So this (geocoding) was done but then decided to drop it out
  // leaving it here for now for if the plans change
  // if not needed -> delete

  // const handleShowOnMap = async () => {
  //   setAddressErrorText("");
  //   const address =
  //     addressRef && addressRef.current && addressRef.current !== null
  //       ? //@ts-ignore
  //         addressRef.current.value
  //       : null;
  //   if (!address || address === null) return;
  //   const formattedAddress = address.replace(" ", "%");
  //   const geocodeReq = `${HKI_GEOCODING_URL}${formattedAddress}${GEOCODING_PARAMS}`;
  //   const geocodeResponse = await fetch(geocodeReq);
  //   const data = await geocodeResponse.json();

  //   if (!data || data.count === 0) {
  //     setAddressErrorText("ph: osoitetta ei löytynyt");
  //     return;
  //   }
  //   if (data.count > 1) {
  //     console.log("More than 1 address found...");
  //   }
  //   const geocodedCoordinates: [number, number] =
  //     data.results[0]?.location?.coordinates;

  //   if (geocodedCoordinates && geocodedCoordinates.length === 2) {
  //     console.log("setting coordinates", geocodedCoordinates);
  //     // const reversedCoords = geocodedCoordinates;
  //     const [locEas, locNor] = convertCoordinates(
  //       "WGS84",
  //       "EPSG:3067",
  //       geocodedCoordinates
  //     );
  //     dispatch(
  //       addLocation({
  //         questionId: questionId,
  //         coordinates: geocodedCoordinates.reverse(),
  //         locNorthing: Math.round(locNor),
  //         locEasting: Math.round(locEas),
  //       })
  //     );
  //   }
  // };

  // useMemo for preventing leaflet map rendering each time something updates on page
  const memoMap = useMemo(() => {
    return (
      <Map
        curLocation={coordinatesWGS84}
        setLocation={setLocation}
        initZoom={MAP_MAX_ZOOM}
        draggableMarker
        questionId={questionId}
        isMainLocPicComponent={isMainLocPicComponent}
      />
    );
  }, [coordinatesWGS84, setLocation, isMainLocPicComponent, questionId]);

  // The map should not be visible to screen readers, so use aria-hidden here
  return (
    <div className={styles.maincontainer} aria-hidden>
      {(mapInput || isLocationValid(coordinatesWGS84)) && <div className={styles.mapcontainer}>{memoMap}</div>}

      <div className={styles.inputcontainer}>
        <div className={styles.inputbuttons}>
          {!mapInput && !isLocationValid(coordinatesWGS84) && (
            <QuestionButton variant="secondary" iconRight={<IconLocation aria-hidden />} onClickHandler={() => handleAddLocation()}>
              {i18n.t("additionalInfo.addLocation")}
            </QuestionButton>
          )}

          {(mapInput || isLocationValid(coordinatesWGS84)) && (
            <QuestionButton variant="secondary" iconRight={<IconCross aria-hidden />} onClickHandler={() => handleOnDelete()}>
              {i18n.t("additionalInfo.cancelLocation")}
            </QuestionButton>
          )}
        </div>
      </div>
    </div>
  );
};
export default EntranceLocation;
