import React, { ChangeEvent } from "react";
import { IconPlus, IconMinus, TextArea } from "hds-react";
import { useI18n } from "next-localization";
import QuestionInfo from "./QuestionInfo";
import {
  // addInvalidQuestionBlockCommentValue,
  editQuestionBlockComment,
  // removeInvalidQuestionBlockCommentValue,
} from "../state/reducers/additionalInfoSlice";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { AdditionalCommentProps } from "../types/general";
import styles from "./AdditionalComment.module.scss";

// usage: additional info page comment component
const AdditionalComment = ({ questionBlockId, questionBlockComment }: AdditionalCommentProps): JSX.Element => {
  const i18n = useI18n();
  const dispatch = useAppDispatch();

  const curEntranceId = useAppSelector((state) => state.formReducer.currentEntranceId);

  const { modifiedComment, invalidValues = [] } = questionBlockComment || {};
  const { comment_text_fi, comment_text_sv, comment_text_en } = modifiedComment || {};

  const updateComment = (language: string, commentText: string) => {
    dispatch(
      editQuestionBlockComment({
        entrance_id: curEntranceId,
        question_block_id: questionBlockId,
        language,
        commentText,
      })
    );
  };

  /*
  const handleAddInvalidValue = (invalidFieldId: string, invalidFieldLabel: string, invalidMessage: string) => {
    dispatch(
      addInvalidQuestionBlockCommentValue({
        entrance_id: curEntranceId,
        question_block_id: questionBlockId,
        invalidFieldId,
        invalidFieldLabel,
        invalidMessage,
      })
    );
  };

  const handleRemoveInvalidValue = (invalidFieldIdToRemove: string) => {
    dispatch(
      removeInvalidQuestionBlockCommentValue({
        entrance_id: curEntranceId,
        question_block_id: questionBlockId,
        invalidFieldIdToRemove,
      })
    );
  };
  */

  // only update state after X (0.5) sec from prev KeyDown, set Alt text with correct lang
  // let timer: NodeJS.Timeout;
  const handleAddComment = (evt: ChangeEvent<HTMLTextAreaElement>, language: string, fieldLabel: string) => {
    const fieldId = evt.currentTarget.id;
    const commentText = evt.currentTarget.value;
    /*
    clearTimeout(timer);
    timer = setTimeout(() => {
      dispatch(setAlt({ questionId, language, value, compId: id }));
    }, 500);
    */
    updateComment(language, commentText);

    // TODO - check if any validation is needed for text comments
    if (language === "fi") {
      // remove or add mandatory alt fi validation to state
      if (commentText && commentText !== "") {
        // handleRemoveInvalidValue(fieldId);
      } else if (commentText === "") {
        // handleAddInvalidValue(fieldId, fieldLabel, i18n.t("common.message.invalid"));
      }
      console.log(fieldId, fieldLabel);
    }
  };

  return (
    <div className={styles.maincontainer}>
      <div className={styles.inputcontainer}>
        <div className={styles.commentcontainer}>
          <TextArea
            id={"comment-fin"}
            label={i18n.t("additionalInfo.commentLabel")}
            helperText={i18n.t("additionalInfo.commentHelperText")}
            // required
            // tooltipButtonLabel={i18n.t("additionalInfo.generalTooltipButtonLabel")}
            // tooltipLabel={i18n.t("additionalInfo.generalTooltipLabel")}
            // tooltipText={i18n.t("additionalInfo.altToolTipContent")}
            onChange={(evt: ChangeEvent<HTMLTextAreaElement>) => handleAddComment(evt, "fi", i18n.t("additionalInfo.commentLabel"))}
            value={comment_text_fi ?? ""}
            invalid={invalidValues.some((v) => v.fieldId === "text-fin")}
            errorText={invalidValues.some((v) => v.fieldId === "text-fin") ? i18n.t("additionalInfo.addCommentFiErrorText") : ""}
          />

          <div className={styles.altLabel}>
            <QuestionInfo
              openText={i18n.t("additionalInfo.commentButtonSwe")}
              closeText={i18n.t("additionalInfo.commentButtonCloseSwe")}
              openIcon={<IconPlus />}
              closeIcon={<IconMinus />}
              textOnBottom
            >
              <TextArea
                id={"comment-sv"}
                label={i18n.t("additionalInfo.commentLabelSwe")}
                helperText={i18n.t("additionalInfo.commentHelperTextSwe")}
                onChange={(evt: ChangeEvent<HTMLTextAreaElement>) => handleAddComment(evt, "sv", i18n.t("additionalInfo.commentLabelSwe"))}
                value={comment_text_sv ?? ""}
              />
            </QuestionInfo>
          </div>

          <div className={styles.altLabel}>
            <QuestionInfo
              openText={i18n.t("additionalInfo.commentButtonEng")}
              closeText={i18n.t("additionalInfo.commentButtonCloseEng")}
              openIcon={<IconPlus />}
              closeIcon={<IconMinus />}
              textOnBottom
            >
              <TextArea
                id={"comment-eng"}
                label={i18n.t("additionalInfo.commentLabelEng")}
                helperText={i18n.t("additionalInfo.commentHelperTextEng")}
                onChange={(evt: ChangeEvent<HTMLTextAreaElement>) => handleAddComment(evt, "en", i18n.t("additionalInfo.commentLabelEng"))}
                value={comment_text_en ?? ""}
              />
            </QuestionInfo>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdditionalComment;
