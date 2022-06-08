import React from "react";
import { IconCrossCircle, IconInfoCircle, IconPenLine, Link as HdsLink } from "hds-react";
import { useI18n } from "next-localization";
import { useRouter } from "next/router";
import TextWithLinks from "./common/TextWithLinks";
import { QuestionContainerProps } from "../types/general";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { setEntrancePlaceBoxes } from "../state/reducers/additionalInfoSlice";
import QuestionInfo from "./QuestionInfo";
import styles from "./QuestionContainer.module.scss";

// usage: container for single question row e.g. header/text, additional infos and dropdown/radiobutton
// and possible addinfo previews if question has addinfos
const QuestionContainer = ({ question, accessibilityPlaces, children }: QuestionContainerProps): JSX.Element => {
  const i18n = useI18n();
  const router = useRouter();
  const dispatch = useAppDispatch();

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
  const questionInfos = questionInfo?.split("<BR>");
  const invalidBlocks = useAppSelector((state) => state.formReducer.invalidBlocks);
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

    const url =
      curEntranceId > 0
        ? `/accessibilityPlace/${curServicepointId}/${placeId}/${curEntranceId}`
        : `/accessibilityPlace/${curServicepointId}/${placeId}`;
    router.push(url);
  };

  return (
    <div className={styles.maincontainer} style={questionStyle} id={`questionid-${questionId}`}>
      <div className={styles.questionwrapper}>
        <div className={styles.questioncontainer}>
          <div className={styles.maintext}>
            <p>
              {questionNumber} {questionText}
            </p>
            {questionInfo || photoUrl || photoTexts ? (
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
        </div>

        {visiblePlaces && (
          <div>
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
    </div>
  );
};

export default QuestionContainer;
