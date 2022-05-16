import React from "react";
import { useRouter } from "next/router";
import { useI18n } from "next-localization";
import { IconCrossCircle, IconInfoCircle, Link as HdsLink } from "hds-react";
import Map from "./common/Map";
import TextWithLinks from "./common/TextWithLinks";
import { setEntranceLocationPhoto } from "../state/reducers/additionalInfoSlice";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { MAP_MAX_ZOOM } from "../types/constants";
import { QuestionBlockLocationPhotoContentProps } from "../types/general";
import { convertCoordinates } from "../utils/utilFunctions";
import QuestionInfo from "./QuestionInfo";
import styles from "./QuestionBlockLocationPhotoContent.module.scss";

const QuestionBlockLocationPhotoContent = ({ block, canAddLocation, canAddPhoto }: QuestionBlockLocationPhotoContentProps): JSX.Element => {
  const i18n = useI18n();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const curServicepointId = useAppSelector((state) => state.formReducer.currentServicepointId);
  const curEntranceId = useAppSelector((state) => state.formReducer.currentEntranceId);
  const curEntranceLocationPhoto = useAppSelector((state) => state.additionalInfoReducer.entranceLocationPhoto);

  const { question_block_id, add_location_title, add_location_description, add_photo_title, add_photo_description } = block;
  const locationTexts = add_location_description?.split("<BR>");
  const photoTexts = add_photo_description?.split("<BR>");

  // const coordinatesWGS84 = useAppSelector((state) => state.generalSlice.coordinatesWGS84) ?? [60.1, 24.9];
  // const mainImage = useAppSelector((state) => state.formReducer.mainImage);
  const { modifiedPhotoBase64, modifiedAnswer } = curEntranceLocationPhoto;
  const { loc_easting, loc_northing, photo_url, photo_text_fi, photo_text_sv, photo_text_en, photo_source_text } = modifiedAnswer || {};

  const coordinatesEuref = [loc_easting ?? 0, loc_northing ?? 0] as [number, number];
  const coordinatesWGS84 = convertCoordinates("EPSG:3067", "WGS84", coordinatesEuref).reverse() as [number, number];

  const editLocationPhoto = () => {
    // Update the existing data in case the user returns without saving
    dispatch(
      setEntranceLocationPhoto({
        ...curEntranceLocationPhoto,
        question_block_id,
        existingAnswer: curEntranceLocationPhoto.modifiedAnswer,
        existingPhotoBase64: curEntranceLocationPhoto.modifiedPhotoBase64,
        canAddLocation,
        canAddPhoto,
      })
    );

    router.push(`/entranceLocationPhoto/${curServicepointId}/${curEntranceId}`);
  };

  return (
    <>
      {canAddLocation && (
        <div className={styles.maincontainer}>
          <div className={styles.questioncontainer}>
            <div className={styles.maintext}>
              <p>{add_location_title}</p>

              <QuestionInfo
                openText={i18n.t("accessibilityForm.whatDoesThisMean")}
                openIcon={<IconInfoCircle aria-hidden />}
                closeText={i18n.t("accessibilityForm.closeGuidance")}
                closeIcon={<IconCrossCircle aria-hidden />}
                textOnBottom
              >
                <div className={styles.infoContainer}>
                  {locationTexts?.map((text, index) => {
                    const key = `br_${index}`;
                    return <TextWithLinks key={key} text={text} />;
                  })}
                </div>
              </QuestionInfo>
            </div>

            <div className={styles.detailcontainer}>
              <div className={styles.mapcontainer}>
                <Map
                  curLocation={coordinatesWGS84}
                  initZoom={MAP_MAX_ZOOM}
                  draggableMarker={false}
                  questionId={-1}
                  makeStatic
                  isMainLocPicComponent
                />
              </div>
            </div>
          </div>

          <div className={styles.questioncontainer}>
            <div className={styles.detailcontainer}>
              <HdsLink href="#" size="M" disableVisitedStyles onClick={editLocationPhoto}>
                {i18n.t("accessibilityForm.editLocationPhoto")}
              </HdsLink>
            </div>
          </div>
        </div>
      )}

      {canAddPhoto && (
        <div className={styles.maincontainer}>
          <div className={styles.questioncontainer}>
            <div className={styles.maintext}>
              <p>{add_photo_title}</p>

              <QuestionInfo
                openText={i18n.t("accessibilityForm.whatDoesThisMean")}
                openIcon={<IconInfoCircle aria-hidden />}
                closeText={i18n.t("accessibilityForm.closeGuidance")}
                closeIcon={<IconCrossCircle aria-hidden />}
                textOnBottom
              >
                <div className={styles.infoContainer}>
                  {photoTexts?.map((text, index) => {
                    const key = `br_${index}`;
                    return <TextWithLinks key={key} text={text} />;
                  })}
                </div>
              </QuestionInfo>

              <div className={styles.label}>
                <div>{`FI: ${photo_text_fi ?? ""}`}</div>
                <div>{`SV: ${photo_text_sv ?? ""}`}</div>
                <div>{`EN: ${photo_text_en ?? ""}`}</div>
                <div>{`${i18n.t("servicepoint.photoSource")}: ${photo_source_text ?? ""}`}</div>
              </div>
            </div>

            <div className={styles.detailcontainer}>
              {(modifiedPhotoBase64 || photo_url) && (
                <div className={styles.photocontainer}>
                  <img src={modifiedPhotoBase64 ?? photo_url} alt="" />
                </div>
              )}
            </div>
          </div>

          <div className={styles.questioncontainer}>
            <div className={styles.detailcontainer}>
              <HdsLink href="#" size="M" disableVisitedStyles onClick={editLocationPhoto}>
                {i18n.t("accessibilityForm.editLocationPhoto")}
              </HdsLink>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuestionBlockLocationPhotoContent;