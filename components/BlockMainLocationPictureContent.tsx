import React from "react";
import { useAppSelector } from "../state/hooks";
import { MainLocationAndPictureProps } from "../types/general";
import Map from "./common/Map";
import QuestionContainer from "./QuestionContainer";
import styles from "./BlockMainLocationPictureContent.module.scss";

const BlockMainLocationPictureContent = ({ canAddLocation, canAddPicture }: MainLocationAndPictureProps): JSX.Element => {
  // note: questionBlockId 1 === location, 2 === image

  const coordinatesWGS84 = useAppSelector((state) => state.generalSlice.coordinatesWGS84) ?? [60.1, 24.9];

  console.log("coordinatesWGS84");
  console.log(coordinatesWGS84);

  const mainImage = useAppSelector((state) => state.formReducer.mainImage);

  return (
    <>
      {canAddLocation ? (
        <QuestionContainer
          key={123456789}
          questionId={-1}
          questionBlockId={1}
          questionNumber=""
          questionText="PH: Pääsisäänkäynnin sijainti (teksti kannasta??)"
          questionInfo="PH: tähän jotain info (teksti kannasta??)"
          hasAdditionalInfo
          backgroundColor="#f2f2fc"
          canAddLocation
          canAddComment={false}
          canAddPhotoMaxCount={0}
          photoText="ph: photo text"
          photoUrl="ph: photo_url"
          isMainLocPicComponent
        >
          <div className={styles.mappreviewcontainer}>
            <div className={styles.mappreview}>
              <Map
                initLocation={coordinatesWGS84}
                initCenter={coordinatesWGS84}
                initZoom={17}
                draggableMarker={false}
                questionId={-1}
                makeStatic
                isMainLocPicComponent
              />
            </div>
          </div>
        </QuestionContainer>
      ) : null}
      {canAddPicture ? (
        <QuestionContainer
          key={987654321}
          questionId={-1}
          questionBlockId={2}
          questionNumber=""
          questionText="PH: Pääsisäänkäynnin kuva (teksti kannasta?)"
          questionInfo="PH: tähän ehkä jotain infot"
          hasAdditionalInfo
          backgroundColor="#ffffff"
          canAddLocation={false}
          canAddComment={false}
          canAddPhotoMaxCount={1}
          photoText="ph: photo text??"
          photoUrl="ph: photo_url??"
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
