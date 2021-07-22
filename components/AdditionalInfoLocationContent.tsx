import { IconCross, IconLocation, TextInput } from "hds-react";
import { LatLngExpression } from "leaflet";
import { useI18n } from "next-localization";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { removeLocation } from "../state/reducers/additionalInfoSlice";
import { AdditionalContentProps } from "../types/general";
import styles from "./AdditionalInfoLocationContent.module.scss";
import Map from "./common/Map";
import QuestionButton from "./QuestionButton";
import QuestionRadioButtons from "./QuestionRadioButtons";

const AdditionalInfoLocationContent = ({
  questionId,
  onDelete,
  initValue,
}: AdditionalContentProps): JSX.Element => {
  //todo: get from initValue ->  url/servicepoint etc
  const i18n = useI18n();
  const dispatch = useAppDispatch();
  const locations = useAppSelector((state) => state.additionalInfoReducer);

  const coordinates = useAppSelector(
    (state) => state.additionalInfoReducer[questionId].locations?.coordinates
  ) ?? [0, 0];
  // TODO: this maybe in lower components

  // on delete button clicked chain delete location from store and delete component cb
  const handleOnDelete = () => {
    handleRemoveLocation();
    onDelete ? onDelete() : null;
  };

  const handleRemoveLocation = () => {
    dispatch(removeLocation({ questionId }));
  };

  const handleShowOnMap = () => {
    console.log("SHOW ON MAP CLICKED");
  };

  return (
    <div className={styles.maincontainer}>
      <div className={styles.controlscontainer}>
        <span className={styles.addressinput}>
          <TextInput
            id={"1"}
            label={i18n.t("common.generalExplanation")}
            placeholder="ph Kirjoita osoite"
            required
          />
        </span>

        <QuestionButton
          variant="secondary"
          iconRight={<IconLocation />}
          onClickHandler={() => handleShowOnMap()}
        >
          PH: Hae osoite kartalle
        </QuestionButton>
        <QuestionButton
          variant="secondary"
          iconRight={<IconCross />}
          onClickHandler={() => handleOnDelete()}
        >
          PH: Peru sijainti
        </QuestionButton>
      </div>
      <div className={styles.mapcontainer}>
        <Map
          initCenter={coordinates}
          initLocation={coordinates}
          initZoom={14}
          draggableMarker
          questionId={questionId}
        />
      </div>
    </div>
  );
};
export default AdditionalInfoLocationContent;
