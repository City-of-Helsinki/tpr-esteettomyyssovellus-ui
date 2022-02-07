import React from "react";
import { IconInfoCircle, IconCrossCircle, IconAlertCircle } from "hds-react";
import { useI18n } from "next-localization";
import { useRouter } from "next/router";
import styles from "./QuestionExtraField.module.scss";
import { QuestionExtraFieldProps } from "../types/general";
import QuestionInfo from "./QuestionInfo";
import { useAppDispatch, useAppSelector } from "../state/hooks";

// usage: container for single extra field row e.g. header/text, text input
const QuestionExtraField = ({
  questionBlockId,
  fieldNumber,
  questionText,
  questionInfo,
  isMandatory,
  children,
  backgroundColor,
}: QuestionExtraFieldProps): JSX.Element => {
  const i18n = useI18n();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const curLocale: string = i18n.locale();
  const questionInfos = questionInfo?.split("<BR><BR>");
  const invalidBlocks = useAppSelector((state) => state.formReducer.invalidBlocks);
  const curAnswers = useAppSelector((state) => state.formReducer.answers);
  const isInvalid = invalidBlocks.includes(questionBlockId);

  // set invalid style if validation errors
  const questionStyle =
    // isInvalid && curAnswers[questionId] === undefined
    isInvalid
      ? {
          backgroundColor,
          marginBottom: "0.1rem",
          borderStyle: "solid",
          borderColor: "#b01038",
        }
      : {
          backgroundColor,
        };

  return (
    <div className={styles.maincontainer} style={questionStyle} id={`fieldnumber-${fieldNumber}`}>
      <div className={styles.questioncontainer}>
        <div className={styles.maintext}>
          <p>{`${questionText}${!isMandatory ? ` (${i18n.t("accessibilityForm.optional")})` : ""}`}</p>

          {questionInfo ? (
            <QuestionInfo
              // key={questionNumber}
              openText={i18n.t("accessibilityForm.whatDoesThisMean")}
              openIcon={<IconInfoCircle aria-hidden />}
              closeText={i18n.t("accessibilityForm.closeGuidance")}
              closeIcon={<IconCrossCircle aria-hidden />}
              textOnBottom
            >
              <div className={styles.infoContainer}>
                {questionInfos?.map((e, index) => {
                  const key = `br_${index}`;
                  return <p key={key}>{e}</p>;
                })}
              </div>
            </QuestionInfo>
          ) : null}
        </div>

        <div className={styles.children}>{children}</div>

        {/*isInvalid && curAnswers[questionId] === undefined ? <IconAlertCircle className={styles.alertCircle} aria-hidden /> : null*/}
        {isInvalid ? <IconAlertCircle className={styles.alertCircle} aria-hidden /> : null}
      </div>
    </div>
  );
};

export default QuestionExtraField;
