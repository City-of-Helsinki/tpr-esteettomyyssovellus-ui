import React from "react";
import { IconCrossCircle, IconInfoCircle, IconPenLine, Link as HdsLink } from "hds-react";
import { useI18n } from "next-localization";
import { useRouter } from "next/router";
import styles from "./QuestionContainer.module.scss";
import TextWithLinks from "./common/TextWithLinks";
import { QuestionContainerProps } from "../types/general";
import QuestionInfo from "./QuestionInfo";
// import QuestionAdditionalInformation from "./QuestionAdditionalInformation";
// import Map from "./common/Map";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { setEntrancePlaceBoxes } from "../state/reducers/additionalInfoSlice";
// import QuestionButton from "./QuestionButton";
// import { setCurrentlyEditingBlock } from "../state/reducers/generalSlice";

// usage: container for single question row e.g. header/text, additional infos and dropdown/radiobutton
// and possible addinfo previews if question has addinfos
// note: MainLocationOrImage uses questionId as id and questionBlockId as caseid for location or image
const QuestionContainer = ({
  question,
  accessibilityPlaces,
  // hasAdditionalInfo,
  // canAddLocation,
  // canAddPhotoMaxCount,
  // canAddComment,
  // isMainLocPicComponent,
  children,
}: QuestionContainerProps): JSX.Element => {
  const i18n = useI18n();
  const router = useRouter();
  const dispatch = useAppDispatch();
  // const curLocale: string = i18n.locale();

  const {
    question_id: questionId,
    question_block_id: questionBlockId,
    question_code: questionNumber,
    text: questionText,
    description: questionInfo,
    photo_text: photoText,
    photo_url: photoUrl,
    place_visible_if_question_choice: placeVisible,
  } = question;

  // const questionDepth = (questionNumber?.toString().split(".") || []).length;
  // const paddingLeft = `${(questionDepth - 2) * 5}rem`;
  const photoTexts = photoText?.split("<BR>");
  const questionInfos = questionInfo?.split("<BR><BR>");
  const invalidBlocks = useAppSelector((state) => state.formReducer.invalidBlocks);
  // const curQuestionAddinfos = useAppSelector((state) => state.additionalInfoReducer.additionalInfo[questionId]);
  const curAnswers = useAppSelector((state) => state.formReducer.answers);
  // const curAnsweredChoices = useAppSelector((state) => state.formReducer.answeredChoices);
  const curAnsweredChoices = Object.values(curAnswers);
  const curServicepointId = useAppSelector((state) => state.formReducer.currentServicepointId);
  const curEntranceId = useAppSelector((state) => state.formReducer.currentEntranceId);
  const curEntrancePlaceBoxes = useAppSelector((state) => state.additionalInfoReducer.entrancePlaceBoxes);
  const isInvalid = invalidBlocks.includes(questionBlockId);

  // Accessibility place string examples:
  // 4:80101
  // 7:1202+1203+1204+1205+1206+1207
  // 37:5403+5404+5405+5406+5407;38:5403+5404+5405+5406+5407
  const questionPlaces = placeVisible?.split(";");
  const visiblePlaceIds = questionPlaces?.reduce((acc: number[], placeStr) => {
    const place = placeStr.split(":");
    if (place && place.length === 2) {
      const placeId = place[0];
      const choices = place[1].split("+");

      if (choices.some((elem) => curAnsweredChoices.includes(Number(elem)))) {
        return [...acc, Number(placeId)];
      }
    }
    return acc;
  }, []);
  const visiblePlaces =
    visiblePlaceIds && visiblePlaceIds.length > 0
      ? accessibilityPlaces.filter((place) => {
          return visiblePlaceIds.includes(place.place_id);
        })
      : undefined;

  // set invalid style if validation errors
  const questionStyle =
    isInvalid && curAnswers[questionId] === undefined
      ? {
          // paddingLeft,
          marginBottom: "0.1rem",
          borderStyle: "solid",
          borderColor: "#b01038",
        }
      : {
          // paddingLeft,
        };

  /*
  if (isMainLocPicComponent) {
    console.log("isMainLocPicComponent");
    console.log(questionId);
  }
  */

  /*
  const handleEditAddInfo = () => {
    // todo: this is for the edit text to go to page -> edit to work

    const pageUrl = isMainLocPicComponent ? `/mainLocationOrImage/${questionId}/${questionBlockId}` : `/additionalInfo/${questionId ?? ""}`;

    if (questionBlockId && questionBlockId !== undefined && !isMainLocPicComponent) {
      dispatch(setCurrentlyEditingBlock(questionBlockId));
    }

    // Use the shallow option to avoid a server-side render in order to preserve the state
    router.push(pageUrl, undefined, {
      shallow: true,
    });
  };
  */

  const editAccessibilityPlace = (placeId: number) => {
    // Update the existing data in case the user returns without saving
    dispatch(
      setEntrancePlaceBoxes(
        curEntrancePlaceBoxes.map((placeBox) => {
          return {
            ...placeBox,
            existingBox: placeBox.modifiedBox,
            existingPhotoBase64: placeBox.modifiedPhotoBase64,
          };
        })
      )
    );

    router.push(`/accessibilityPlace/${curServicepointId}/${curEntranceId}/${placeId}`);
  };

  return (
    <div className={styles.maincontainer} style={questionStyle} id={`questionid-${questionId}`}>
      <div className={styles.questionwrapper}>
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
                  {questionInfos?.map((text, index) => {
                    const key = `br_${index}`;
                    return <TextWithLinks key={key} text={text} />;
                  })}
                  {photoUrl && (
                    <div>
                      <img src={photoUrl} alt="" className={styles.infoPicture} />
                    </div>
                  )}
                  {photoTexts?.map((text, index) => {
                    const key = `br_${index}`;
                    return <TextWithLinks key={key} text={text} />;
                  })}
                </div>
              </QuestionInfo>
            ) : null}
          </div>

          <div className={styles.children}>{children}</div>

          {/*hasAdditionalInfo && questionId !== undefined ? (
            <QuestionAdditionalInformation
              questionId={questionId}
              blockId={questionBlockId}
              // canAddLocation={canAddLocation}
              // canAddPhotoMaxCount={canAddPhotoMaxCount}
              // canAddComment={canAddComment}
              isMainLocPicComponent={isMainLocPicComponent}
            />
          ) : null*/}
          {/*isInvalid && curAnswers[questionId] === undefined ? <IconAlertCircle className={styles.alertCircle} aria-hidden /> : null*/}
        </div>

        {visiblePlaces && (
          <div className={styles.questioncontainer}>
            {visiblePlaces.map((place) => {
              const { place_id, name } = place;
              const key = `place_${place_id}`;

              return (
                <div key={key} className={styles.placecontainer}>
                  <div className={styles.place}>
                    <IconPenLine aria-hidden />
                    <div className={styles.maintext}>
                      {`${i18n.t("accessibilityForm.fillPlaceData1")} '${name}' ${i18n.t("accessibilityForm.fillPlaceData2")}?`}
                    </div>
                  </div>
                  <div className={styles.children}>
                    <HdsLink href="#" size="M" disableVisitedStyles onClick={() => editAccessibilityPlace(place_id)}>
                      {i18n.t("accessibilityForm.placeLink")}
                    </HdsLink>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* code under loops additional infos to the form if question has addinfo */}
      {/*curQuestionAddinfos && curQuestionAddinfos.components && curQuestionAddinfos.components.length !== 0 ? (
        <div className={styles.addinfos}>
          <>
            <div className={styles.addinfos}>
              <h4>{i18n.t("accessibilityForm.additionalInfoPreviewHeader")}</h4>
              {curQuestionAddinfos.comments && curQuestionAddinfos?.comments.fi !== "" ? (
                <div className={styles.addinfopreviewcontainer}>
                  <p className={styles.nomargintop}>{curQuestionAddinfos.comments[curLocale]}</p>
                </div>
              ) : null}
              {curQuestionAddinfos.pictures
                ? curQuestionAddinfos.pictures.map((pic, index) => {
                    const key = `question_${pic.qNumber}_picture_${index}`;
                    return (
                      <div key={key} className={styles.addinfopreviewcontainer}>
                        <div className={styles.picturetextcontainer}>
                          <p>
                            <span>{i18n.t("accessibilityForm.additionalInfoPreviewAltText")}</span>
                            {pic.altText[curLocale]}
                          </p>
                          <p>
                            <span>{i18n.t("accessibilityForm.additionalInfoPreviewSourceText")}</span>
                            {pic.source ? pic.source : null}
                          </p>
                        </div>
                        <div
                          className={styles.addinfopicturepreview}
                          style={{
                            backgroundImage: `url(${pic.base ?? pic.url})`,
                          }}
                        />
                      </div>
                    );
                  })
                : null}
              {curQuestionAddinfos.locations && curQuestionAddinfos.locations.coordinates ? (
                <div className={styles.addinfopreviewcontainer}>
                  <div className={styles.mapcontainerspacer} />
                  <div className={styles.mappreview}>
                    <Map
                      curLocation={curQuestionAddinfos.locations.coordinates}
                      initZoom={17}
                      draggableMarker={false}
                      questionId={questionId}
                      makeStatic
                    />
                  </div>
                </div>
              ) : null}
            </div>

            <div className={styles.editaddinfobutton}>
              <QuestionButton variant="secondary" onClickHandler={handleEditAddInfo}>
                {i18n.t("common.editAddinfoText")}
              </QuestionButton>
            </div>
          </>
        </div>
      ) : null*/}
    </div>
  );
};

export default QuestionContainer;
