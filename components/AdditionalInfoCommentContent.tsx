import React, { useEffect } from "react";
import { IconPlus, IconMinus, IconCross, TextArea } from "hds-react";
import { useI18n } from "next-localization";
import styles from "./AdditionalInfoCommentContent.module.scss";

import QuestionInfo from "./QuestionInfo";
import { AdditionalContentProps, Languages } from "../types/general";
import { addComment, addInvalidValues, removeComment, removeInvalidValues } from "../state/reducers/additionalInfoSlice";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import QuestionButton from "./QuestionButton";

// usage: additional info page comment component
const AdditionalInfoCommentContent = ({ questionId, onDelete, compId, initValue: initLanguagesValue }: AdditionalContentProps): JSX.Element => {
  const i18n = useI18n();
  const dispatch = useAppDispatch();

  const handleRemoveComment = () => {
    dispatch(removeComment({ questionId }));
  };

  // on delete button clicked chain delete comment from store and delete component cb
  const handleOnDelete = () => {
    handleRemoveComment();
    if (onDelete) {
      onDelete();
    }
  };

  const initValue = initLanguagesValue as Languages;

  const currentInvalids = useAppSelector((state) =>
    state.additionalInfoReducer.additionalInfo[questionId]?.invalidValues?.find((invs) => invs.id === compId)
  );

  // only update state after .5 sec from prev KeyDown, set Alt text with correct lang
  let timer: NodeJS.Timeout;
  const handleAddCommentValue = (value: string, language: string) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      dispatch(addComment({ questionId, language, value }));
    }, 500);
    // validation for fi comment field
    if (value && value !== "" && language === "fi") {
      dispatch(
        removeInvalidValues({
          questionId,
          compId,
          removeTarget: "fi",
        })
      );
    } else if (value === "" && language === "fi") {
      dispatch(
        addInvalidValues({
          questionId,
          compId,
          invalidAnswers: ["fi"],
        })
      );
    }
  };

  const handleAddComment = (e: React.KeyboardEvent<HTMLTextAreaElement>, language: string) => {
    const { value } = e.currentTarget;
    handleAddCommentValue(value, language);
  };

  useEffect(() => {
    if (!initValue?.fi || initValue?.fi === "") {
      dispatch(
        addInvalidValues({
          questionId,
          compId,
          invalidAnswers: ["fi"],
        })
      );
    }
  }, [compId, initValue?.fi, questionId, dispatch]);

  return (
    <div className={styles.maincontainer}>
      <div className={styles.contentcontainer}>
        <div className={styles.descriptioncontainer}>
          <h4>{i18n.t("additionalInfo.commentMainHeader")}</h4>
        </div>
        <div className={styles.flexcontainer}>
          <div className={styles.commentscontainer}>
            <TextArea
              id="comment-1"
              label={i18n.t("additionalInfo.commentFiHeader")}
              helperText={i18n.t("additionalInfo.commentFiHeaderHelperText")}
              required
              tooltipButtonLabel={i18n.t("additionalInfo.generalTooptipButtonLabel")}
              tooltipLabel={i18n.t("additionalInfo.generalTooptipLabel")}
              tooltipText={i18n.t("additionalInfo.altToolTipContent")}
              onKeyUp={(e: React.KeyboardEvent<HTMLTextAreaElement>) => handleAddComment(e, "fi")}
              onLoad={() => handleAddCommentValue(initValue?.fi, "fi")}
              defaultValue={initValue?.fi ?? null}
              invalid={!!currentInvalids?.invalidAnswers?.includes("fi")}
              errorText={currentInvalids?.invalidAnswers?.includes("fi") ? i18n.t("additionalInfo.addCommentFiErrorText") : ""}
            />
            <div className={styles.optionalaltscontainer}>
              <QuestionInfo
                openText={i18n.t("additionalInfo.commentSvButtonText")}
                closeText={i18n.t("additionalInfo.commentSvButtonCloseText")}
                openIcon={<IconPlus />}
                closeIcon={<IconMinus />}
                textOnBottom
              >
                <TextArea
                  id="comment-2"
                  label={i18n.t("additionalInfo.commentSvButtonLabel")}
                  helperText={i18n.t("additionalInfo.commentSvButtonLabelHelper")}
                  onKeyUp={(e: React.KeyboardEvent<HTMLTextAreaElement>) => handleAddComment(e, "sv")}
                  onLoad={() => handleAddCommentValue(initValue?.sv, "sv")}
                  defaultValue={initValue?.sv ?? null}
                />
              </QuestionInfo>
              <QuestionInfo
                openText={i18n.t("additionalInfo.commentAddEnButtonText")}
                closeText={i18n.t("additionalInfo.commentAddEnButtonCloseText")}
                openIcon={<IconPlus />}
                closeIcon={<IconMinus />}
                textOnBottom
              >
                <TextArea
                  id="comment-3"
                  label={i18n.t("additionalInfo.commentEnLabel")}
                  helperText={i18n.t("additionalInfo.commentEnLabelHelper")}
                  onKeyUp={(e: React.KeyboardEvent<HTMLTextAreaElement>) => handleAddComment(e, "en")}
                  onLoad={() => handleAddCommentValue(initValue?.en, "en")}
                  defaultValue={initValue?.en ?? null}
                />
              </QuestionInfo>
            </div>
          </div>
          <div className={styles.buttonscontainer}>
            <QuestionButton variant="secondary" iconRight={<IconCross />} onClickHandler={() => handleOnDelete()}>
              {i18n.t("additionalInfo.cancelComment")}
            </QuestionButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdditionalInfoCommentContent;
