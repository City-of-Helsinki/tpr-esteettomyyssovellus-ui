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
import { AdditionalContentProps } from "../types/general";
import { CREATIVECOMMONS_URL } from "../types/constants";

const AdditionalInfoPicturesContent = ({
  questionId,
  compId,
  onlyLink = false,
  onDelete,
  initValue,
}: AdditionalContentProps): JSX.Element => {
  // also use filename for conditionally displaying buttons and alt-text & preview picture
  const dispatch = useAppDispatch();

  // TODO: change this it breaks if prev values
  const currentId = compId;
  const curAddInfo = useAppSelector(
    (state) => state.additionalInfoReducer[questionId]
  );
  // initValue =
  //   curAddInfo?.pictures?.filter((pic) => pic.id === currentId) ?? null;
  const curImage = curAddInfo?.pictures?.filter(
    (pic) => pic.id === currentId
  )[0];
  const [linkText, setLinkText] = useState("");

  const currentInvalids = useAppSelector((state) =>
    state.additionalInfoReducer[questionId].invalidValues?.find(
      (invs) => invs.id === compId
    )
  );

  const hiddenFileInput = useRef<HTMLInputElement>(null);
  const i18n = useI18n();
  // add picture to state
  const handleAddImageToInput = (): void => {
    if (currentId) {
      handleRemoveImage();
    }

    if (hiddenFileInput && hiddenFileInput.current) {
      hiddenFileInput.current.click();
    }
  };
  // add image to state, elseif -> when adding just the img link/url
  const handleImageAdded = async (e?: any) => {
    setTermsChecked(false);
    if (e && e.target.files && e.target.files.length > 0) {
      const img = e.target.files[0];
      const imgBase64 = window.URL.createObjectURL(img);
      const payload = {
        qNumber: questionId,
        id: currentId,
        name: img.name,
        base: imgBase64,
        url: "",
        fi: "",
        sv: "",
        en: "",
        source: "",
      };
      dispatch(addPicture(payload));
      // remove or add mandatory url validation to state
      if ((imgBase64 && imgBase64 !== "") || (img.name && img.name !== "")) {
        dispatch(
          removeInvalidValues({
            questionId: questionId,
            compId: compId,
            removeTarget: "url",
          })
        );
        //  todo: what is this
      } else if (imgBase64 !== "" || img.name === "") {
        dispatch(
          addInvalidValues({
            questionId: questionId,
            compId: compId,
            invalidAnswers: ["url"],
          })
        );
      }
      // below for links (not upload)
    } else {
      const isImage = await validateUrlIsImage(linkText);
      if (isImage) {
        const payload = {
          qNumber: questionId,
          id: currentId,
          name: "",
          base: linkText,
          url: linkText,
          fi: "",
          sv: "",
          en: "",
          source: "",
        };
        dispatch(addPicture(payload));
        dispatch(
          addInvalidValues({
            questionId: questionId,
            compId: compId,
            invalidAnswers: ["fi", "source", "sharelicense"],
          })
        );
        dispatch(
          removeInvalidValues({
            questionId: questionId,
            compId: compId,
            removeTarget: "url",
          })
        );
      }
    }
  };

  //todo: maybe needs better solution / more refined and error message if not found image
  const validateUrlIsImage = async (url: string) => {
    const res = await fetch(url);
    if (res.status === 200) {
      return true;
    }
    setLinkText("");
    return false;
  };

  const handleImageRemoveAndAdded = () => {
    handleRemoveImage();
    handleImageAdded();
  };

  // remove image from state
  const handleRemoveImage = () => {
    dispatch(removePicture({ questionId, currentId }));
    // also add errors back for validation
    // todo maybe add this dispatch back
    // dispatch(
    //   addInvalidValues({
    //     questionId: questionId,
    //     compId: compId,
    //     invalidAnswers: ["fi", "source", "sharelicense", "url"],
    //   })
    // );
  };

  // on delete button clicked chain delete image from store and delete component cb
  const handleOnDelete = () => {
    handleRemoveImage();
    onDelete ? onDelete() : null;
  };

  // only update state after 1 sec from prev KeyDown, set Alt text with correct lang
  let timer: NodeJS.Timeout;
  const handleAddAlt = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    language: string,
    compId: number
  ) => {
    const value: string = e.currentTarget.value;
    clearTimeout(timer);
    timer = setTimeout(() => {
      dispatch(setAlt({ questionId, language, value, compId }));
    }, 500);
    // remove or add mandatory alt fi validation to state
    if (value && value !== "") {
      dispatch(
        removeInvalidValues({
          questionId: questionId,
          compId: compId,
          removeTarget: "fi",
        })
      );
    } else if (value === "") {
      dispatch(
        addInvalidValues({
          questionId: questionId,
          compId: compId,
          invalidAnswers: ["fi"],
        })
      );
    }
  };

  // logic for checkbox picture terms using HDS
  // todo: this could be put in to state, or maybe not because only used for validation (?)
  const [termsChecked, setTermsChecked] = useState(false);
  const onCheckChange = (e: any) => {
    setTermsChecked(!termsChecked);
    if (!termsChecked) {
      dispatch(
        removeInvalidValues({
          questionId: questionId,
          compId: compId,
          removeTarget: "sharelicense",
        })
      );
    } else {
      dispatch(
        addInvalidValues({
          questionId: questionId,
          compId: compId,
          invalidAnswers: ["sharelicense"],
        })
      );
    }
  };

  //update source on state
  const onSourceChange = (e: any) => {
    const source = e.currentTarget.value;
    dispatch(setPictureSource({ questionId, source, compId }));
    // remove or add mandatory source validation to state
    if (source && source !== "") {
      dispatch(
        removeInvalidValues({
          questionId: questionId,
          compId: compId,
          removeTarget: "source",
        })
      );
    } else if (source === "") {
      dispatch(
        addInvalidValues({
          questionId: questionId,
          compId: compId,
          invalidAnswers: ["source"],
        })
      );
    }
  };

  const handleLinkText = (e: any) => {
    const value = e.currentTarget.value;
    value.length > 0 ? setLinkText(value) : null;
    if (value && value !== "") {
      dispatch(
        removeInvalidValues({
          questionId: questionId,
          compId: compId,
          removeTarget: "url",
        })
      );
    } else if (value === "") {
      dispatch(
        addInvalidValues({
          questionId: questionId,
          compId: compId,
          invalidAnswers: ["url"],
        })
      );
    }
  };

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
      ph: vahvista
    </QuestionButton>
  );

  useEffect(() => {
    // if (initValue && curImage) {
    //   // initValue = curImage;
    //   setTermsChecked(!termsChecked);
    // }
    // if addinfo page with no curimage or initvalue add default validation errors (this needed?)
    if (
      // !curImage?.fi ||
      // initValue?.fi === "" ||
      // !curImage?.source ||
      // initValue?.source === "" ||
      // !curImage?.source ||
      // initValue?.source === "" ||
      !curImage ||
      !initValue
    ) {
      dispatch(
        addInvalidValues({
          questionId: questionId,
          compId: compId,
          invalidAnswers: ["fi", "source", "sharelicense", "url"],
        })
      );
    }
  }, []);

  return (
    <div className={styles.maincontainer}>
      <div className={styles.inputcontainer}>
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
            invalid={
              currentInvalids?.invalidAnswers?.includes("url") ? true : false
            }
            errorText={
              currentInvalids?.invalidAnswers?.includes("url")
                ? "PH: olkaa hyvä ja syöttäkää lähde"
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
              id={`text-fin-${currentId}`}
              label={i18n.t("additionalInfo.pictureLabel")}
              helperText={i18n.t("additionalInfo.pictureHelperText")}
              required
              tooltipButtonLabel={i18n.t(
                "additionalInfo.generalTooptipButtonLabel"
              )}
              tooltipLabel={i18n.t("additionalInfo.generalTooptipLabel")}
              tooltipText={i18n.t("additionalInfo.altToolTipContent")}
              onKeyUp={(e: React.KeyboardEvent<HTMLTextAreaElement>) =>
                handleAddAlt(e, "fi", compId)
              }
              defaultValue={curImage?.fi ?? null}
              invalid={
                currentInvalids?.invalidAnswers?.includes("fi") ? true : false
              }
              errorText={
                currentInvalids?.invalidAnswers?.includes("fi")
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
                  id={`text-sv-${currentId}`}
                  label={i18n.t("additionalInfo.pictureLabelSwe")}
                  helperText={i18n.t("additionalInfo.pictureHelperTextSwe")}
                  onKeyUp={(e: React.KeyboardEvent<HTMLTextAreaElement>) =>
                    handleAddAlt(e, "sv", compId)
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
                  id={`text-eng-${currentId}`}
                  label={i18n.t("additionalInfo.pictureLabelEng")}
                  helperText={i18n.t("additionalInfo.pictureHelperTextEng")}
                  onKeyUp={(e: React.KeyboardEvent<HTMLTextAreaElement>) =>
                    handleAddAlt(e, "en", compId)
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
                id={`picture-license-${currentId}`}
                label={`${i18n.t(
                  "additionalInfo.sharePictureLicenseText"
                )} ${i18n.t("additionalInfo.sharePictureLicense")}}`}
                name="agreeToPictureTerms"
                // defaultChecked={initValue?.id === compId ? true : termsChecked}
                checked={termsChecked}
                onChange={onCheckChange}
                // invalid={
                //   currentInvalids?.invalidAnswers?.includes("sharelicense")
                //     ? true
                //     : false
                // }
                errorText={
                  currentInvalids?.invalidAnswers?.includes("sharelicense")
                    ? "PH: olkaa hyvä ja hyväksykää ehdot"
                    : ""
                }
              />
            </SelectionGroup>
            <Tooltip> PH: Tähän tooltip tekstiä </Tooltip>
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
              defaultValue={curImage?.source ? curImage?.source : null}
              invalid={
                currentInvalids?.invalidAnswers?.includes("source")
                  ? true
                  : false
              }
              errorText={
                currentInvalids?.invalidAnswers?.includes("source")
                  ? "PH: olkaa hyvä ja syöttäkää lähde"
                  : ""
              }
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AdditionalInfoPicturesContent;
