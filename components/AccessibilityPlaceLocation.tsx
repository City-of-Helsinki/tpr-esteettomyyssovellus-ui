import React, { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { IconCross, IconLocation, IconMinus, IconPlus, TextArea } from "hds-react";
import { useI18n } from "next-localization";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { editEntrancePlaceBoxLocation, editEntrancePlaceBoxLocationText } from "../state/reducers/additionalInfoSlice";
import { MAP_MAX_ZOOM } from "../types/constants";
import { AccessibilityPlaceLocationProps } from "../types/general";
import { convertCoordinates, isLocationValid } from "../utils/utilFunctions";
import Map from "./common/Map";
import QuestionButton from "./QuestionButton";
import QuestionInfo from "./QuestionInfo";
import styles from "./AccessibilityPlaceLocation.module.scss";

// usage: accessibility place page location component
const AccessibilityPlaceLocation = ({ entrancePlaceBox }: AccessibilityPlaceLocationProps): JSX.Element => {
  const i18n = useI18n();
  const dispatch = useAppDispatch();

  const { entrance_id, place_id, order_number, modifiedBox } = entrancePlaceBox;
  const { loc_easting, loc_northing, location_text_fi, location_text_sv, location_text_en } = modifiedBox || {};

  const currentId = order_number;

  const servicepointCoordinatesEuref = useAppSelector((state) => state.generalSlice.coordinatesEuref);

  const [mapInput, setMapInput] = useState(false);
  const [coordinatesEuref, setCoordinatesEuref] = useState<[number, number]>([0, 0]);
  const [coordinatesWGS84, setCoordinatesWGS84] = useState<[number, number]>([0, 0]);

  useEffect(() => {
    const coordinates = [loc_easting ?? 0, loc_northing ?? 0] as [number, number];
    setCoordinatesEuref(coordinates);
    setCoordinatesWGS84(convertCoordinates("EPSG:3067", "WGS84", coordinates).reverse() as [number, number]);
  }, [loc_easting, loc_northing]);

  const updatePlaceBoxLocation = useCallback(
    (locEasting?: number, locNorthing?: number) => {
      dispatch(
        editEntrancePlaceBoxLocation({
          entrance_id,
          place_id,
          order_number,
          locEasting,
          locNorthing,
        })
      );
    },
    [entrance_id, place_id, order_number, dispatch]
  );

  const updatePlaceBoxLocationText = useCallback(
    (language: string, locationText?: string) => {
      dispatch(
        editEntrancePlaceBoxLocationText({
          entrance_id,
          place_id,
          order_number,
          language,
          locationText,
        })
      );
    },
    [entrance_id, place_id, order_number, dispatch]
  );

  const setLocation = useCallback(
    (coordinates: [number, number]) => {
      // Convert the coordinates to the Finnish system
      const lonLatReverseCoordinates = [coordinates[1], coordinates[0]] as [number, number];
      const [locEas, locNor] = convertCoordinates("WGS84", "EPSG:3067", lonLatReverseCoordinates);

      updatePlaceBoxLocation(locEas, locNor);
    },
    [updatePlaceBoxLocation]
  );

  const handleAddLocation = () => {
    // If there is no valid location, use the servicepoint location as the default
    if (!isLocationValid(coordinatesEuref) && isLocationValid(servicepointCoordinatesEuref)) {
      updatePlaceBoxLocation(servicepointCoordinatesEuref[0], servicepointCoordinatesEuref[1]);
    }

    setMapInput(true);
  };

  const handleOnDelete = () => {
    updatePlaceBoxLocation(undefined, undefined);
    updatePlaceBoxLocationText("fi", undefined);
    updatePlaceBoxLocationText("sv", undefined);
    updatePlaceBoxLocationText("en", undefined);

    setMapInput(false);
  };

  // only update state after X (0.5) sec from prev KeyDown, set Alt text with correct lang
  // let timer: NodeJS.Timeout;
  const handleAddLocationText = (evt: ChangeEvent<HTMLTextAreaElement>, language: string) => {
    const locationText = evt.currentTarget.value;
    /*
    clearTimeout(timer);
    timer = setTimeout(() => {
      dispatch(setAlt({ questionId, language, value, compId: id }));
    }, 500);
    */
    updatePlaceBoxLocationText(language, locationText);
  };

  // useMemo for preventing leaflet map rendering each time something updates on page
  const memoMap = useMemo(() => {
    return <Map curLocation={coordinatesWGS84} setLocation={setLocation} initZoom={MAP_MAX_ZOOM} draggableMarker />;
  }, [coordinatesWGS84, setLocation]);

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
              onChange={(evt: ChangeEvent<HTMLTextAreaElement>) => handleAddLocationText(evt, "fi")}
              value={location_text_fi ?? ""}
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
                  onChange={(evt: ChangeEvent<HTMLTextAreaElement>) => handleAddLocationText(evt, "sv")}
                  value={location_text_sv ?? ""}
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
                  onChange={(evt: ChangeEvent<HTMLTextAreaElement>) => handleAddLocationText(evt, "en")}
                  value={location_text_en ?? ""}
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
