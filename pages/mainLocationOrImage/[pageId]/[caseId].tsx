import React, { ReactElement, useEffect } from "react";
import { useI18n } from "next-localization";
import Head from "next/head";
import { GetServerSideProps } from "next";
import { IconCrossCircle, IconLink, IconQuestionCircle, IconUpload } from "hds-react";
import Layout from "../../../components/common/Layout";
import i18nLoader from "../../../utils/i18n";
import styles from "./mainLocationOrImage.module.scss";
import QuestionInfo from "../../../components/QuestionInfo";
import ServicepointMainInfoContent from "../../../components/ServicepointMainInfoContent";
// import AdditionalInfoCtrlButtons from "../../../components/AdditionalInfoCtrlButtons";
import QuestionButton from "../../../components/QuestionButton";
import AdditionalInfoLocationContent from "../../../components/AdditionalInfoLocationContent";
import { useAppSelector, useAppDispatch, useLoading } from "../../../state/hooks";
import { MainLocationOrImageProps } from "../../../types/general";
import { setCurEditingBothCoordinateTemps } from "../../../state/reducers/generalSlice";
import LoadSpinner from "../../../components/common/LoadSpinner";
import {
  addMainImageElement,
  addMainImageTempElement,
  removeMainImageElement,
  setCurEditingMainEntranceImageTemp,
} from "../../../state/reducers/formSlice";
import MainPictureContent from "../../../components/MainPictureContent";
import MainLocationPictureCtrlButtons from "../../../components/MainLocationPictureCtrlButtons";

// usage: additional information page (per question)
const MainLocationOrImage = ({ pageId, caseId }: MainLocationOrImageProps): ReactElement => {
  // note: pageId is -1 for mainForm and 1,2,n for additionalEntrance (used for state logic)
  // caseId 1 === location, caseId 2 === image
  const i18n = useI18n();
  // todo: figure out better way to id (?)
  // current checks biggest id from cur addinfo and increments, if no found start form zero
  // init for current highest id is doned in useEffect [] 'highestElementId'
  const isLoading = useLoading();
  const dispatch = useAppDispatch();

  // if caseId is 1 then location page, if caseId 2 then image page
  const isLocation = caseId === 1;

  const currentMainImageElement = useAppSelector((state) => state.formReducer.mainImageElement) ?? null;

  const currentMainImage = useAppSelector((state) => state.formReducer.mainImage);

  const coordinates = useAppSelector((state) => state.generalSlice.coordinates);

  const coordinatesWGS84 = useAppSelector((state) => state.generalSlice.coordinatesWGS84);

  // for saving current state obj initial state for if user edits and cancels without saving to return to old state or empty if no init addinfo
  useEffect(() => {
    // todo: save init state or not
    if (currentMainImage) {
      dispatch(setCurEditingMainEntranceImageTemp(currentMainImage));
      dispatch(addMainImageTempElement(currentMainImageElement));
    }
    dispatch(
      setCurEditingBothCoordinateTemps({
        coordinates,
        coordinatesWGS84,
      })
    );
  }, [coordinates, coordinatesWGS84, currentMainImage, currentMainImageElement, dispatch]);

  const hasMainImage = useAppSelector((state) => state.formReducer.mainImageElement);

  const handleDelete = () => {
    dispatch(removeMainImageElement());
  };

  const handleAddComponent = (element: string) => {
    // if page is mainform, else add to additional Entrance
    if (pageId === -1) {
      dispatch(addMainImageElement(element));
    } else {
      // todo: todo example
      // dispatch(addAdditionalEntranceImageElement(type));
    }
  };

  return (
    <Layout>
      <Head>
        <title>{i18n.t("notification.title")}</title>
      </Head>
      {isLoading ? (
        <LoadSpinner />
      ) : (
        <main id="content">
          <div className={styles.maincontainer}>
            <div className={styles.infocontainer}>
              <QuestionInfo
                openText={i18n.t("common.generalMainInfoIsClose")}
                closeText={i18n.t("common.generalMainInfoIsOpen")}
                openIcon={<IconQuestionCircle />}
                closeIcon={<IconCrossCircle />}
                textOnBottom
              >
                <ServicepointMainInfoContent />
              </QuestionInfo>
            </div>
            <div>
              <MainLocationPictureCtrlButtons />
              {/* todo: mod or create new buttons */}
              {/* <AdditionalInfoCtrlButtons questionId={questionId} /> */}
              <div>
                <div className={styles.mainheader}>
                  <p className={styles.headerspacing}>ph: lis???? jotain kuva tai loc k??yt?? ternary</p>
                </div>
                <div className={styles.maininfoctrl}>{i18n.t("additionalInfo.mainInfoText")}</div>
              </div>
              <div className={styles.overrideheadlinestyles}>
                {/* todo: maybe make more beautiful  */}
                {isLocation ? (
                  <div className={styles.componentcontainer}>
                    <AdditionalInfoLocationContent
                      key={`key_${pageId}`}
                      questionId={pageId}
                      compId={caseId}
                      initValue={coordinatesWGS84}
                      canDelete={false}
                      isMainLocPicComponent
                    />
                  </div>
                ) : null}

                {currentMainImageElement === "upload" && !isLocation ? (
                  <div className={styles.componentcontainer}>
                    <MainPictureContent pageId={pageId} key={`key_${caseId}`} onDelete={() => handleDelete()} initValue={currentMainImage} />
                  </div>
                ) : null}

                {currentMainImageElement === "link" && !isLocation ? (
                  <div className={styles.componentcontainer}>
                    <MainPictureContent pageId={pageId} onlyLink key={`key_${caseId}`} onDelete={() => handleDelete()} initValue={currentMainImage} />
                  </div>
                ) : null}

                {!isLocation ? (
                  <div className={styles.editedelementsctrl}>
                    <h3>{i18n.t("additionalInfo.elementsCtrlButtonsHeader")}</h3>
                    <div className={styles.editedelementsctrlbuttons}>
                      <QuestionButton
                        variant="secondary"
                        iconRight={<IconUpload />}
                        onClickHandler={() => handleAddComponent("upload")}
                        disabled={!!hasMainImage}
                      >
                        {i18n.t("additionalInfo.ctrlButtons.addUploadImageFromDevice")}
                      </QuestionButton>
                      <QuestionButton
                        variant="secondary"
                        iconRight={<IconLink />}
                        onClickHandler={() => handleAddComponent("link")}
                        disabled={!!hasMainImage}
                      >
                        {i18n.t("additionalInfo.ctrlButtons.addPictureLink")}
                      </QuestionButton>
                    </div>
                  </div>
                ) : null}

                {/* <AdditionalInfoCtrlButtons questionId={questionId} /> */}
              </div>
              <MainLocationPictureCtrlButtons />
            </div>
          </div>
        </main>
      )}
    </Layout>
  );
};

// NextJs Server-Side Rendering, HDS best practices (SSR)
export const getServerSideProps: GetServerSideProps = async ({ params, locales }) => {
  const lngDict = await i18nLoader(locales);

  const pageId = Number(params?.pageId) ?? null; // questionId
  const caseId = Number(params?.caseId) ?? null; // questionBlockId

  return {
    props: {
      pageId,
      caseId,
      lngDict,
    },
  };
};

export default MainLocationOrImage;
