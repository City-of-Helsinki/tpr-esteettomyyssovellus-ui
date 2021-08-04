import React from "react";
import { IconInfoCircle, IconCrossCircle, IconAlertCircle } from "hds-react";
import styles from "./QuestionContainer.module.scss";
import { QuestionContainerProps } from "../types/general";
import LANGUAGE_LOCALES from "../types/constants";
import QuestionInfo from "./QuestionInfo";
import QuestionAdditionalInformation from "./QuestionAdditionalInformation";
import { i18n } from "../next.config";
import { useI18n } from "next-localization";
import Map from "./common/Map";
import { useAppSelector } from "../state/hooks";
import QuestionButton from "./QuestionButton";
import { useRouter } from "next/router";

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
  canAddComment,
}: QuestionContainerProps): JSX.Element => {
  const i18n = useI18n();
  const router = useRouter();

  const curLocale: string = i18n.locale();
  const questionDepth = (questionNumber.toString().split(".") || []).length;
  const paddingLeft: string = (questionDepth - 2) * 5 + "rem";
  const photoTexts = photoText?.split("<BR>");
  const questionInfos = questionInfo?.split("<BR><BR>");
  const invalidBlocks = useAppSelector(
    (state) => state.formReducer.invalidBlocks
  );
  const curQuestionAddinfos = useAppSelector(
    (state) => state.additionalInfoReducer[questionId!]
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
          borderColor: "#b01038",
        }
      : {
          paddingLeft,
          backgroundColor,
        };

  const handleEditAddInfo = () => {
    // Use the shallow option to avoid a server-side render in order to preserve the state
    router.push(`/additionalInfo/${questionId ?? ""}`, undefined, {
      shallow: true,
    });
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
      {(curQuestionAddinfos && curQuestionAddinfos?.comments) ||
      curQuestionAddinfos?.pictures ||
      curQuestionAddinfos?.locations ? (
        <div
          className={styles.addinfos}
          style={{ backgroundColor: backgroundColor }}
        >
          {
            <>
              <div
                className={styles.addinfos}
                style={{ backgroundColor: backgroundColor }}
              >
                <h4>
                  {i18n.t("accessibilityForm.additionalInfoPreviewHeader")}
                </h4>
                {curQuestionAddinfos.comments &&
                curQuestionAddinfos?.comments.fi !== "" ? (
                  <div className={styles.addinfopreviewcontainer}>
                    {/* @ts-ignore */}
                    <p>{curQuestionAddinfos.comments[curLocale]}</p>
                  </div>
                ) : null}
                {curQuestionAddinfos.pictures
                  ? curQuestionAddinfos.pictures.map((pic) => {
                      return (
                        <div className={styles.addinfopreviewcontainer}>
                          <div
                            className={styles.addinfopicturepreview}
                            style={{
                              backgroundImage:
                                `url(` + `${pic.base ?? pic.url}` + `)`,
                            }}
                          />

                          <p>
                            <span>
                              {i18n.t(
                                "accessibilityForm.additionalInfoPreviewAltText"
                              )}
                            </span>
                            {/* @ts-ignore */}
                            {pic[curLocale]}
                          </p>
                          <p>
                            <span>
                              {i18n.t(
                                "accessibilityForm.additionalInfoPreviewSourceText"
                              )}
                            </span>
                            {pic.source ? pic.source : null}
                          </p>
                        </div>
                      );
                    })
                  : null}
                {curQuestionAddinfos.locations &&
                curQuestionAddinfos.locations.coordinates ? (
                  <div>
                    <Map
                      initCenter={curQuestionAddinfos.locations.coordinates!}
                      initLocation={curQuestionAddinfos.locations.coordinates!}
                      initZoom={17}
                      draggableMarker={false}
                      questionId={questionId!}
                      makeStatic={true}
                    />
                  </div>
                ) : null}
              </div>

              <div className={styles.editaddinfobutton}>
                <QuestionButton
                  variant="secondary"
                  onClickHandler={handleEditAddInfo}
                >
                  PH: Muokkaa lisätietoja
                </QuestionButton>
              </div>
            </>
          }
        </div>
      ) : null}
    </div>
  );
};

export default QuestionContainer;
