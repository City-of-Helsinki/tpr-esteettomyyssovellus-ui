import React from "react";
import { useI18n } from "next-localization";
import Button from "./QuestionButton";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { addEntrancePlaceBox } from "../state/reducers/additionalInfoSlice";
import { AccessibilityPlaceNewButtonProps, EntrancePlaceBox } from "../types/general";
import { BackendEntrancePlace } from "../types/backendModels";

// usage: add new button for AccessibilityPlace
const AccessibilityPlaceNewButton = ({ accessibilityPlaceData, orderNumber }: AccessibilityPlaceNewButtonProps): JSX.Element => {
  const i18n = useI18n();
  const dispatch = useAppDispatch();

  const curEntranceId = useAppSelector((state) => state.formReducer.currentEntranceId);

  const handleAddPlaceData = () => {
    const newBox: EntrancePlaceBox = {
      entrance_id: curEntranceId,
      place_id: accessibilityPlaceData.place_id,
      order_number: orderNumber,
      modifiedBox: {} as BackendEntrancePlace,
      termsAccepted: false,
      invalidValues: [],
    };
    dispatch(addEntrancePlaceBox(newBox));
  };

  return (
    <Button variant="primary" onClickHandler={handleAddPlaceData}>
      {i18n.t("additionalInfo.addAdditionalInfoSet")}
    </Button>
  );
};

export default AccessibilityPlaceNewButton;
