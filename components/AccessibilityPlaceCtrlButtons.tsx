import React, { useEffect, useState } from "react";
import { IconArrowLeft } from "hds-react";
import { useI18n } from "next-localization";
import { useRouter } from "next/router";
import QuestionButton from "./QuestionButton";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { deleteEntrancePlace, revertEntrancePlace } from "../state/reducers/additionalInfoSlice";
import { AccessibilityPlaceCtrlButtonsProps } from "../types/general";
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
    setPageSaved(true);
    router.back();
    // todo: if current router.back() approach not working use e.g router.push and store page-edit id to state
  };

  const hasInvalidValidations = () => entrancePlaceBoxes.some((box) => box.invalidValues?.length > 0);

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
      <QuestionButton variant="secondary" iconLeft={<IconArrowLeft />} onClickHandler={handleSaveAndReturn} disabled={hasInvalidValidations()}>
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
