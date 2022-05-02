import React, { KeyboardEvent, useCallback, useMemo, useState } from "react";
import { IconCross, IconLocation, IconMinus, IconPlus, TextArea } from "hds-react";
import { useI18n } from "next-localization";
import { useAppDispatch } from "../state/hooks";
import { editEntrancePlaceBox } from "../state/reducers/additionalInfoSlice";
import { BackendEntrancePlace } from "../types/backendModels";
import { MAP_INITIAL_ZOOM, MAP_MAX_ZOOM } from "../types/constants";
import { AccessibilityPlaceLocationProps, EntrancePlaceBox } from "../types/general";
import { convertCoordinates, isLocationValid } from "../utils/utilFunctions";
import Map from "./common/Map";
import QuestionButton from "./QuestionButton";
import styles from "./AccessibilityPlaceLocation.module.scss";
import QuestionInfo from "./QuestionInfo";

// usage: accessibility place page location component
// notes: remove geocoding if not needed
// const AccessibilityPlaceLocation = ({ questionId, onDelete, canDelete = true, initValue, isMainLocPicComponent = false }: AccessibilityPlaceLocationProps): JSX.Element => {
const AccessibilityPlaceLocation = ({ entrancePlaceBox }: AccessibilityPlaceLocationProps): JSX.Element => {
  const i18n = useI18n();
  const dispatch = useAppDispatch();

  // geodocing related -> delete if not used in final production
  //   const [addressErrorText, setAddressErrorText] = useState("");

  const { entrance_id, place_id, order_number, modifiedBox } = entrancePlaceBox;
  const { loc_easting, loc_northing, location_text_fi, location_text_sv, location_text_en } = modifiedBox || {};

  const currentId = order_number;
  const questionId = -1;
  const isMainLocPicComponent = false;

  /*
  const coordinatesWGS84 = useAppSelector((state) => state.generalSlice.coordinatesWGS84);
  const fallbackLocation = !initValue && !isMainLocPicComponent ? coordinatesWGS84 : (initValue as [number, number]);

  const coordinates = useAppSelector((state) => state.additionalInfoReducer.additionalInfo[questionId].locations?.coordinates);
  const coords = !isMainLocPicComponent && coordinates ? coordinates : fallbackLocation;
  */
  const coordinatesEuref: [number, number] = [loc_easting ?? 0, loc_northing ?? 0];
  const coordinatesWGS84 = convertCoordinates("EPSG:3067", "WGS84", coordinatesEuref).reverse() as [number, number];

  const [mapInput, setMapInput] = useState(false);

  const updatePlaceBox = useCallback(
    (updatedPlaceBox: EntrancePlaceBox) => {
      dispatch(
        editEntrancePlaceBox({
          entrance_id,
          place_id,
          order_number,
          updatedPlaceBox,
        })
      );
    },
    [entrance_id, place_id, order_number, dispatch]
  );

  const setLocation = useCallback(
    (coordinates: [number, number]) => {
      console.log("NEW setLocation", coordinates);

      // Convert the coordinates to the Finnish system
      const lonLatReverseCoordinates: [number, number] = [coordinates[1], coordinates[0]];
      const [locEas, locNor] = convertCoordinates("WGS84", "EPSG:3067", lonLatReverseCoordinates);

      updatePlaceBox({
        ...entrancePlaceBox,
        modifiedBox: { ...((modifiedBox || {}) as BackendEntrancePlace), loc_easting: Math.round(locEas), loc_northing: Math.round(locNor) },
      });
    },
    [entrancePlaceBox, modifiedBox, updatePlaceBox]
  );

  const handleAddLocation = () => {
    setMapInput(true);
  };

  // on delete button clicked chain delete location from store and delete component cb
  const handleOnDelete = () => {
    updatePlaceBox({
      ...entrancePlaceBox,
      modifiedBox: {
        ...((modifiedBox || {}) as BackendEntrancePlace),
        loc_easting: undefined,
        loc_northing: undefined,
        location_text_fi: undefined,
        location_text_sv: undefined,
        location_text_en: undefined,
      },
      photoBase64: undefined,
    });
    setMapInput(false);
  };

  // only update state after X (0.5) sec from prev KeyDown, set Alt text with correct lang
  // let timer: NodeJS.Timeout;
  const handleAddLocationText = (evt: KeyboardEvent<HTMLTextAreaElement>, language: string) => {
    const locationText = evt.currentTarget.value;
    /*
    clearTimeout(timer);
    timer = setTimeout(() => {
      dispatch(setAlt({ questionId, language, value, compId: id }));
    }, 500);
    */
    updatePlaceBox({
      ...entrancePlaceBox,
      modifiedBox: { ...((modifiedBox || {}) as BackendEntrancePlace), [`location_text_${language}`]: locationText },
    });
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
        initZoom={isLocationValid(coordinatesWGS84) ? MAP_MAX_ZOOM : MAP_INITIAL_ZOOM}
        draggableMarker
        questionId={questionId}
        isMainLocPicComponent={isMainLocPicComponent}
      />
    );
  }, [coordinatesWGS84, setLocation, isMainLocPicComponent, questionId]);

  return (
    <div className={styles.maincontainer}>
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

      {isLocationValid(coordinatesWGS84) && (
        <div className={styles.lowercontentcontainer}>
          <div className={styles.altcontainer}>
            <TextArea
              id={`text-fin-${currentId}`}
              label={i18n.t("additionalInfo.locationLabel")}
              helperText={i18n.t("additionalInfo.locationHelperText")}
              tooltipButtonLabel={i18n.t("additionalInfo.generalTooptipButtonLabel")}
              tooltipLabel={i18n.t("additionalInfo.generalTooptipLabel")}
              tooltipText={i18n.t("additionalInfo.altToolTipContent")}
              onKeyUp={(evt: KeyboardEvent<HTMLTextAreaElement>) => handleAddLocationText(evt, "fi")}
              defaultValue={location_text_fi ?? ""}
            />

            <div className={styles.altLabel}>
              <QuestionInfo
                openText={i18n.t("additionalInfo.altHeaderButtonSwe")}
                closeText={i18n.t("additionalInfo.altHeaderButtonClose")}
                openIcon={<IconPlus />}
                closeIcon={<IconMinus />}
                textOnBottom
              >
                <TextArea
                  id={`text-sv-${currentId}`}
                  label={i18n.t("additionalInfo.locationLabelSwe")}
                  helperText={i18n.t("additionalInfo.locationHelperTextSwe")}
                  onKeyUp={(evt: KeyboardEvent<HTMLTextAreaElement>) => handleAddLocationText(evt, "sv")}
                  defaultValue={location_text_sv ?? ""}
                />
              </QuestionInfo>
            </div>

            <div className={styles.altLabel}>
              <QuestionInfo
                openText={i18n.t("additionalInfo.altHeaderButtonEng")}
                closeText={i18n.t("additionalInfo.altHeaderButtonClose")}
                openIcon={<IconPlus />}
                closeIcon={<IconMinus />}
                textOnBottom
              >
                <TextArea
                  id={`text-eng-${currentId}`}
                  label={i18n.t("additionalInfo.locationLabelEng")}
                  helperText={i18n.t("additionalInfo.locationHelperTextEng")}
                  onKeyUp={(evt: KeyboardEvent<HTMLTextAreaElement>) => handleAddLocationText(evt, "en")}
                  defaultValue={location_text_en ?? ""}
                />
              </QuestionInfo>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AccessibilityPlaceLocation;
