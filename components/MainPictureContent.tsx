import React, { useEffect, useRef, useState } from "react";
import {
  IconPlus,
  IconMinus,
  TextArea,
  TextInput,
  Checkbox,
  Tooltip,
  SelectionGroup,
} from "hds-react";
import { useI18n } from "next-localization";
import styles from "./AdditionalInfoPicturesContent.module.scss";
import QuestionButton from "./QuestionButton";
import QuestionInfo from "./QuestionInfo";
import {
  addInvalidValues,
  addPicture,
  removeInvalidValues,
  removePicture,
  setAlt,
  setPictureSource,
} from "../state/reducers/additionalInfoSlice";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import {
  AdditionalContentProps,
  MainPictureContentProps,
} from "../types/general";
import { CREATIVECOMMONS_URL } from "../types/constants";
import { v4 as uuidv4 } from "uuid";
import {
  addMainImageElement,
  addMainImageInvalidValue,
  addMainPicture,
  removeAllMainImageInvalidValues,
  removeMainImageInvalidValue,
  removeMainPicture,
  setMainPictureAlt,
  setMainPictureSource,
} from "../state/reducers/formSlice";

// usage: additionalinfo page picture components
// notes: this component has both "upload" and "link/url" image components for they are such similar
const MainPictureContent = ({
  pageId,
  onlyLink = false,
  onDelete,
  initValue,
}: MainPictureContentProps): JSX.Element => {
  const i18n = useI18n();
  const dispatch = useAppDispatch();

  const [linkText, setLinkText] = useState("");

  const curImage = useAppSelector((state) => state.formReducer.mainImage);

  // get current invalid fields for validation
  const currentInvalids = useAppSelector(
    (state) => state.formReducer.mainImageInvalidValues
  );

  // hidden input field which is clicked after custom button is pressed
  const hiddenFileInput = useRef<HTMLInputElement>(null);

  // click the hidden file input and remove previous image if present
  const handleAddImageToInput = (): void => {
    if (pageId) {
      handleRemoveImage();
    }

    if (hiddenFileInput && hiddenFileInput.current) {
      hiddenFileInput.current.click();
    }
  };

  // remove validation values respectively
  const handleremoveInvalidValue = (remoTarget: string) => {
    dispatch(removeMainImageInvalidValue(remoTarget));
  };

  // remove validation values respectively
  const handleAddInvalidValues = (answersToAdd: string[]) => {
    dispatch(addMainImageInvalidValue(answersToAdd));
  };

  // add image to state, in else when adding just the img link/url
  const handleImageAdded = async (e?: any) => {
    setTermsChecked(false);
    // this if is for upload image component
    if (e && e.target.files && e.target.files.length > 0) {
      const img = e.target.files[0];
      const imgBase64 = window.URL.createObjectURL(img);
      const payload = {
        name: img.name,
        base: imgBase64,
        uuid: uuidv4(),
        url: "",
        fi: "",
        sv: "",
        en: "",
        source: "",
      };
      dispatch(addMainPicture(payload));
      // remove or add mandatory url validation to state
      dispatch(
        addMainImageInvalidValue(["url", "fi", "source", "sharelicense"])
      );
      if ((imgBase64 && imgBase64 !== "") || (img.name && img.name !== "")) {
        dispatch(removeMainImageInvalidValue("url"));
        //  todo: maybe add url === "" here
      } else if (imgBase64 !== "" || img.name === "") {
        dispatch(addMainImageInvalidValue(["url"]));
      }
      // below for links component (not the upload component)
    } else {
      dispatch(
        addMainImageInvalidValue(["url", "fi", "source", "sharelicense"])
      );
      // validate url inputted has image
      const isImage = await validateUrlIsImage(linkText);
      if (isImage) {
        const payload = {
          name: "",
          base: linkText,
          url: linkText,
          fi: "",
          sv: "",
          en: "",
          source: "",
        };
        dispatch(addMainPicture(payload));
        dispatch(removeMainImageInvalidValue("url"));
      } else {
        dispatch(addMainImageInvalidValue(["url"]));
      }
    }
  };

  //todo: maybe needs more refined error message if not found image (?)
  const validateUrlIsImage = async (url: string) => {
    const res = await fetch(url);
    if (res.status === 200) {
      return true;
    }
    setLinkText("");
    return false;
  };

  // combined remove and add image
  const handleImageRemoveAndAdded = () => {
    handleRemoveImage();
    handleImageAdded();
  };

  // remove image from state
  const handleRemoveImage = () => {
    dispatch(removeMainPicture());
    // also adds errors back for validation
    dispatch(removeAllMainImageInvalidValues());
  };

  // on delete button clicked chain delete image from store and delete component cb
  const handleOnDelete = () => {
    handleRemoveImage();
    onDelete ? onDelete() : null;
  };

  // only update state after X (0.5) sec from prev KeyDown, set Alt text with correct lang
  let timer: NodeJS.Timeout;
  const handleAddAlt = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    language: string
  ) => {
    const value: string = e.currentTarget.value;
    clearTimeout(timer);
    timer = setTimeout(() => {
      dispatch(setMainPictureAlt({ language, value }));
    }, 500);
    // remove or add mandatory alt fi validation to state
    if (value && value !== "") {
      dispatch(removeMainImageInvalidValue("fi"));
    } else if (value === "") {
      dispatch(addMainImageInvalidValue(["fi"]));
    }
  };

  // logic for checkbox picture terms using HDS
  // todo: this could be put in to state, or maybe not because only used for validation so no need to save anywhere (?)
  const [termsChecked, setTermsChecked] = useState(false);
  const onCheckChange = (e: any) => {
    setTermsChecked(!termsChecked);
    if (!termsChecked) {
      dispatch(removeMainImageInvalidValue("sharelicense"));
    } else {
      dispatch(addMainImageInvalidValue(["sharelicense"]));
    }
  };

  //update source on state
  const onSourceChange = (e: any) => {
    const source = e.currentTarget.value;
    dispatch(setMainPictureSource(source));
    // remove or add mandatory source validation to state
    if (source && source !== "") {
      dispatch(removeMainImageInvalidValue("source"));
    } else if (source === "") {
      dispatch(addMainImageInvalidValue(["source"]));
    }
  };

  // add or remove url validation errors
  const handleLinkText = (e: any) => {
    const value = e.currentTarget.value;
    value.length > 0 ? setLinkText(value) : null;
    if (value && value !== "") {
      dispatch(removeMainImageInvalidValue("url"));
    } else if (value === "") {
      dispatch(addMainImageInvalidValue(["url"]));
    }
  };

  // different buttons depending if upload component or link/url component
  const addFromDeviceButton = !onlyLink ? (
    <QuestionButton variant="secondary" onClickHandler={handleAddImageToInput}>
      {i18n.t("additionalInfo.chooseFromDevice")}
    </QuestionButton>
  ) : (
    <QuestionButton
      variant="secondary"
      onClickHandler={() => handleImageRemoveAndAdded()}
      disabled={linkText ? false : true}
    >
      {i18n.t("additionalInfo.pictureLinkConfirmButton")}
    </QuestionButton>
  );

  // init validation errors if needed
  useEffect(() => {
    // if addinfo page with no curimage or initvalue add default validation errors
    if (!curImage || !initValue) {
      dispatch(
        addMainImageInvalidValue(["url", "fi", "source", "sharelicense"])
      );
    } else {
      // set terms checked if already validated image due to always checked otherwise cant save
      setTermsChecked(true);
    }
  }, []);

  return (
    <div className={styles.maincontainer}>
      <div
        className={styles.inputcontainer}
        style={
          currentInvalids?.includes("url")
            ? { alignItems: "center" }
            : { alignItems: "flex-end" }
        }
      >
        <span className={styles.inputfield}>
          <TextInput
            id="{`chooseimg-${currentId}`}"
            label={
              onlyLink
                ? i18n.t("additionalInfo.pictureInputLink")
                : i18n.t("additionalInfo.pictureInput")
            }
            placeholder={curImage?.name}
            disabled={onlyLink ? false : true}
            onChange={(e) => handleLinkText(e)}
            defaultValue={curImage?.url ? curImage.url : ""}
            invalid={currentInvalids?.includes("url") ? true : false}
            errorText={
              currentInvalids?.includes("url")
                ? i18n.t("additionalInfo.picureLinkErrorText")
                : ""
            }
          />
        </span>

        {curImage?.base && !onlyLink ? (
          <QuestionButton
            variant="secondary"
            onClickHandler={handleAddImageToInput}
          >
            {i18n.t("additionalInfo.changePicture")}
          </QuestionButton>
        ) : (
          addFromDeviceButton
        )}
        <QuestionButton
          variant="secondary"
          onClickHandler={() => handleOnDelete()}
        >
          {i18n.t("additionalInfo.cancelPicture")}
        </QuestionButton>
        {onlyLink ? null : (
          <input
            type="file"
            className={styles.hidden}
            ref={hiddenFileInput}
            onChange={handleImageAdded}
          ></input>
        )}
      </div>
      {/* todo: maybe remove base and use url -> need url for upload from ~Azure */}
      {curImage?.base || curImage?.url ? (
        <div className={styles.lowercontentcontainer}>
          <div className={styles.picrutepreviewcontainer}>
            <div
              style={{ backgroundImage: `url(` + `${curImage?.base}` + `)` }}
            />
          </div>
          <div className={styles.altcontainer}>
            <TextArea
              id={`text-fin-${pageId}`}
              label={i18n.t("additionalInfo.pictureLabel")}
              helperText={i18n.t("additionalInfo.pictureHelperText")}
              required
              tooltipButtonLabel={i18n.t(
                "additionalInfo.generalTooptipButtonLabel"
              )}
              tooltipLabel={i18n.t("additionalInfo.generalTooptipLabel")}
              tooltipText={i18n.t("additionalInfo.altToolTipContent")}
              onKeyUp={(e: React.KeyboardEvent<HTMLTextAreaElement>) =>
                handleAddAlt(e, "fi")
              }
              defaultValue={curImage?.fi ?? null}
              invalid={currentInvalids?.includes("fi") ? true : false}
              errorText={
                currentInvalids?.includes("fi")
                  ? "PH: olkaa hyvä ja syöttäkää kuvateksti"
                  : ""
              }
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
                  id={`text-sv-${pageId}`}
                  label={i18n.t("additionalInfo.pictureLabelSwe")}
                  helperText={i18n.t("additionalInfo.pictureHelperTextSwe")}
                  onKeyUp={(e: React.KeyboardEvent<HTMLTextAreaElement>) =>
                    handleAddAlt(e, "sv")
                  }
                  defaultValue={curImage?.sv ? curImage.sv : ""}
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
                  id={`text-eng-${pageId}`}
                  label={i18n.t("additionalInfo.pictureLabelEng")}
                  helperText={i18n.t("additionalInfo.pictureHelperTextEng")}
                  onKeyUp={(e: React.KeyboardEvent<HTMLTextAreaElement>) =>
                    handleAddAlt(e, "en")
                  }
                  defaultValue={curImage?.en ? curImage.en : ""}
                />
              </QuestionInfo>
            </div>
          </div>
          <div className={styles.picturetermscontainer}>
            <SelectionGroup
              label={i18n.t("additionalInfo.sharePictureLicenseLabel")}
            >
              <Checkbox
                id={`picture-license-${pageId}`}
                label={`${i18n.t(
                  "additionalInfo.sharePictureLicenseText"
                )} ${i18n.t("additionalInfo.sharePictureLicense")}}`}
                name="agreeToPictureTerms"
                checked={termsChecked}
                onChange={onCheckChange}
                errorText={
                  currentInvalids?.includes("sharelicense")
                    ? i18n.t("additionalInfo.pictureTermsErrorText")
                    : ""
                }
              />
            </SelectionGroup>
            <Tooltip> {i18n.t("additionalInfo.pictureTermsInfoText")} </Tooltip>
          </div>
          <div className={styles.picturesourcecontainer}>
            <TextInput
              id={`tooltip-source-${pageId}`}
              tooltipButtonLabel={i18n.t("additionalInfo.generalTooptipLabel")}
              tooltipLabel={i18n.t("additionalInfo.generalTooptipLabel")}
              tooltipText={i18n.t("additionalInfo.sourceTooltipText")}
              label={i18n.t("additionalInfo.sourceTooltipMainLabel")}
              onChange={onSourceChange}
              required
              defaultValue={curImage?.source ? curImage?.source : ""}
              invalid={currentInvalids?.includes("source") ? true : false}
              errorText={
                currentInvalids?.includes("source")
                  ? i18n.t("additionalInfo.picureSourceErrorText")
                  : ""
              }
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default MainPictureContent;
