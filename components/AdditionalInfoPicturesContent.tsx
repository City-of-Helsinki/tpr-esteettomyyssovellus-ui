import React, { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { IconPlus, IconMinus, TextArea, TextInput, Checkbox, Tooltip, SelectionGroup } from "hds-react";
import { useI18n } from "next-localization";
import { v4 as uuidv4 } from "uuid";
import styles from "./AdditionalInfoPicturesContent.module.scss";
import QuestionButton from "./QuestionButton";
import QuestionInfo from "./QuestionInfo";
import { addInvalidValues, addPicture, removeInvalidValues, removePicture, setAlt, setPictureSource } from "../state/reducers/additionalInfoSlice";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { AdditionalContentProps } from "../types/general";

// usage: additionalinfo page picture components
// notes: this component has both "upload" and "link/url" image components for they are such similar
const AdditionalInfoPicturesContent = ({ questionId, compId, onlyLink = false, onDelete, initValue }: AdditionalContentProps): JSX.Element => {
  const i18n = useI18n();
  const dispatch = useAppDispatch();
  const currentId = compId;
  const curAddInfo = useAppSelector((state) => state.additionalInfoReducer.additionalInfo[questionId]);
  const curImage = curAddInfo?.pictures?.filter((pic) => pic.id === currentId)[0];
  const [linkText, setLinkText] = useState("");
  const [termsChecked, setTermsChecked] = useState(false);

  // get current invalid fields for validation
  const currentInvalids = useAppSelector((state) =>
    state.additionalInfoReducer.additionalInfo[questionId].invalidValues?.find((invs) => invs.id === compId)
  );

  // hidden input field which is clicked after custom button is pressed
  const hiddenFileInput = useRef<HTMLInputElement>(null);

  // remove validation values respectively
  const handleAddInvalidValues = useCallback(
    (answersToAdd: string[]) => {
      dispatch(
        addInvalidValues({
          questionId,
          compId: currentId,
          invalidAnswers: answersToAdd,
        })
      );
    },
    [currentId, questionId, dispatch]
  );

  // remove image from state
  const handleRemoveImage = () => {
    dispatch(removePicture({ questionId, currentId }));
    // also adds errors back for validation
    handleAddInvalidValues(["url", "fi", "source", "sharelicense"]);
  };

  // click the hidden file input and remove previous image if present
  const handleAddImageToInput = (): void => {
    if (currentId) {
      handleRemoveImage();
    }

    if (hiddenFileInput && hiddenFileInput.current) {
      hiddenFileInput.current.click();
    }
  };

  // remove validation values respectively
  const handleremoveInvalidValue = (remoTarget: string) => {
    dispatch(
      removeInvalidValues({
        questionId,
        compId: currentId,
        removeTarget: remoTarget,
      })
    );
  };

  // todo: maybe needs more refined error message if not found image (?)
  const validateUrlIsImage = async (url: string) => {
    const res = await fetch(url);
    if (res.status === 200) {
      return true;
    }
    setLinkText("");
    return false;
  };

  // add image to state, in else when adding just the img link/url
  const handleImageAdded = async (e?: ChangeEvent<HTMLInputElement>) => {
    setTermsChecked(false);
    // this if is for upload image component
    if (e && e.target.files && e.target.files.length > 0) {
      const img = e.target.files[0];
      const imgBase64 = window.URL.createObjectURL(img);
      const payload = {
        qNumber: questionId,
        id: currentId,
        name: img.name,
        base: imgBase64,
        uuid: uuidv4(),
        url: "",
        altText: {
          fi: "",
          sv: "",
          en: "",
        },
        source: "",
      };
      dispatch(addPicture(payload));
      // remove or add mandatory url validation to state
      handleAddInvalidValues(["url", "fi", "source", "sharelicense"]);
      if ((imgBase64 && imgBase64 !== "") || (img.name && img.name !== "")) {
        handleremoveInvalidValue("url");
        //  todo: maybe add url === "" here
      } else if (imgBase64 !== "" || img.name === "") {
        handleAddInvalidValues(["url"]);
      }
      // below for links component (not the upload component)
    } else {
      // validate url inputted has image
      const isImage = await validateUrlIsImage(linkText);
      if (isImage) {
        const payload = {
          qNumber: questionId,
          id: currentId,
          name: "",
          base: linkText,
          url: linkText,
          altText: {
            fi: "",
            sv: "",
            en: "",
          },
          source: "",
        };
        dispatch(addPicture(payload));
        handleremoveInvalidValue("url");
      } else {
        handleAddInvalidValues(["url"]);
      }
    }
  };

  // combined remove and add image
  const handleImageRemoveAndAdded = () => {
    handleRemoveImage();
    handleImageAdded();
  };

  // on delete button clicked chain delete image from store and delete component cb
  const handleOnDelete = () => {
    handleRemoveImage();
    if (onDelete) {
      onDelete();
    }
  };

  // only update state after X (0.5) sec from prev KeyDown, set Alt text with correct lang
  let timer: NodeJS.Timeout;
  const handleAddAlt = (e: React.KeyboardEvent<HTMLTextAreaElement>, language: string, id: number) => {
    const { value } = e.currentTarget;
    clearTimeout(timer);
    timer = setTimeout(() => {
      dispatch(setAlt({ questionId, language, value, compId: id }));
    }, 500);
    // remove or add mandatory alt fi validation to state
    if (value && value !== "") {
      handleremoveInvalidValue("fi");
    } else if (value === "") {
      handleAddInvalidValues(["fi"]);
    }
  };

  // logic for checkbox picture terms using HDS
  // todo: this could be put in to state, or maybe not because only used for validation so no need to save anywhere (?)
  const onCheckChange = () => {
    setTermsChecked(!termsChecked);
    if (!termsChecked) {
      handleremoveInvalidValue("sharelicense");
    } else {
      handleAddInvalidValues(["sharelicense"]);
    }
  };

  // update source on state
  const onSourceChange = (e: ChangeEvent<HTMLInputElement>) => {
    const source = e.currentTarget.value;
    dispatch(setPictureSource({ questionId, source, compId }));
    // remove or add mandatory source validation to state
    if (source && source !== "") {
      handleremoveInvalidValue("source");
    } else if (source === "") {
      handleAddInvalidValues(["source"]);
    }
  };

  // add or remove url validation errors
  const handleLinkText = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.currentTarget;
    if (value.length > 0) {
      setLinkText(value);
    }
    if (value && value !== "") {
      handleremoveInvalidValue("url");
    } else if (value === "") {
      handleAddInvalidValues(["url"]);
    }
  };

  // different buttons depending if upload component or link/url component
  const addFromDeviceButton = !onlyLink ? (
    <QuestionButton variant="secondary" onClickHandler={handleAddImageToInput}>
      {i18n.t("additionalInfo.chooseFromDevice")}
    </QuestionButton>
  ) : (
    <QuestionButton variant="secondary" onClickHandler={() => handleImageRemoveAndAdded()} disabled={!linkText}>
      {i18n.t("additionalInfo.pictureLinkConfirmButton")}
    </QuestionButton>
  );

  // init validation errors if needed
  useEffect(() => {
    // if addinfo page with no curimage or initvalue add default validation errors
    if (!curImage || !initValue) {
      handleAddInvalidValues(["url", "fi", "source", "sharelicense"]);
    } else {
      // set terms checked if already validated image due to always checked otherwise cant save
      setTermsChecked(true);
    }
  }, [curImage, handleAddInvalidValues, initValue]);

  return (
    <div className={styles.maincontainer}>
      <div
        className={styles.inputcontainer}
        style={currentInvalids?.invalidAnswers?.includes("url") ? { alignItems: "center" } : { alignItems: "flex-end" }}
      >
        <span className={styles.inputfield}>
          <TextInput
            // id="{`chooseimg-${currentId}`}"
            id="chooseimg"
            label={onlyLink ? i18n.t("additionalInfo.pictureInputLink") : i18n.t("additionalInfo.pictureInput")}
            placeholder={curImage?.name}
            disabled={!onlyLink}
            onChange={(e) => handleLinkText(e)}
            defaultValue={curImage?.url ? curImage.url : ""}
            invalid={!!currentInvalids?.invalidAnswers?.includes("url")}
            errorText={currentInvalids?.invalidAnswers?.includes("url") ? i18n.t("additionalInfo.picureLinkErrorText") : ""}
          />
        </span>

        {curImage?.base && !onlyLink ? (
          <QuestionButton variant="secondary" onClickHandler={handleAddImageToInput}>
            {i18n.t("additionalInfo.changePicture")}
          </QuestionButton>
        ) : (
          addFromDeviceButton
        )}
        <QuestionButton variant="secondary" onClickHandler={() => handleOnDelete()}>
          {i18n.t("additionalInfo.cancelPicture")}
        </QuestionButton>
        {onlyLink ? null : <input type="file" className={styles.hidden} ref={hiddenFileInput} onChange={handleImageAdded} />}
      </div>
      {/* todo: maybe remove base and use url -> need url for upload from ~Azure */}
      {curImage?.base || curImage?.url ? (
        <div className={styles.lowercontentcontainer}>
          <div className={styles.picrutepreviewcontainer}>
            <div style={{ backgroundImage: `url(${curImage?.base})` }} />
          </div>
          <div className={styles.altcontainer}>
            <TextArea
              id={`text-fin-${currentId}`}
              label={i18n.t("additionalInfo.pictureLabel")}
              helperText={i18n.t("additionalInfo.pictureHelperText")}
              required
              tooltipButtonLabel={i18n.t("additionalInfo.generalTooptipButtonLabel")}
              tooltipLabel={i18n.t("additionalInfo.generalTooptipLabel")}
              tooltipText={i18n.t("additionalInfo.altToolTipContent")}
              onKeyUp={(e: React.KeyboardEvent<HTMLTextAreaElement>) => handleAddAlt(e, "fi", compId)}
              defaultValue={curImage.altText.fi ?? ""}
              invalid={!!currentInvalids?.invalidAnswers?.includes("fi")}
              errorText={currentInvalids?.invalidAnswers?.includes("fi") ? "PH: olkaa hyvä ja syöttäkää kuvateksti" : ""}
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
                  onKeyUp={(e: React.KeyboardEvent<HTMLTextAreaElement>) => handleAddAlt(e, "sv", compId)}
                  defaultValue={curImage.altText.sv ?? ""}
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
                  onKeyUp={(e: React.KeyboardEvent<HTMLTextAreaElement>) => handleAddAlt(e, "en", compId)}
                  defaultValue={curImage.altText.en ?? ""}
                />
              </QuestionInfo>
            </div>
          </div>
          <div className={styles.picturetermscontainer}>
            <SelectionGroup label={i18n.t("additionalInfo.sharePictureLicenseLabel")}>
              <Checkbox
                id={`picture-license-${currentId}`}
                label={`${i18n.t("additionalInfo.sharePictureLicenseText")} ${i18n.t("additionalInfo.sharePictureLicense")}}`}
                name="agreeToPictureTerms"
                checked={termsChecked}
                onChange={onCheckChange}
                errorText={currentInvalids?.invalidAnswers?.includes("sharelicense") ? i18n.t("additionalInfo.pictureTermsErrorText") : ""}
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
              onChange={onSourceChange}
              required
              defaultValue={curImage?.source ? curImage?.source : ""}
              invalid={!!currentInvalids?.invalidAnswers?.includes("source")}
              errorText={currentInvalids?.invalidAnswers?.includes("source") ? i18n.t("additionalInfo.picureSourceErrorText") : ""}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AdditionalInfoPicturesContent;
