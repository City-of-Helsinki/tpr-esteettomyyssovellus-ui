import { TextInput } from "hds-react";
import { LatLngExpression } from "leaflet";
import { useI18n } from "next-localization";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { addLocation } from "../state/reducers/additionalInfoSlice";
import { AdditionalContentProps } from "../types/general";
import styles from "./AdditionalInfoLocationContent.module.scss";
import Map from "./common/Map";
import QuestionRadioButtons from "./QuestionRadioButtons";

const AdditionalInfoLocationContent = ({ questionNumber, onDelete }: AdditionalContentProps): JSX.Element => {
  const i18n = useI18n();
  const dispatch = useAppDispatch();
  const locations = useAppSelector((state) => state.additionalInfoReducer);
  const handleUpdateLocation = (location: LatLngExpression): void => {
    // const qNumber = getQNumber()
    dispatch(
      addLocation({
        questionNumber: questionNumber,
        description: "test",
        coordinates: location,
      })
    );
  };
  return (
    <div className={styles.maincontainer}>
      <div className={styles.controlscontainer}>
        <span>
          <QuestionRadioButtons
            mainLabel={i18n.t("common.generalChoose")}
            firstButtonLabel={i18n.t("common.map.point")}
            secondButtonLabel={i18n.t("common.map.line")}
          />
        </span>
        <span>
          <TextInput id={"1"} label={i18n.t("common.generalExplanation")} placeholder="ph syötä insert tekstiä" required />
        </span>
      </div>
      <div className={styles.mapcontainer}>
        <Map
          initCenter={[60.169, 24.938]}
          initLocation={[60.169, 24.938]}
          initZoom={15}
          draggableMarker
          updateLocationHandler={handleUpdateLocation}
        />
      </div>
    </div>
  );
};
export default AdditionalInfoLocationContent;
