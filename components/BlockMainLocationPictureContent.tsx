import React from "react";
import { useAppSelector } from "../state/hooks";
import { mainLocationAndPictureProps } from "../types/general";
import Map from "./common/Map";
import QuestionContainer from "./QuestionContainer";
import styles from "./BlockMainLocationPictureContent.module.scss";

const BlockMainLocationPictureContent = ({
  canAddLocation,
  canAddPicture,
}: mainLocationAndPictureProps): JSX.Element => {
  // note: questionBlockId 1 === location, 2 === image
  // todo: edit this
  const backgroundColor: string = 1 % 2 === 0 ? "#f2f2fc" : "#ffffff";
  const coordinatesWGS84 = useAppSelector(
    (state) => state.generalSlice.coordinatesWGS84
  );
  return (
    <>
      {canAddLocation ? (
        <QuestionContainer
          key={123456789}
          questionId={-1}
          questionBlockId={1}
          questionNumber={""}
          questionText={"PH: tähän kannasta tekstit"}
          questionInfo={"PH: tähän ehkä jotain infot"}
          hasAdditionalInfo={true}
          backgroundColor={backgroundColor}
          canAddLocation={true}
          canAddComment={false}
          canAddPhotoMaxCount={0}
          photoText={"ph: photo text"}
          photoUrl={"ph: photo_url"}
          isMainLocPicComponent={true}
        >
          <div className={styles.mappreviewcontainer}>
            <div className={styles.mappreview}>
              <Map
                initCenter={coordinatesWGS84}
                initLocation={coordinatesWGS84}
                initZoom={17}
                draggableMarker={false}
                questionId={-1}
                makeStatic={true}
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
          questionNumber={""}
          questionText={"PH: tähän kannasta tekstit"}
          questionInfo={"PH: tähän ehkä jotain infot"}
          hasAdditionalInfo={true}
          backgroundColor={backgroundColor}
          canAddLocation={false}
          canAddComment={false}
          canAddPhotoMaxCount={1}
          photoText={"ph: photo text??"}
          photoUrl={"ph: photo_url??"}
          isMainLocPicComponent={true}
        >
          <p>KUVA TÄHÄN</p>
        </QuestionContainer>
      ) : null}
    </>
  );
};

export default BlockMainLocationPictureContent;
