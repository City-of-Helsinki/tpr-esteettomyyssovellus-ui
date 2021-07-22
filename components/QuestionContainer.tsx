import React from "react";
import { IconInfoCircle, IconCrossCircle, IconAlertCircle } from "hds-react";
import styles from "./QuestionContainer.module.scss";
import { QuestionContainerProps } from "../types/general";
import QuestionInfo from "./QuestionInfo";
import QuestionAdditionalInformation from "./QuestionAdditionalInformation";
import { i18n } from "../next.config";
import { useI18n } from "next-localization";
import { useAppSelector } from "../state/hooks";

// used for wrapping question text and additional infos with question 'data component' e.g. dropdown
const QuestionContainer = ({
  questionId,
  questionBlockId,
  questionNumber,
  questionText,
  questionInfo,
  photoUrl,
  photoText,
  children,
  hasAdditionalInfo,
  backgroundColor,
  canAddLocation,
  canAddPhotoMaxCount,
  canAddComment
}: QuestionContainerProps): JSX.Element => {
  const i18n = useI18n();
  const questionDepth = (questionNumber.toString().split(".") || []).length;
  const paddingLeft: string = (questionDepth - 2) * 5 + "rem";
  const photoTexts = photoText?.split("<BR>");
  const questionInfos = questionInfo?.split("<BR><BR>");
  const invalidBlocks = useAppSelector(
    (state) => state.formReducer.invalidBlocks
  );
  const curAnswers = useAppSelector((state) => state.formReducer.answers);
  const isInvalid = invalidBlocks.includes(questionBlockId!);

  const questionStyle =
    isInvalid && curAnswers[questionId!] == undefined
      ? {
          paddingLeft,
          backgroundColor,
          marginBottom: "0.1rem",
          borderStyle: "solid",
          borderColor: "#b01038"
        }
      : {
          paddingLeft,
          backgroundColor
        };

  return (
    <div className={styles.maincontainer} style={questionStyle}>
      <div className={styles.questioncontainer}>
        <div className={styles.maintext}>
          <p>
            {questionNumber} {questionText}
          </p>
          {questionInfo ? (
            <QuestionInfo
              openText={i18n.t("accessibilityForm.whatDoesThisMean")}
              openIcon={<IconInfoCircle aria-hidden />}
              closeText={i18n.t("accessibilityForm.closeGuidance")}
              closeIcon={<IconCrossCircle aria-hidden />}
              textOnBottom
            >
              <div className={styles.infoContainer}>
                {questionInfos?.map((e) => {
                  return <p>{e}</p>;
                })}
                {photoUrl != null ? (
                  <img src={photoUrl} className={styles.infoPicture}></img>
                ) : null}
                <p>{photoTexts}</p>
              </div>
            </QuestionInfo>
          ) : null}
        </div>
        <div className={styles.children}>{children}</div>
        {hasAdditionalInfo && questionId != undefined ? (
          <QuestionAdditionalInformation
            questionId={questionId}
            canAddLocation={canAddLocation}
            canAddPhotoMaxCount={canAddPhotoMaxCount}
            canAddComment={canAddComment}
          />
        ) : null}
        {isInvalid && curAnswers[questionId!] == undefined ? (
          <IconAlertCircle
            className={styles.alertCircle}
            aria-hidden
          ></IconAlertCircle>
        ) : null}
      </div>
    </div>
  );
};

export default QuestionContainer;
