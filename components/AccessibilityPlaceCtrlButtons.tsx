import React, { useEffect, useState } from "react";
import { IconArrowLeft } from "hds-react";
import { useI18n } from "next-localization";
import { useRouter } from "next/router";
import QuestionButton from "./QuestionButton";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import {
  addInvalidEntrancePlaceBoxValue,
  deleteEntrancePlace,
  revertEntrancePlace,
  setEntrancePlaceValid,
} from "../state/reducers/additionalInfoSlice";
import { AccessibilityPlaceCtrlButtonsProps, EntrancePlaceBox } from "../types/general";
import styles from "./AccessibilityPlaceCtrlButtons.module.scss";

// usage: save and return without saving buttons in additionalinfo page
// notes: only save if save clicked, if return no save or back button (browser, mice etc) returns to old or empty value
const AccessibilityPlaceCtrlButtons = ({ placeId, entrancePlaceBoxes }: AccessibilityPlaceCtrlButtonsProps): JSX.Element => {
  const i18n = useI18n();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [pageSaved, setPageSaved] = useState(false);

  const curEntranceId = useAppSelector((state) => state.formReducer.currentEntranceId);
  // const prevState = useAppSelector((state) => state.additionalInfoReducer.curEditingInitialState as AdditionalInfoProps);

  const handleAddInvalidValue = (entrancePlaceBox: EntrancePlaceBox, invalidFieldId: string, invalidFieldLabel: string) => {
    const { entrance_id, place_id, order_number } = entrancePlaceBox;

    dispatch(
      addInvalidEntrancePlaceBoxValue({
        entrance_id,
        place_id,
        order_number,
        invalidFieldId,
        invalidFieldLabel,
      })
    );
  };

  const validateForm = () => {
    const isFormValid = entrancePlaceBoxes.every((box) => {
      const { order_number, modifiedBox, photoBase64, termsAccepted, isDeleted } = box;
      const { photo_text_fi, photo_source_text } = modifiedBox || {};
      let isValid = true;

      if (!isDeleted) {
        if (photoBase64 || modifiedBox?.photo_url) {
          // Photo added, so validate the mandatory fields
          if (!photo_text_fi || photo_text_fi.length === 0) {
            handleAddInvalidValue(box, `text-fin-${order_number}`, i18n.t("additionalInfo.pictureLabel"));
            isValid = false;
          }
          if (!termsAccepted) {
            handleAddInvalidValue(box, `picture-license-${order_number}`, i18n.t("additionalInfo.sharePictureLicenseLabel"));
            isValid = false;
          }
          if (!photo_source_text || photo_source_text.length === 0) {
            handleAddInvalidValue(box, `tooltip-source-${order_number}`, i18n.t("additionalInfo.sourceTooltipMainLabel"));
            isValid = false;
          }
        }
      }

      return isValid;
    });

    dispatch(setEntrancePlaceValid(isFormValid));

    return isFormValid;
  };

  // Initialise the validation on first render only, using a workaround utilising useEffect with empty dependency array
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const useMountEffect = (fun: () => void) => useEffect(fun, []);
  useMountEffect(validateForm);

  // handle user clicking back button on browser / mouse ->
  // needs to remove the "saved" values same as clicking return no save
  // also check if pageSaved (saved button clicked), if so then just return
  // otherwise set initStateAddinfo to current addinfo / remove all added answers -> for user didn't save
  /*
  useEffect(() => {
    router.beforePopState(() => {
      if (pageSaved) {
        return true;
      }
      if (prevState && Object.entries(prevState).length > 0) {
        dispatch(setPreviousInitStateAdditionalinfo({ questionId, prevState }));
      } else {
        dispatch(removeSingleQuestionAdditionalinfo({ questionId }));
      }
      return true;
    });
  }, [prevState, pageSaved, questionId, dispatch, router]);
  */
  useEffect(() => {
    router.beforePopState(() => {
      if (!pageSaved) {
        // Revert this entrance place using existing values
        dispatch(
          revertEntrancePlace({
            entrance_id: curEntranceId,
            place_id: placeId,
          })
        );
      }

      return true;
    });
  }, [pageSaved, curEntranceId, placeId, dispatch, router]);

  // don't alter already saved state, set pageSaved to true
  const handleSaveAndReturn = () => {
    if (validateForm()) {
      setPageSaved(true);
      router.back();
      // todo: if current router.back() approach not working use e.g router.push and store page-edit id to state
    }
  };

  // handle user clicked return no save button, uses beforePopState to reset state either init or empty respectively
  const handleReturnNoSave = () => {
    router.back();
  };

  const handleDeleteAdditionalInfo = () => {
    dispatch(
      deleteEntrancePlace({
        entrance_id: curEntranceId,
        place_id: placeId,
      })
    );
  };

  return (
    <div className={styles.maincontainer}>
      <QuestionButton variant="secondary" iconLeft={<IconArrowLeft />} onClickHandler={handleSaveAndReturn}>
        {i18n.t("common.buttons.saveAndReturn")}
      </QuestionButton>
      <span className={styles.noborderbutton}>
        <QuestionButton variant="secondary" onClickHandler={() => handleReturnNoSave()}>
          {i18n.t("common.buttons.returnNoSave")}
        </QuestionButton>
      </span>
      <span className={styles.noborderbutton}>
        <QuestionButton variant="secondary" onClickHandler={() => handleDeleteAdditionalInfo()}>
          {i18n.t("common.buttons.deleteAdditionalInfo")}
        </QuestionButton>
      </span>
    </div>
  );
};

export default AccessibilityPlaceCtrlButtons;
