import { IconCross } from "hds-react";
import { useI18n } from "next-localization";
import React, { useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { removeLocation } from "../state/reducers/additionalInfoSlice";
import { AdditionalContentProps } from "../types/general";
import styles from "./AdditionalInfoLocationContent.module.scss";
import Map from "./common/Map";
import QuestionButton from "./QuestionButton";

// usage: additionalinfo page location component
// notes: remove geocoding if not needed
const AdditionalInfoLocationContent = ({
  questionId,
  onDelete,
  canDelete = true,
  isMainLocPicComponent,
}: AdditionalContentProps): JSX.Element => {
  const i18n = useI18n();
  const dispatch = useAppDispatch();

  // geodocing related -> delete if not used in final production
  //   const [addressErrorText, setAddressErrorText] = useState("");

  let coords: [number, number] = useAppSelector(
    (state) => state.additionalInfoReducer[questionId].locations?.coordinates
  ) ?? [0, 0];

  if (coords === [0, 0]) {
    coords = useAppSelector((state) => state.generalSlice.coordinates) ?? [
      0,
      0,
    ];
  }

  // on delete button clicked chain delete location from store and delete component cb
  const handleOnDelete = () => {
    handleRemoveLocation();
    onDelete ? onDelete() : null;
  };

  const handleRemoveLocation = () => {
    dispatch(removeLocation({ questionId }));
  };

  // So this (geocoding) was doned but then decided to drop it out
  // leaving it here for now for if the plans change
  // if not neede -> delete

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
        initCenter={coords}
        initLocation={coords}
        initZoom={14}
        draggableMarker={true}
        questionId={questionId}
        isMainLocPicComponent={isMainLocPicComponent}
      />
    );
  }, [coords]);

  return (
    <div className={styles.maincontainer}>
      <div className={styles.controlscontainer}>
        {/* text input for geocoding, remove if not needed */}
        {/* <span className={styles.addressinput}>
          <TextInput
            id={"1"}
            label={"ph: Syötä osoite"}
            placeholder="ph Kirjoita osoite"
            required
            ref={addressRef! ?? undefined}
            tooltipButtonLabel="ph: ohje osoitteen syöttämiseen"
            tooltipLabel="ph: ohje osoitteen syöttämiseen"
            tooltipText="ph: syöttäkää osoite suomeksi muodossa: osoite, kaupunki (esim. hämeentie 1, helsinki)"
            errorText={addressErrorText}
          />
        </span> */}
        {/* button for geocoding, remove if not needed */}
        {/* <QuestionButton
          variant="secondary"
          iconRight={<IconLocation />}
          onClickHandler={() => handleShowOnMap()}
        >
          PH: Hae osoite kartalle
        </QuestionButton> */}
        {canDelete ? (
          <QuestionButton
            variant="secondary"
            iconRight={<IconCross />}
            onClickHandler={() => handleOnDelete()}
          >
            {i18n.t("additionalInfo.cancelLocation")}
          </QuestionButton>
        ) : null}
      </div>
      <div className={styles.mapcontainer}>{memoMap}</div>
    </div>
  );
};
export default AdditionalInfoLocationContent;
