import React, { ChangeEvent, KeyboardEvent, useRef, useState } from "react";
import { IconPlus, IconMinus, TextArea, TextInput, Checkbox, Tooltip, SelectionGroup, IconUpload, IconLink, IconCross } from "hds-react";
import { useI18n } from "next-localization";
import QuestionButton from "./QuestionButton";
import QuestionInfo from "./QuestionInfo";
import { addInvalidEntrancePlaceBoxValue, editEntrancePlaceBox, removeInvalidEntrancePlaceBoxValue } from "../state/reducers/additionalInfoSlice";
import { useAppDispatch } from "../state/hooks";
import { AccessibilityPlacePictureProps, EntrancePlaceBox } from "../types/general";
import { BackendEntrancePlace } from "../types/backendModels";
import styles from "./AccessibilityPlacePicture.module.scss";

// usage: accessibility place page picture components
// notes: this component has both "upload" and "link/url" image components for they are such similar
const AccessibilityPlacePicture = ({ entrancePlaceBox }: AccessibilityPlacePictureProps): JSX.Element => {
  const i18n = useI18n();
  const dispatch = useAppDispatch();

  const [onlyLink, setOnlyLink] = useState(false);
  const [linkInput, setLinkInput] = useState(false);
  const [linkText, setLinkText] = useState("");

  const { entrance_id, place_id, order_number, modifiedBox, photoBase64, termsAccepted, invalidValues = [] } = entrancePlaceBox;
  const { photo_url, photo_text_fi, photo_text_sv, photo_text_en, photo_source_text } = modifiedBox || {};

  const currentId = order_number;

  const hiddenFileInput = useRef<HTMLInputElement>(null);

  const updatePlaceBox = (updatedPlaceBox: EntrancePlaceBox) => {
    dispatch(
      editEntrancePlaceBox({
        entrance_id,
        place_id,
        order_number,
        updatedPlaceBox,
      })
    );
  };

  const handleAddInvalidValue = (invalidValueToAdd: string) => {
    dispatch(
      addInvalidEntrancePlaceBoxValue({
        entrance_id,
        place_id,
        order_number,
        invalidValueToAdd,
      })
    );
  };

  const handleRemoveInvalidValue = (invalidValueToRemove: string) => {
    dispatch(
      removeInvalidEntrancePlaceBoxValue({
        entrance_id,
        place_id,
        order_number,
        invalidValueToRemove,
      })
    );
  };

  const handleChangePicture = () => {
    updatePlaceBox({
      ...entrancePlaceBox,
      modifiedBox: { ...((modifiedBox || {}) as BackendEntrancePlace), photo_url: undefined },
      photoBase64: undefined,
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
  const validateUrlIsImage = async (url: string) => {
    const res = await fetch(url);
    if (res.status === 200) {
      return true;
    }
    return false;
  };

  const handleImageAdded = async (e?: ChangeEvent<HTMLInputElement>) => {
    if (e && e.target.files && e.target.files.length > 0) {
      const img = e.target.files[0];

      // Read the image file and store it as a base64 string
      const reader = new FileReader();
      reader.onload = (fileEvt: ProgressEvent<FileReader>) => {
        if (fileEvt && fileEvt.target && fileEvt.target.result) {
          const base64 = fileEvt.target.result as string;

          updatePlaceBox({
            ...entrancePlaceBox,
            photoBase64: base64,
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

  const handleConfirmImageLink = async () => {
    const isImage = await validateUrlIsImage(linkText);
    if (isImage) {
      updatePlaceBox({
        ...entrancePlaceBox,
        modifiedBox: { ...((modifiedBox || {}) as BackendEntrancePlace), photo_url: linkText },
        termsAccepted: false,
      });

      handleRemoveInvalidValue("url");
      setLinkInput(false);
    } else {
      handleAddInvalidValue("url");
    }
  };

  const handleOnDelete = () => {
    updatePlaceBox({
      ...entrancePlaceBox,
      modifiedBox: { ...((modifiedBox || {}) as BackendEntrancePlace), photo_url: undefined },
      photoBase64: undefined,
    });
    setLinkInput(false);
  };

  // only update state after X (0.5) sec from prev KeyDown, set Alt text with correct lang
  // let timer: NodeJS.Timeout;
  const handleAddAlt = (evt: KeyboardEvent<HTMLTextAreaElement>, language: string) => {
    const altText = evt.currentTarget.value;
    /*
    clearTimeout(timer);
    timer = setTimeout(() => {
      dispatch(setAlt({ questionId, language, value, compId: id }));
    }, 500);
    */
    updatePlaceBox({
      ...entrancePlaceBox,
      modifiedBox: { ...((modifiedBox || {}) as BackendEntrancePlace), [`photo_text_${language}`]: altText },
    });

    // remove or add mandatory alt fi validation to state
    if (altText && altText !== "") {
      handleRemoveInvalidValue("fi");
    } else if (altText === "") {
      handleAddInvalidValue("fi");
    }
  };

  const handleTermsChange = (termsChecked: boolean) => {
    updatePlaceBox({
      ...entrancePlaceBox,
      termsAccepted: termsChecked,
    });

    if (termsChecked) {
      handleRemoveInvalidValue("sharelicense");
    } else {
      handleAddInvalidValue("sharelicense");
    }
  };

  const handleSourceChange = (evt: ChangeEvent<HTMLInputElement>) => {
    const source = evt.currentTarget.value;

    updatePlaceBox({
      ...entrancePlaceBox,
      modifiedBox: { ...((modifiedBox || {}) as BackendEntrancePlace), photo_source_text: source },
    });

    // remove or add mandatory source validation to state
    if (source && source !== "") {
      handleRemoveInvalidValue("source");
    } else if (source === "") {
      handleAddInvalidValue("source");
    }
  };

  const handleLinkText = (evt: ChangeEvent<HTMLInputElement>) => {
    const text = evt.currentTarget.value;
    setLinkText(text);

    if (text && text !== "") {
      handleRemoveInvalidValue("url");
    } else if (text === "") {
      handleAddInvalidValue("url");
    }
  };

  // init validation errors if needed
  /*
  useEffect(() => {
    // if addinfo page with no curimage or initvalue add default validation errors
    if (!curImage || !initValue) {
      handleAddInvalidValue(["url", "fi", "source", "sharelicense"]);
    } else {
      // set terms checked if already validated image due to always checked otherwise cant save
      setTermsChecked(true);
    }
  }, [curImage, handleAddInvalidValue, initValue]);
  */

  return (
    <div className={styles.maincontainer}>
      {(photoBase64 || photo_url) && (
        <div className={styles.picture}>
          <img src={photoBase64 ?? photo_url} alt="" />
        </div>
      )}

      <div className={styles.inputcontainer}>
        {linkInput && (
          <div className={styles.inputfield}>
            <TextInput
              id={`chooseimg-${currentId}`}
              label={onlyLink ? i18n.t("additionalInfo.pictureInputLink") : i18n.t("additionalInfo.pictureInput")}
              placeholder={photo_url ?? ""}
              disabled={!onlyLink}
              onChange={(e) => handleLinkText(e)}
              defaultValue={photo_url ?? ""}
              invalid={invalidValues.includes("url")}
              errorText={invalidValues.includes("url") ? i18n.t("additionalInfo.picureLinkErrorText") : ""}
            />
          </div>
        )}

        <div className={styles.inputbuttons}>
          {(photoBase64 || photo_url) && (
            <QuestionButton variant="secondary" onClickHandler={handleChangePicture}>
              {i18n.t("additionalInfo.changePicture")}
            </QuestionButton>
          )}

          {!photoBase64 && !photo_url && !linkInput && (
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
            <QuestionButton variant="secondary" onClickHandler={() => handleConfirmImageLink()} disabled={!linkText}>
              {i18n.t("additionalInfo.pictureLinkConfirmButton")}
            </QuestionButton>
          )}

          {(photoBase64 || photo_url || linkInput) && (
            <QuestionButton variant="secondary" iconRight={<IconCross aria-hidden />} onClickHandler={() => handleOnDelete()}>
              {i18n.t("additionalInfo.cancelPicture")}
            </QuestionButton>
          )}
        </div>
      </div>

      {photoBase64 || photo_url ? (
        <div className={styles.lowercontentcontainer}>
          <div className={styles.altcontainer}>
            <TextArea
              id={`text-fin-${currentId}`}
              label={i18n.t("additionalInfo.pictureLabel")}
              helperText={i18n.t("additionalInfo.pictureHelperText")}
              required
              tooltipButtonLabel={i18n.t("additionalInfo.generalTooptipButtonLabel")}
              tooltipLabel={i18n.t("additionalInfo.generalTooptipLabel")}
              tooltipText={i18n.t("additionalInfo.altToolTipContent")}
              onKeyUp={(evt: KeyboardEvent<HTMLTextAreaElement>) => handleAddAlt(evt, "fi")}
              defaultValue={photo_text_fi ?? ""}
              invalid={invalidValues.includes("fi")}
              errorText={invalidValues.includes("fi") ? i18n.t("additionalInfo.addCommentFiErrorText") : ""}
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
                  id={`text-sv-${currentId}`}
                  label={i18n.t("additionalInfo.pictureLabelSwe")}
                  helperText={i18n.t("additionalInfo.pictureHelperTextSwe")}
                  onKeyUp={(evt: KeyboardEvent<HTMLTextAreaElement>) => handleAddAlt(evt, "sv")}
                  defaultValue={photo_text_sv ?? ""}
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
                  id={`text-eng-${currentId}`}
                  label={i18n.t("additionalInfo.pictureLabelEng")}
                  helperText={i18n.t("additionalInfo.pictureHelperTextEng")}
                  onKeyUp={(evt: KeyboardEvent<HTMLTextAreaElement>) => handleAddAlt(evt, "en")}
                  defaultValue={photo_text_en ?? ""}
                />
              </QuestionInfo>
            </div>
          </div>

          <div className={styles.picturetermscontainer}>
            <SelectionGroup label={i18n.t("additionalInfo.sharePictureLicenseLabel")}>
              <Checkbox
                id={`picture-license-${currentId}`}
                label={`${i18n.t("additionalInfo.sharePictureLicenseText")} ${i18n.t("additionalInfo.sharePictureLicense")}`}
                name="agreeToPictureTerms"
                checked={termsAccepted}
                onChange={(evt) => handleTermsChange(evt.target.checked)}
                errorText={invalidValues.includes("sharelicense") ? i18n.t("additionalInfo.pictureTermsErrorText") : ""}
              />
            </SelectionGroup>
            <Tooltip> {i18n.t("additionalInfo.pictureTermsInfoText")} </Tooltip>
          </div>

          <div className={styles.picturesourcecontainer}>
            <TextInput
              id={`tooltip-source-${currentId}`}
              tooltipButtonLabel={i18n.t("additionalInfo.generalTooptipLabel")}
              tooltipLabel={i18n.t("additionalInfo.generalTooptipLabel")}
              tooltipText={i18n.t("additionalInfo.sourceTooltipText")}
              label={i18n.t("additionalInfo.sourceTooltipMainLabel")}
              onChange={handleSourceChange}
              required
              defaultValue={photo_source_text ?? ""}
              invalid={invalidValues.includes("source")}
              errorText={invalidValues.includes("source") ? i18n.t("additionalInfo.picureSourceErrorText") : ""}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AccessibilityPlacePicture;
