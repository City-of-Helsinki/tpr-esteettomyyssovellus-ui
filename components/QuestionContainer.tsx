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
import { useAppDispatch, useAppSelector } from "../state/hooks";
import QuestionButton from "./QuestionButton";
import { useRouter } from "next/router";
import { setCurrentlyEditingBlock } from "../state/reducers/generalSlice";

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
  const router = useRouter();
  const dispatch = useAppDispatch();

  const curLocale: string = i18n.locale();
  const questionDepth = (questionNumber?.toString().split(".") || []).length;
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
          borderColor: "#b01038"
        }
      : {
          paddingLeft,
          backgroundColor
        };

  const handleEditAddInfo = () => {
    if (questionBlockId && questionBlockId !== undefined) {
      dispatch(setCurrentlyEditingBlock(questionBlockId));
    }
    // Use the shallow option to avoid a server-side render in order to preserve the state
    router.push(`/additionalInfo/${questionId ?? ""}`, undefined, {
      shallow: true
    });
    // todo settaa täs statee se mitä editataan
  };

  return (
    <div
      className={styles.maincontainer}
      style={questionStyle}
      id={`questionid-${questionId}`}
    >
      <div className={styles.questioncontainer}>
        <div className={styles.maintext}>
          <p>
            {questionNumber} {questionText}
          </p>
          {questionInfo ? (
            <QuestionInfo
              key={questionNumber}
              openText={i18n.t("accessibilityForm.whatDoesThisMean")}
              openIcon={<IconInfoCircle aria-hidden />}
              closeText={i18n.t("accessibilityForm.closeGuidance")}
              closeIcon={<IconCrossCircle aria-hidden />}
              textOnBottom
            >
              <div className={styles.infoContainer}>
                {questionInfos?.map((e, index) => {
                  return <p key={index}>{e}</p>;
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
            key={questionNumber + "a"}
            questionId={questionId}
            blockId={questionBlockId}
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
      {curQuestionAddinfos &&
      curQuestionAddinfos.components &&
      curQuestionAddinfos.components.length !== 0 ? (
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
                  ? curQuestionAddinfos.pictures.map((pic, index) => {
                      return (
                        <div className={styles.addinfopreviewcontainer}>
                          <div
                            className={styles.addinfopicturepreview}
                            style={{
                              backgroundImage:
                                `url(` + `${pic.base ?? pic.url}` + `)`
                            }}
                          />

                          <p key={pic.qNumber + "alt" + index}>
                            <span>
                              {i18n.t(
                                "accessibilityForm.additionalInfoPreviewAltText"
                              )}
                            </span>
                            {/* @ts-ignore */}
                            {pic[curLocale]}
                          </p>
                          <p key={pic.qNumber + "source" + index}>
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
