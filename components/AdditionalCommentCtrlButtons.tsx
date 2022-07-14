import React, { useCallback, useEffect, useState } from "react";
import { IconArrowLeft } from "hds-react";
import { useI18n } from "next-localization";
import { useRouter } from "next/router";
import QuestionButton from "./QuestionButton";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import {
  // addInvalidQuestionBlockCommentValue,
  removeQuestionBlockComment,
  revertQuestionBlockComment,
  setQuestionBlockCommentValid,
} from "../state/reducers/additionalInfoSlice";
import { AdditionalCommentCtrlButtonsProps } from "../types/general";
import styles from "./AdditionalCommentCtrlButtons.module.scss";

// usage: save and return without saving buttons in additionalinfo page
// notes: only save if save clicked, if return no save or back button (browser, mice etc) returns to old or empty value
const AdditionalCommentCtrlButtons = ({ questionBlockId, questionBlockComment }: AdditionalCommentCtrlButtonsProps): JSX.Element => {
  const i18n = useI18n();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [pageSaved, setPageSaved] = useState(false);

  const curServicepointId = useAppSelector((state) => state.formReducer.currentServicepointId);
  const curEntranceId = useAppSelector((state) => state.formReducer.currentEntranceId);

  /*
  const handleAddInvalidValue = (invalidFieldId: string, invalidFieldLabel: string) => {
    dispatch(
      addInvalidQuestionBlockCommentValue({
        entrance_id: curEntranceId,
        question_block_id: questionBlockId,
        invalidFieldId,
        invalidFieldLabel,
      })
    );
  };
  */

  const validateForm = () => {
    // Check whether all data on the form is valid
    // Everything needs to be validated, so make sure lazy evaluation is not used
    const { modifiedComment } = questionBlockComment || {};
    const { comment_text_fi } = modifiedComment || {};
    const isFormValid = true;

    // TODO - check if any validation is needed for text comments
    if (!comment_text_fi || comment_text_fi.length === 0) {
      /*
      handleAddInvalidValue("text-fin", i18n.t("additionalInfo.pictureLabel"));
      isFormValid = false;
      */
      console.log(comment_text_fi);
    }

    dispatch(setQuestionBlockCommentValid(isFormValid));

    return isFormValid;
  };

  // Initialise the validation on first render only, using a workaround utilising useEffect with empty dependency array
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const useMountEffect = (fun: () => void) => useEffect(fun, []);
  useMountEffect(validateForm);

  const revertComment = useCallback(() => {
    // Revert this question block comment using existing values
    dispatch(
      revertQuestionBlockComment({
        entrance_id: curEntranceId,
        question_block_id: questionBlockId,
      })
    );
  }, [curEntranceId, questionBlockId, dispatch]);

  // handle user clicking back button on browser / mouse ->
  // needs to remove the "saved" values same as clicking return no save
  // also check if pageSaved (saved button clicked), if so then just return
  useEffect(() => {
    router.beforePopState(() => {
      if (!pageSaved) {
        revertComment();
      }
      return true;
    });
  }, [pageSaved, revertComment, router]);

  const getPathHash = () => {
    // Get the question block id for returning to the block via the path hash
    return `#questionblockid-${questionBlockId}`;
  };

  // don't alter already saved state, set pageSaved to true
  const handleSaveAndReturn = () => {
    if (validateForm()) {
      setPageSaved(true);

      const url =
        curEntranceId > 0
          ? `/entranceAccessibility/${curServicepointId}/${curEntranceId}${getPathHash()}`
          : `/entranceAccessibility/${curServicepointId}${getPathHash()}`;
      router.push(url);
    }
  };

  // handle user clicked return no save button
  const handleReturnNoSave = () => {
    revertComment();

    const url =
      curEntranceId > 0
        ? `/entranceAccessibility/${curServicepointId}/${curEntranceId}${getPathHash()}`
        : `/entranceAccessibility/${curServicepointId}${getPathHash()}`;
    router.push(url);
  };

  const handleDeleteAdditionalInfo = () => {
    dispatch(
      removeQuestionBlockComment({
        entrance_id: curEntranceId,
        question_block_id: questionBlockId,
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

export default AdditionalCommentCtrlButtons;
