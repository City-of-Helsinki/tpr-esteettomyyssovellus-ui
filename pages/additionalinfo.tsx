// TODO: file might need to be renamed eg. like additionalinfo/[id] where id is the question (?)

import React, { ReactElement, SetStateAction, useState } from "react";
import { useI18n } from "next-localization";
import Head from "next/head";
import { GetServerSideProps } from "next";
import {
  IconCrossCircle,
  IconLink,
  IconLocation,
  IconQuestionCircle,
  IconSpeechbubbleText,
  IconUpload
} from "hds-react";
import Layout from "../components/common/Layout";
import { store } from "../state/store";
import i18nLoader from "../utils/i18n";
import styles from "./additionalInfo.module.scss";
import QuestionInfo from "../components/QuestionInfo";
import ServicepointMainInfoContent from "../components/ServicepointMainInfoContent";
import AdditionalInfoCtrlButtons from "../components/AdditionalInfoCtrlButtons";
import HeadlineQuestionContainer from "../components/HeadlineQuestionContainer";
import QuestionButton from "../components/QuestionButton";
import AdditionalInfoLocationContent from "../components/AdditionalInfoLocationContent";
import AdditionalInfoPicturesContent from "../components/AdditionalInfoPicturesContent";
import AdditionalInfoCommentContent from "../components/AdditionalInfoCommentContent";
import {
  addComponent,
  removeComponent
} from "../state/reducers/additionalInfoSlice";
import { useAppSelector, useAppDispatch } from "../state/hooks";
import {
  AdditionalComponentProps,
  AdditionalInfoProps
} from "../types/general";

// TODO: need to know what page is e.g. picture, comment or location
const AdditionalInfo = (): ReactElement => {
  // placeholder for pagenumber
  const pageNumberPH: string = "1";
  // todo: figure out better way to id
  const [increasingId, setIncreasingId] = useState(0);
  const dispatch = useAppDispatch();
  let curAdditionalInfo: any = useAppSelector(
    (state) => state.additionalInfoReducer[pageNumberPH] as AdditionalInfoProps
  );

  const i18n = useI18n();
  const [elementCounts, setElementCounts]: any = useState({
    comment: 0,
    upload: 0,
    link: 0,
    location: 0
  });

  const handleAddElement = (type: string) => {
    setElementCounts((prevCounts: any) => ({
      ...prevCounts,
      [type]: elementCounts[type] + 1
    }));
    dispatch(
      addComponent({
        questionNumber: pageNumberPH,
        type: type,
        id: increasingId
      })
    );
    setIncreasingId(increasingId + 1);
  };

  const handleDelete = (deleteId: number, type: string) => {
    setElementCounts((prevCounts: any) => ({
      ...prevCounts,
      [type]: elementCounts[type] - 1
    }));
    dispatch(
      removeComponent({ questionNumber: pageNumberPH, delId: deleteId })
    );
  };

  return (
    <Layout>
      <Head>
        <title>{i18n.t("notification.title")}</title>
      </Head>
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
          <div className={styles.headingcontainer}>
            <h1>PH: Aitohoiva - Esteettömyystietojen yhteenveto</h1>
            <h2>{i18n.t("common.mainEntrance")} Katukatu 12, 00100 Helsinki</h2>
          </div>
          <div>
            <AdditionalInfoCtrlButtons />
            <div>
              <div className={styles.mainheader}>
                <p>
                  {i18n.t("additionalInfo.addLocation")} {">"} 1.4 Onko
                  kulkureittiä
                </p>
              </div>
              <div className={styles.maininfoctrl}>
                {/* { infoButton ? <div className={styles.maininfocontent}>{infoButton}</div> : null}
              <div className={styles.maininfocontent}>{infoText}</div> */}
                tähä infoa
              </div>
            </div>
            <div className={styles.overrideheadlinestyles}>
              {curAdditionalInfo?.components?.map(
                (component: AdditionalComponentProps) => {
                  const id = component.id;
                  const type = component.type;
                  if (type === "upload") {
                    return (
                      <div className={styles.componentcontainer}>
                        <AdditionalInfoPicturesContent
                          key={`key_${id}`}
                          questionNumber="1"
                          compId={id}
                          onDelete={() => handleDelete(id, "upload")}
                        />
                      </div>
                    );
                  } else if (type === "link") {
                    return (
                      <div className={styles.componentcontainer}>
                        <AdditionalInfoPicturesContent
                          onlyLink
                          key={`key_${id}`}
                          questionNumber="1"
                          compId={id}
                          onDelete={() => handleDelete(id, "link")}
                        />
                      </div>
                    );
                  } else if (type === "comment") {
                    return (
                      <div className={styles.componentcontainer}>
                        <AdditionalInfoCommentContent
                          key={`key_${id}`}
                          questionNumber="1"
                          compId={id}
                          onDelete={() => handleDelete(id, "comment")}
                        />
                      </div>
                    );
                  } else if (type === "location") {
                    return (
                      <div className={styles.componentcontainer}>
                        <AdditionalInfoLocationContent
                          key={`key_${id}`}
                          questionNumber="1"
                          compId={id}
                          onDelete={() => handleDelete(id, "location")}
                        />
                      </div>
                    );
                  }
                }
              )}
            </div>
            <div className={styles.editedelementsctrl}>
              <h3>{i18n.t("additionalInfo.elementsCtrlButtonsHeader")}</h3>
              <div className={styles.editedelementsctrlbuttons}>
                <QuestionButton
                  variant="secondary"
                  iconRight={<IconSpeechbubbleText />}
                  onClickHandler={() => handleAddElement("comment")}
                  disabled={elementCounts["comment"] > 0 ? true : false}
                >
                  {i18n.t("additionalInfo.ctrlButtons.addNewComment")}
                </QuestionButton>
                <QuestionButton
                  variant="secondary"
                  iconRight={<IconUpload />}
                  onClickHandler={() => handleAddElement("upload")}
                  disabled={
                    elementCounts["upload"] + elementCounts["link"] > 1
                      ? true
                      : false
                  }
                >
                  {i18n.t(
                    "additionalInfo.ctrlButtons.addUploadImageFromDevice"
                  )}
                </QuestionButton>
                <QuestionButton
                  variant="secondary"
                  iconRight={<IconLink />}
                  onClickHandler={() => handleAddElement("link")}
                  disabled={
                    elementCounts["upload"] + elementCounts["link"] > 1
                      ? true
                      : false
                  }
                >
                  {i18n.t("additionalInfo.ctrlButtons.addPictureLink")}
                </QuestionButton>
                <QuestionButton
                  variant="secondary"
                  iconRight={<IconLocation />}
                  onClickHandler={() => handleAddElement("location")}
                  disabled={elementCounts["location"] > 0 ? true : false}
                >
                  {i18n.t("additionalInfo.ctrlButtons.addNewLocation")}
                </QuestionButton>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
};

// Server-side rendering
// Todo: edit, get servicepoint data
export const getServerSideProps: GetServerSideProps = async ({
  req,
  locales
}) => {
  const lngDict = await i18nLoader(locales);

  const reduxStore = store;
  // reduxStore.dispatch({ type: CLEAR_STATE });
  const initialReduxState = reduxStore.getState();

  // const user = await checkUser(req);
  // if (!user) {
  //   // Invalid user but login is not required
  // }
  // if (user && user.authenticated) {
  //   initialReduxState.general.user = user;
  // }

  return {
    props: {
      initialReduxState,
      lngDict
    }
  };
};

export default AdditionalInfo;
