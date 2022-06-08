import React from "react";
import { useRouter } from "next/router";
import { useI18n } from "next-localization";
import { IconPenLine, Link as HdsLink } from "hds-react";
import { setQuestionBlockComment } from "../state/reducers/additionalInfoSlice";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { QuestionBlockCommentProps } from "../types/general";
import styles from "./QuestionBlockComment.module.scss";

const QuestionBlockComment = ({ block }: QuestionBlockCommentProps): JSX.Element => {
  const i18n = useI18n();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const curServicepointId = useAppSelector((state) => state.formReducer.currentServicepointId);
  const curEntranceId = useAppSelector((state) => state.formReducer.currentEntranceId);
  const curQuestionBlockComments = useAppSelector((state) => state.additionalInfoReducer.questionBlockComments);

  const { question_block_id, text } = block;

  // Show the comments for this question block
  const filteredQuestionBlockComment = curQuestionBlockComments.find((blockComment) => {
    return blockComment.question_block_id === question_block_id;
  });
  const { modifiedComment } = filteredQuestionBlockComment || {};
  const { comment_text_fi, comment_text_sv, comment_text_en } = modifiedComment || {};

  const editComment = () => {
    // Update the existing data in case the user returns without saving
    dispatch(
      setQuestionBlockComment({
        ...filteredQuestionBlockComment,
        entrance_id: curEntranceId,
        question_block_id: question_block_id,
        existingComment: filteredQuestionBlockComment?.modifiedComment,
        modifiedComment: filteredQuestionBlockComment?.modifiedComment,
        invalidValues: [],
      })
    );

    const url =
      curEntranceId > 0
        ? `/blockComment/${curServicepointId}/${question_block_id}/${curEntranceId}`
        : `/blockComment/${curServicepointId}/${question_block_id}`;
    router.push(url);
  };

  return (
    <div className={styles.maincontainer}>
      <div className={styles.questionwrapper}>
        <div className={styles.questioncontainer}>
          <div className={styles.question}>
            <div className={styles.commenticon}>
              <IconPenLine aria-hidden />
            </div>
            <div className={styles.maintext}>
              {`${i18n.t("accessibilityForm.fillPlaceData1")} '${text}' ${i18n.t("accessibilityForm.fillPlaceData2")}?`}
            </div>
          </div>
          <div className={styles.children}>
            <HdsLink href="#" size="M" disableVisitedStyles onClick={editComment}>
              {comment_text_fi || comment_text_sv || comment_text_en
                ? i18n.t("accessibilityForm.editComment")
                : i18n.t("accessibilityForm.addComment")}
            </HdsLink>
          </div>
        </div>

        {(comment_text_fi || comment_text_sv || comment_text_en) && (
          <div className={styles.commentcontainer}>
            <div className={styles.maintext}>
              <p>{`${i18n.t("accessibilityForm.additionalInfo")}: ${text}`}</p>

              <div className={styles.label}>
                <div>{`FI: ${comment_text_fi ?? ""}`}</div>
                <div>{`SV: ${comment_text_sv ?? ""}`}</div>
                <div>{`EN: ${comment_text_en ?? ""}`}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionBlockComment;