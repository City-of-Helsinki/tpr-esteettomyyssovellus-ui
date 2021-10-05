import React from "react";
import { IconInfoCircle, IconCrossCircle, IconAlertCircle } from "hds-react";
import styles from "./QuestionContainer.module.scss";
import { QuestionContainerProps } from "../types/general";
import QuestionInfo from "./QuestionInfo";
import QuestionAdditionalInformation from "./QuestionAdditionalInformation";
import { useI18n } from "next-localization";
import Map from "./common/Map";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import QuestionButton from "./QuestionButton";
import { useRouter } from "next/router";
import { setCurrentlyEditingBlock } from "../state/reducers/generalSlice";

// usage: container for single question row e.g. header/text, additional infos and dropdown/radiobutton
// and possible addinfo previews if question has addinfos
// note: MainLocationOrImage uses questionId as id and questionBlockId as caseid for location or image
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
  isMainLocPicComponent,
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

  // set invalid style if validation errors
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

  if (isMainLocPicComponent) {
    console.log("isMainLocPicComponent");
    console.log(questionId);
  }

  const handleEditAddInfo = () => {
    // todo: this is for the edit text to go to page -> edit to work

    const pageUrl = isMainLocPicComponent
      ? `/mainLocationOrImage/${questionId}/${questionBlockId}`
      : `/additionalInfo/${questionId ?? ""}`;

    if (
      questionBlockId &&
      questionBlockId !== undefined &&
      !isMainLocPicComponent
    ) {
      dispatch(setCurrentlyEditingBlock(questionBlockId));
    }

    // Use the shallow option to avoid a server-side render in order to preserve the state
    router.push(pageUrl, undefined, {
      shallow: true,
    });
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
            // canAddLocation={canAddLocation}
            // canAddPhotoMaxCount={canAddPhotoMaxCount}
            // canAddComment={canAddComment}
            isMainLocPicComponent={isMainLocPicComponent}
          />
        ) : null}
        {isInvalid && curAnswers[questionId!] == undefined ? (
          <IconAlertCircle
            className={styles.alertCircle}
            aria-hidden
          ></IconAlertCircle>
        ) : null}
      </div>
      {/* code under loops additional infos to the form if question has addinfo */}
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
                    <p className={styles.nomargintop}>
                      {/* @ts-ignore */}
                      {curQuestionAddinfos.comments[curLocale]}
                    </p>
                  </div>
                ) : null}
                {curQuestionAddinfos.pictures
                  ? curQuestionAddinfos.pictures.map((pic, index) => {
                      return (
                        <div className={styles.addinfopreviewcontainer}>
                          <div className={styles.picturetextcontainer}>
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
                          <div
                            className={styles.addinfopicturepreview}
                            style={{
                              backgroundImage:
                                `url(` + `${pic.base ?? pic.url}` + `)`,
                            }}
                          />
                        </div>
                      );
                    })
                  : null}
                {curQuestionAddinfos.locations &&
                curQuestionAddinfos.locations.coordinates ? (
                  <div className={styles.addinfopreviewcontainer}>
                    <div className={styles.mapcontainerspacer}></div>
                    <div className={styles.mappreview}>
                      <Map
                        initCenter={curQuestionAddinfos.locations.coordinates!}
                        initLocation={
                          curQuestionAddinfos.locations.coordinates!
                        }
                        initZoom={17}
                        draggableMarker={false}
                        questionId={questionId!}
                        makeStatic={true}
                      />
                    </div>
                  </div>
                ) : null}
              </div>

              <div className={styles.editaddinfobutton}>
                <QuestionButton
                  variant="secondary"
                  onClickHandler={handleEditAddInfo}
                >
                  {i18n.t("common.editAddinfoText")}
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
