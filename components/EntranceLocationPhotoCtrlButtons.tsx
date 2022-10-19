import React, { useCallback, useEffect, useState } from "react";
import { IconArrowLeft } from "hds-react";
import { useI18n } from "next-localization";
import { useRouter } from "next/router";
import QuestionButton from "./QuestionButton";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import {
  addInvalidEntranceLocationPhotoValue,
  removeInvalidEntranceLocationPhotoValue,
  revertEntranceLocationPhoto,
  setEntranceLocationPhotoValid,
  setEntranceLocationPhotoValidationTime,
} from "../state/reducers/additionalInfoSlice";
import { EntranceLocationPhotoCtrlButtonsProps } from "../types/general";
import styles from "./EntranceLocationPhotoCtrlButtons.module.scss";

// usage: save and return without saving buttons in additionalinfo page
// notes: only save if save clicked, if return no save or back button (browser, mice etc) returns to old or empty value
const EntranceLocationPhotoCtrlButtons = ({ entranceLocationPhoto }: EntranceLocationPhotoCtrlButtonsProps): JSX.Element => {
  const i18n = useI18n();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [pageSaved, setPageSaved] = useState(false);

  const curServicepointId = useAppSelector((state) => state.formReducer.currentServicepointId);
  const curEntranceId = useAppSelector((state) => state.formReducer.currentEntranceId);
  const checksum = useAppSelector((state) => state.generalSlice.checksum);

  const handleAddInvalidValue = (invalidFieldId: string, invalidFieldLabel: string, invalidMessage: string) => {
    dispatch(
      addInvalidEntranceLocationPhotoValue({
        entrance_id: curEntranceId,
        invalidFieldId,
        invalidFieldLabel,
        invalidMessage,
      })
    );
  };

  const handleRemoveInvalidValue = (invalidFieldIdToRemove: string) => {
    dispatch(
      removeInvalidEntranceLocationPhotoValue({
        entrance_id: curEntranceId,
        invalidFieldIdToRemove,
      })
    );
  };

  const validateForm = () => {
    // Check whether all data on the form is valid
    // Everything needs to be validated, so make sure lazy evaluation is not used
    const { modifiedAnswer, modifiedPhotoBase64, termsAccepted } = entranceLocationPhoto;
    const { photo_url, photo_text_fi, photo_source_text } = modifiedAnswer || {};
    let isFormValid = true;

    if (modifiedPhotoBase64 || photo_url) {
      // Photo added, so validate the mandatory fields
      if (!photo_text_fi || photo_text_fi.length === 0) {
        handleAddInvalidValue("text-fin", i18n.t("additionalInfo.pictureLabel"), i18n.t("common.message.invalid"));
        isFormValid = false;
      } else {
        handleRemoveInvalidValue("text-fin");
      }
      if (!termsAccepted) {
        handleAddInvalidValue("picture-license", i18n.t("additionalInfo.sharePictureLicenseLabel"), i18n.t("common.message.invalid"));
        isFormValid = false;
      } else {
        handleRemoveInvalidValue("picture-license");
      }
      if (!photo_source_text || photo_source_text.length === 0) {
        handleAddInvalidValue("tooltip-source", i18n.t("additionalInfo.sourceTooltipMainLabel"), i18n.t("common.message.invalid"));
        isFormValid = false;
      } else {
        handleRemoveInvalidValue("tooltip-source");
      }
    }

    // Store the time when the validation occurred to force the validation summary to be scrolled into view again if needed
    dispatch(setEntranceLocationPhotoValidationTime(new Date().getTime()));

    dispatch(setEntranceLocationPhotoValid(isFormValid));

    return isFormValid;
  };

  // Initialise the validation on first render only, using a workaround utilising useEffect with empty dependency array
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const useMountEffect = (fun: () => void) => useEffect(fun, []);
  useMountEffect(validateForm);

  const revertLocationPhoto = useCallback(() => {
    // Revert this entrance location and photo using existing values
    dispatch(
      revertEntranceLocationPhoto({
        entrance_id: curEntranceId,
      })
    );
  }, [curEntranceId, dispatch]);

  // handle user clicking back button on browser / mouse ->
  // needs to remove the "saved" values same as clicking return no save
  // also check if pageSaved (saved button clicked), if so then just return
  useEffect(() => {
    router.beforePopState(() => {
      if (!pageSaved) {
        revertLocationPhoto();
      }
      return true;
    });
  }, [pageSaved, revertLocationPhoto, router]);

  const getPathHash = () => {
    // Get the question block id for returning to the block via the path hash
    const { question_block_id } = entranceLocationPhoto;
    return `#questionblockid-${question_block_id}`;
  };

  // don't alter already saved state, set pageSaved to true
  const handleSaveAndReturn = () => {
    if (validateForm()) {
      setPageSaved(true);

      const url =
        curEntranceId > 0
          ? `/entranceAccessibility/${curServicepointId}/${curEntranceId}?checksum=${checksum}${getPathHash()}`
          : `/entranceAccessibility/${curServicepointId}?checksum=${checksum}${getPathHash()}`;
      router.push(url);
    }
  };

  // handle user clicked return no save button
  const handleReturnNoSave = () => {
    revertLocationPhoto();

    const url =
      curEntranceId > 0
        ? `/entranceAccessibility/${curServicepointId}/${curEntranceId}?checksum=${checksum}${getPathHash()}`
        : `/entranceAccessibility/${curServicepointId}?checksum=${checksum}${getPathHash()}`;
    router.push(url);
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
    </div>
  );
};

export default EntranceLocationPhotoCtrlButtons;
