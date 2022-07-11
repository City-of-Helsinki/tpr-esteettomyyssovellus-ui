import React, { ChangeEvent, useRef, useState } from "react";
import {
  Checkbox,
  IconCross,
  IconLink,
  IconMinus,
  IconPlus,
  IconUpload,
  Link as HdsLink,
  SelectionGroup,
  TextArea,
  TextInput,
  Tooltip,
} from "hds-react";
import { useI18n } from "next-localization";
import QuestionButton from "./QuestionButton";
import QuestionInfo from "./QuestionInfo";
import {
  addInvalidEntranceLocationPhotoValue,
  editEntranceLocationPhoto,
  removeInvalidEntranceLocationPhotoValue,
} from "../state/reducers/additionalInfoSlice";
import { useAppDispatch } from "../state/hooks";
import { EntranceLocationPhoto, EntrancePhotoProps } from "../types/general";
import { BackendEntranceAnswer } from "../types/backendModels";
import styles from "./EntrancePhoto.module.scss";

// usage: entrance location photo page picture components
// notes: this component has both "upload" and "link/url" image components for they are such similar
const EntrancePhoto = ({ entranceLocationPhoto }: EntrancePhotoProps): JSX.Element => {
  const i18n = useI18n();
  const dispatch = useAppDispatch();

  const [onlyLink, setOnlyLink] = useState(false);
  const [linkInput, setLinkInput] = useState(false);
  const [linkText, setLinkText] = useState("");

  const { entrance_id, modifiedAnswer, modifiedPhotoBase64, termsAccepted, invalidValues = [] } = entranceLocationPhoto;
  const { photo_url, photo_text_fi, photo_text_sv, photo_text_en, photo_source_text } = modifiedAnswer || {};

  const hiddenFileInput = useRef<HTMLInputElement>(null);

  const updateLocationPhoto = (updatedLocationPhoto: EntranceLocationPhoto) => {
    dispatch(
      editEntranceLocationPhoto({
        entrance_id,
        updatedLocationPhoto,
      })
    );
  };

  const handleAddInvalidValue = (invalidFieldId: string, invalidFieldLabel: string) => {
    dispatch(
      addInvalidEntranceLocationPhotoValue({
        entrance_id,
        invalidFieldId,
        invalidFieldLabel,
      })
    );
  };

  const handleRemoveInvalidValue = (invalidFieldIdToRemove: string) => {
    dispatch(
      removeInvalidEntranceLocationPhotoValue({
        entrance_id,
        invalidFieldIdToRemove,
      })
    );
  };

  const handleChangePicture = () => {
    updateLocationPhoto({
      ...entranceLocationPhoto,
      modifiedAnswer: { ...((modifiedAnswer || {}) as BackendEntranceAnswer), photo_url: undefined },
      modifiedPhotoBase64: undefined,
    });
  };

  const handleAddImageFromDevice = (): void => {
    setOnlyLink(false);

    if (hiddenFileInput && hiddenFileInput.current) {
      hiddenFileInput.current.click();
    }
  };

  const handleAddImageLink = (): void => {
    setOnlyLink(true);
    setLinkInput(true);
    setLinkText("");
  };

  // todo: maybe needs more refined error message if not found image (?)
  /*
  const validateUrlIsImage = async (url: string) => {
    const res = await fetch(url).catch((err) => console.log("ERROR", err));
    if (res && res.status === 200) {
      return true;
    }
    return false;
  };
  */

  const handleImageAdded = async (e?: ChangeEvent<HTMLInputElement>) => {
    if (e && e.target.files && e.target.files.length > 0) {
      const img = e.target.files[0];

      // Read the image file and store it as a base64 string
      const reader = new FileReader();
      reader.onload = (fileEvt: ProgressEvent<FileReader>) => {
        if (fileEvt && fileEvt.target && fileEvt.target.result) {
          const base64 = fileEvt.target.result as string;

          updateLocationPhoto({
            ...entranceLocationPhoto,
            modifiedAnswer: { ...((modifiedAnswer || {}) as BackendEntranceAnswer), photo_url: undefined },
            modifiedPhotoBase64: base64,
            termsAccepted: false,
          });
        }
      };
      reader.onerror = () => {
        console.log("ERROR", reader.error);
      };
      reader.readAsDataURL(img);
    }
  };

  const handleConfirmImageLink = async (fieldId: string, fieldLabel: string) => {
    // Don't validate the image anymore, since this caused CORS issues with aineistopankki.hel.fi
    // const isImage = await validateUrlIsImage(linkText);
    const isImage = true;
    if (isImage) {
      updateLocationPhoto({
        ...entranceLocationPhoto,
        modifiedAnswer: { ...((modifiedAnswer || {}) as BackendEntranceAnswer), photo_url: linkText },
        modifiedPhotoBase64: undefined,
        termsAccepted: false,
      });

      handleRemoveInvalidValue(fieldId);
      setLinkInput(false);
    } else {
      handleAddInvalidValue(fieldId, fieldLabel);
    }
  };

  const handleOnDelete = () => {
    updateLocationPhoto({
      ...entranceLocationPhoto,
      modifiedAnswer: {
        ...((modifiedAnswer || {}) as BackendEntranceAnswer),
        photo_url: undefined,
        photo_text_fi: undefined,
        photo_text_sv: undefined,
        photo_text_en: undefined,
        photo_source_text: undefined,
      },
      modifiedPhotoBase64: undefined,
    });
    setLinkInput(false);
  };

  // only update state after X (0.5) sec from prev KeyDown, set Alt text with correct lang
  // let timer: NodeJS.Timeout;
  const handleAddAltText = (evt: ChangeEvent<HTMLTextAreaElement>, language: string, fieldLabel: string) => {
    const fieldId = evt.currentTarget.id;
    const altText = evt.currentTarget.value;
    /*
    clearTimeout(timer);
    timer = setTimeout(() => {
      dispatch(setAlt({ questionId, language, value, compId: id }));
    }, 500);
    */
    updateLocationPhoto({
      ...entranceLocationPhoto,
      modifiedAnswer: { ...((modifiedAnswer || {}) as BackendEntranceAnswer), [`photo_text_${language}`]: altText },
    });

    if (language === "fi") {
      // remove or add mandatory alt fi validation to state
      if (altText && altText !== "") {
        handleRemoveInvalidValue(fieldId);
      } else if (altText === "") {
        handleAddInvalidValue(fieldId, fieldLabel);
      }
    }
  };

  const handleTermsChange = (evt: ChangeEvent<HTMLInputElement>, fieldLabel: string) => {
    const fieldId = evt.currentTarget.id;
    const termsChecked = evt.target.checked;

    updateLocationPhoto({
      ...entranceLocationPhoto,
      termsAccepted: termsChecked,
    });

    if (termsChecked) {
      handleRemoveInvalidValue(fieldId);
    } else {
      handleAddInvalidValue(fieldId, fieldLabel);
    }
  };

  const handleSourceChange = (evt: ChangeEvent<HTMLInputElement>, fieldLabel: string) => {
    const fieldId = evt.currentTarget.id;
    const source = evt.currentTarget.value;

    updateLocationPhoto({
      ...entranceLocationPhoto,
      modifiedAnswer: { ...((modifiedAnswer || {}) as BackendEntranceAnswer), photo_source_text: source },
    });

    // remove or add mandatory source validation to state
    if (source && source !== "") {
      handleRemoveInvalidValue(fieldId);
    } else if (source === "") {
      handleAddInvalidValue(fieldId, fieldLabel);
    }
  };

  const handleLinkText = (evt: ChangeEvent<HTMLInputElement>, fieldLabel: string) => {
    const fieldId = evt.currentTarget.id;
    const text = evt.currentTarget.value;
    setLinkText(text);

    if (text && text !== "") {
      handleRemoveInvalidValue(fieldId);
    } else if (text === "") {
      handleAddInvalidValue(fieldId, fieldLabel);
    }
  };

  return (
    <div className={styles.maincontainer}>
      {(modifiedPhotoBase64 || photo_url) && (
        <div className={styles.picture}>
          <img src={modifiedPhotoBase64 ?? photo_url} alt="" />
        </div>
      )}

      <div className={styles.inputcontainer}>
        {linkInput && (
          <div className={styles.inputfield}>
            <TextInput
              id={"chooseimg"}
              label={onlyLink ? i18n.t("additionalInfo.pictureInputLink") : i18n.t("additionalInfo.pictureInput")}
              placeholder={photo_url ?? ""}
              disabled={!onlyLink}
              onChange={(e) => handleLinkText(e, onlyLink ? i18n.t("additionalInfo.pictureInputLink") : i18n.t("additionalInfo.pictureInput"))}
              defaultValue={photo_url ?? ""}
              invalid={invalidValues.some((v) => v.fieldId === "chooseimg")}
              errorText={invalidValues.some((v) => v.fieldId === "chooseimg") ? i18n.t("additionalInfo.picureLinkErrorText") : ""}
            />
          </div>
        )}

        <div className={styles.inputbuttons}>
          {(modifiedPhotoBase64 || photo_url) && (
            <QuestionButton variant="secondary" onClickHandler={handleChangePicture}>
              {i18n.t("additionalInfo.changePicture")}
            </QuestionButton>
          )}

          {!modifiedPhotoBase64 && !photo_url && !linkInput && (
            <>
              <QuestionButton variant="secondary" iconRight={<IconUpload aria-hidden />} onClickHandler={handleAddImageFromDevice}>
                {i18n.t("additionalInfo.chooseFromDevice")}
              </QuestionButton>
              <QuestionButton variant="secondary" iconRight={<IconLink aria-hidden />} onClickHandler={() => handleAddImageLink()}>
                {i18n.t("additionalInfo.addPictureLink")}
              </QuestionButton>

              <input type="file" className={styles.hidden} ref={hiddenFileInput} onChange={handleImageAdded} />
            </>
          )}

          {linkInput && (
            <QuestionButton
              variant="secondary"
              onClickHandler={() =>
                handleConfirmImageLink("chooseimg", onlyLink ? i18n.t("additionalInfo.pictureInputLink") : i18n.t("additionalInfo.pictureInput"))
              }
              disabled={!linkText}
            >
              {i18n.t("additionalInfo.pictureLinkConfirmButton")}
            </QuestionButton>
          )}

          {(modifiedPhotoBase64 || photo_url || linkInput) && (
            <QuestionButton variant="secondary" iconRight={<IconCross aria-hidden />} onClickHandler={() => handleOnDelete()}>
              {i18n.t("additionalInfo.cancelPicture")}
            </QuestionButton>
          )}
        </div>
      </div>

      {(modifiedPhotoBase64 || photo_url) && (
        <div className={styles.lowercontentcontainer}>
          <div className={styles.altcontainer}>
            <TextArea
              id={"text-fin"}
              label={i18n.t("additionalInfo.pictureLabel")}
              helperText={i18n.t("additionalInfo.pictureHelperText")}
              required
              tooltipButtonLabel={i18n.t("additionalInfo.generalTooptipButtonLabel")}
              tooltipLabel={i18n.t("additionalInfo.generalTooptipLabel")}
              tooltipText={i18n.t("additionalInfo.altToolTipContent")}
              onChange={(evt: ChangeEvent<HTMLTextAreaElement>) => handleAddAltText(evt, "fi", i18n.t("additionalInfo.pictureLabel"))}
              value={photo_text_fi ?? ""}
              invalid={invalidValues.some((v) => v.fieldId === "text-fin")}
              errorText={invalidValues.some((v) => v.fieldId === "text-fin") ? i18n.t("additionalInfo.addCommentFiErrorText") : ""}
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
                  id={"text-sv"}
                  label={i18n.t("additionalInfo.pictureLabelSwe")}
                  helperText={i18n.t("additionalInfo.pictureHelperTextSwe")}
                  onChange={(evt: ChangeEvent<HTMLTextAreaElement>) => handleAddAltText(evt, "sv", i18n.t("additionalInfo.pictureLabelSwe"))}
                  value={photo_text_sv ?? ""}
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
                  id={"text-eng"}
                  label={i18n.t("additionalInfo.pictureLabelEng")}
                  helperText={i18n.t("additionalInfo.pictureHelperTextEng")}
                  onChange={(evt: ChangeEvent<HTMLTextAreaElement>) => handleAddAltText(evt, "en", i18n.t("additionalInfo.pictureLabelEng"))}
                  value={photo_text_en ?? ""}
                />
              </QuestionInfo>
            </div>
          </div>

          <div className={styles.picturetermscontainer}>
            <SelectionGroup label={i18n.t("additionalInfo.sharePictureLicenseLabel")} required>
              <Checkbox
                id={"picture-license"}
                label={
                  <span>
                    {`${i18n.t("additionalInfo.sharePictureLicenseText")} `}
                    <HdsLink
                      href="https://creativecommons.org/licenses/by/4.0/"
                      size="M"
                      openInNewTab
                      openInNewTabAriaLabel={i18n.t("common.opensInANewTab")}
                      external
                      openInExternalDomainAriaLabel={i18n.t("common.opensExternal")}
                      disableVisitedStyles
                    >
                      {i18n.t("additionalInfo.sharePictureLicense")}
                    </HdsLink>
                  </span>
                }
                name="agreeToPictureTerms"
                checked={termsAccepted}
                onChange={(evt) => handleTermsChange(evt, i18n.t("additionalInfo.sharePictureLicenseLabel"))}
                errorText={invalidValues.some((v) => v.fieldId === "picture-license") ? i18n.t("additionalInfo.pictureTermsErrorText") : ""}
              />
            </SelectionGroup>
            <Tooltip> {i18n.t("additionalInfo.pictureTermsInfoText")} </Tooltip>
          </div>

          <div className={styles.picturesourcecontainer}>
            <TextInput
              id={"tooltip-source"}
              tooltipButtonLabel={i18n.t("additionalInfo.generalTooptipLabel")}
              tooltipLabel={i18n.t("additionalInfo.generalTooptipLabel")}
              tooltipText={i18n.t("additionalInfo.sourceTooltipText")}
              label={i18n.t("additionalInfo.sourceTooltipMainLabel")}
              onChange={(evt) => handleSourceChange(evt, i18n.t("additionalInfo.sourceTooltipMainLabel"))}
              required
              defaultValue={photo_source_text ?? ""}
              invalid={invalidValues.some((v) => v.fieldId === "tooltip-source")}
              errorText={invalidValues.some((v) => v.fieldId === "tooltip-source") ? i18n.t("additionalInfo.picureSourceErrorText") : ""}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EntrancePhoto;
