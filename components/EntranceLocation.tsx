import React, { useCallback, useEffect, useMemo, useState } from "react";
import { IconCross, IconLocation } from "hds-react";
import { useI18n } from "next-localization";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { editEntranceLocation } from "../state/reducers/additionalInfoSlice";
import { MAP_MAX_ZOOM } from "../types/constants";
import { EntranceLocationProps } from "../types/general";
import { convertCoordinates, isLocationValid } from "../utils/utilFunctions";
import Map from "./common/Map";
import QuestionButton from "./QuestionButton";
import styles from "./EntranceLocation.module.scss";

// usage: entrance location photo page location component
const EntranceLocation = ({ entranceLocationPhoto }: EntranceLocationProps): JSX.Element => {
  const i18n = useI18n();
  const dispatch = useAppDispatch();

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

  const [mapInput, setMapInput] = useState(false);
  const [coordinatesEuref, setCoordinatesEuref] = useState<[number, number]>([0, 0]);
  const [coordinatesWGS84, setCoordinatesWGS84] = useState<[number, number]>([0, 0]);

  useEffect(() => {
    const coordinates = [loc_easting ?? 0, loc_northing ?? 0] as [number, number];
    setCoordinatesEuref(coordinates);
    setCoordinatesWGS84(convertCoordinates("EPSG:3067", "WGS84", coordinates).reverse() as [number, number]);
  }, [loc_easting, loc_northing]);

  const updateEntranceLocation = useCallback(
    (locEasting?: number, locNorthing?: number) => {
      dispatch(editEntranceLocation({ entrance_id, locEasting, locNorthing }));
    },
    [entrance_id, dispatch]
  );

  const setLocation = useCallback(
    (coordinates: [number, number]) => {
      // Convert the coordinates to the Finnish system
      const lonLatReverseCoordinates = [coordinates[1], coordinates[0]] as [number, number];
      const [locEas, locNor] = convertCoordinates("WGS84", "EPSG:3067", lonLatReverseCoordinates);

      updateEntranceLocation(locEas, locNor);
    },
    [updateEntranceLocation]
  );

  const handleAddLocation = () => {
    // If there is no valid location, use the servicepoint location as the default
    if (!isLocationValid(coordinatesEuref) && isLocationValid(servicepointCoordinatesEuref)) {
      updateEntranceLocation(servicepointCoordinatesEuref[0], servicepointCoordinatesEuref[1]);
    }

    setMapInput(true);
  };

  const handleOnDelete = () => {
    updateEntranceLocation(undefined, undefined);

    setMapInput(false);
  };

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
