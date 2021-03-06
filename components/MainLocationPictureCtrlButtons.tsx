import React, { useEffect, useState } from "react";
import { IconArrowLeft } from "hds-react";
import { useI18n } from "next-localization";
import { useRouter } from "next/router";
import styles from "./AdditionalInfoCtrlButtons.module.scss";
import QuestionButton from "./QuestionButton";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { addMainImageElement, addMainPicture } from "../state/reducers/formSlice";
import { setServicepointLocation, setServicepointLocationWGS84 } from "../state/reducers/generalSlice";

// usage: save and return without saving buttons in additionalinfo page
// notes: only save if save clicked, if return no save or back button (browser, mice etc) returns to old or emtpy value
const MainLocationPictureCtrlButtons = (): JSX.Element => {
  const i18n = useI18n();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [pageSaved, setPageSaved] = useState(false);

  const hasInvalidValidations = useAppSelector((state) => state.formReducer.mainImageInvalidValues);

  const mainimageTemp = useAppSelector((state) => state.formReducer.mainImageTemp);

  const mainimageElementTemp = useAppSelector((state) => state.formReducer.mainImageTempElement);

  const coordinatesTemp = useAppSelector((state) => state.generalSlice.coordinatesTemp);

  const coordinatesWGS84Temp = useAppSelector((state) => state.generalSlice.coordinatesWGS84Temp);

  // handle user clicking back button on browser / mouse ->
  // needs to remove the "saved" values same as clicking return no save
  // also check if pageSaved (saved button clicked), if so then just return
  // sets temps (which are set when first entering the page) to the non-temp/values
  useEffect(() => {
    router.beforePopState(() => {
      if (pageSaved) {
        return true;
      }
      if (mainimageTemp) {
        dispatch(addMainPicture(mainimageTemp));
      }
      if (mainimageElementTemp) {
        dispatch(addMainImageElement(mainimageElementTemp));
      }
      if (coordinatesTemp) {
        dispatch(
          setServicepointLocation({
            coordinates: coordinatesTemp,
          })
        );
      }
      if (coordinatesWGS84Temp) {
        dispatch(
          setServicepointLocationWGS84({
            coordinatesWGS84: coordinatesWGS84Temp,
          })
        );
      }

      return true;
    });
  }, [mainimageTemp, mainimageElementTemp, coordinatesTemp, coordinatesWGS84Temp, pageSaved, router, dispatch]);

  // don't alter already saved state, set pageSaved to true
  const handleSaveAndReturn = () => {
    setPageSaved(true);
    router.back();
    // todo: if current router.back() approach not working use e.g router.push and store page-edit id to state
  };

  //   const hasInvalidValidations = useAppSelector((state) =>
  //     state.additionalInfoReducer[questionId]?.invalidValues?.filter(
  //       (invalids) =>
  //         invalids.invalidAnswers && invalids.invalidAnswers.length > 0
  //     )
  //   );

  // handle user clicked return no ssave button, uses beforePopState to reset state either init or empty respectively
  const handleReturnNoSave = () => {
    router.back();
  };

  return (
    <div className={styles.maincontainer}>
      <QuestionButton
        variant="secondary"
        iconLeft={<IconArrowLeft />}
        onClickHandler={handleSaveAndReturn}
        disabled={!!(hasInvalidValidations && hasInvalidValidations.length > 0)}
      >
        {i18n.t("common.buttons.saveAndReturn")}
      </QuestionButton>
      <span className={styles.noborderbutton}>
        <QuestionButton variant="secondary" onClickHandler={() => handleReturnNoSave()}>
          {i18n.t("common.buttons.returnNoSave")}
        </QuestionButton>
      </span>
    </div>
  );
};

export default MainLocationPictureCtrlButtons;
