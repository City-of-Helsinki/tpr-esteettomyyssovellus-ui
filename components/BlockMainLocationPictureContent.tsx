import React from "react";
import { useAppSelector } from "../state/hooks";
import { BackendQuestion } from "../types/backendModels";
import { MainLocationAndPictureProps } from "../types/general";
import Map from "./common/Map";
import QuestionContainer from "./QuestionContainer";
import styles from "./BlockMainLocationPictureContent.module.scss";

const BlockMainLocationPictureContent = ({ accessibilityPlaces, canAddLocation, canAddPicture }: MainLocationAndPictureProps): JSX.Element => {
  // note: questionBlockId 1 === location, 2 === image

  const coordinatesWGS84 = useAppSelector((state) => state.generalSlice.coordinatesWGS84) ?? [60.1, 24.9];

  console.log("coordinatesWGS84");
  console.log(coordinatesWGS84);

  const mainImage = useAppSelector((state) => state.formReducer.mainImage);

  const question1: BackendQuestion = {
    technical_id: "",
    form_id: 0,
    language_id: 1,
    question_id: -1,
    question_block_id: 1,
    question_code: "",
    text: "PH: Pääsisäänkäynnin sijainti (teksti kannasta??)",
    description: "PH: tähän jotain info (teksti kannasta??)",
    photo_text: "ph: photo text",
    photo_url: "ph: photo_url",
  };

  const question2: BackendQuestion = {
    technical_id: "",
    form_id: 0,
    language_id: 1,
    question_id: -1,
    question_block_id: 2,
    question_code: "",
    text: "PH: Pääsisäänkäynnin kuva (teksti kannasta?)",
    description: "PH: tähän ehkä jotain infot",
    photo_text: "ph: photo text??",
    photo_url: "ph: photo_url??",
  };

  return (
    <>
      {canAddLocation ? (
        <QuestionContainer
          key={123456789}
          question={question1}
          accessibilityPlaces={accessibilityPlaces}
          hasAdditionalInfo
          // canAddLocation
          // canAddComment={false}
          // canAddPhotoMaxCount={0}
          isMainLocPicComponent
        >
          <div className={styles.mappreviewcontainer}>
            <div className={styles.mappreview}>
              <Map initLocation={coordinatesWGS84} initZoom={17} draggableMarker={false} questionId={-1} makeStatic isMainLocPicComponent />
            </div>
          </div>
        </QuestionContainer>
      ) : null}
      {canAddPicture ? (
        <QuestionContainer
          key={987654321}
          question={question2}
          accessibilityPlaces={accessibilityPlaces}
          hasAdditionalInfo
          // canAddLocation={false}
          // canAddComment={false}
          // canAddPhotoMaxCount={1}
          isMainLocPicComponent
        >
          {mainImage ? (
            <div className={styles.addinfopreviewcontainer}>
              <div
                className={styles.addinfopicturepreview}
                style={{
                  backgroundImage: `url(${mainImage.base ?? mainImage.url})`,
                }}
              />
            </div>
          ) : (
            <></>
          )}
        </QuestionContainer>
      ) : null}
    </>
  );
};

export default BlockMainLocationPictureContent;
