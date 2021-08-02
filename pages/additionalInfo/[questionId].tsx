// TODO: file might need to be renamed eg. like additionalinfo/[id] where id is the question (?)
import React, {
  ReactElement,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { useI18n } from "next-localization";
import Head from "next/head";
import { GetServerSideProps } from "next";
import {
  IconCrossCircle,
  IconLink,
  IconLocation,
  IconQuestionCircle,
  IconSpeechbubbleText,
  IconUpload,
} from "hds-react";
import Layout from "../../components/common/Layout";
import { store } from "../../state/store";
import i18nLoader from "../../utils/i18n";
import styles from "./additionalInfo.module.scss";
import QuestionInfo from "../../components/QuestionInfo";
import ServicepointMainInfoContent from "../../components/ServicepointMainInfoContent";
import AdditionalInfoCtrlButtons from "../../components/AdditionalInfoCtrlButtons";
import HeadlineQuestionContainer from "../../components/HeadlineQuestionContainer";
import QuestionButton from "../../components/QuestionButton";
import AdditionalInfoLocationContent from "../../components/AdditionalInfoLocationContent";
import AdditionalInfoPicturesContent from "../../components/AdditionalInfoPicturesContent";
import AdditionalInfoCommentContent from "../../components/AdditionalInfoCommentContent";
import {
  addComponent,
  clearEditingInitialState,
  removeAllInvalids,
  removeComponent,
  removeInvalidValues,
  setEditingInitialState,
  setProperlySaved,
} from "../../state/reducers/additionalInfoSlice";
import { useAppSelector, useAppDispatch } from "../../state/hooks";
import {
  AdditionalComponentProps,
  AdditionalInfoPageProps,
  AdditionalInfoProps,
} from "../../types/general";
import {
  LANGUAGE_LOCALES,
  API_FETCH_BACKEND_QUESTIONS,
} from "../../types/constants";
import { Dictionary } from "@reduxjs/toolkit";

// TODO: need to know what page is e.g. picture, comment or location
const AdditionalInfo = ({
  questionId,
  questionData,
}: AdditionalInfoPageProps): ReactElement => {
  const i18n = useI18n();
  // todo: figure out better way to id
  const [increasingId, setIncreasingId] = useState(0);
  const dispatch = useAppDispatch();
  let curAdditionalInfo: any = useAppSelector(
    (state) => state.additionalInfoReducer[questionId] as AdditionalInfoProps
  );

  const filterByLanguage = (data: any) => {
    const i18n = useI18n();
    const curLocale: string = i18n.locale();
    // @ts-ignore: TODO:
    const curLocaleId: number = LANGUAGE_LOCALES[curLocale];
    return data.filter((entry: any) => {
      return entry.language_id == curLocaleId;
    });
  };

  const questionDataCurrentLanguage = filterByLanguage(questionData).pop();

  const [elementCounts, setElementCounts]: any = useState({
    comment: 0,
    upload: 0,
    link: 0,
    location: 0,
  });

  const handleAddElement = (type: string) => {
    setElementCounts((prevCounts: any) => ({
      ...prevCounts,
      [type]: elementCounts[type] + 1,
    }));
    dispatch(
      addComponent({
        questionId: questionId,
        type: type,
        id: increasingId,
      })
    );
    setIncreasingId(increasingId + 1);
  };

  const handleDelete = (deleteId: number, type: string) => {
    setElementCounts((prevCounts: any) => ({
      ...prevCounts,
      [type]: elementCounts[type] - 1,
    }));
    dispatch(removeComponent({ questionId: questionId, delId: deleteId }));
    dispatch(removeAllInvalids({ questionId: questionId, compId: deleteId }));
  };

  // for saving current state obj initial state for if user edits and cancels without saving to return to init state of cur obj to state
  useEffect(() => {
    // set properly saved if user e.g. press back button and validation / save process is not followed
    dispatch(
      setProperlySaved({ questionId: questionId, properlySaved: false })
    );
    dispatch(clearEditingInitialState());

    const highestExistingId = Math.max.apply(
      Math,
      curAdditionalInfo?.components?.map((comp: any) => comp.id)
    );

    if (
      highestExistingId &&
      typeof highestExistingId === "number" &&
      highestExistingId > -1
    ) {
      setIncreasingId(highestExistingId + 1);
    }

    if (curAdditionalInfo && Object.entries(curAdditionalInfo).length > 0) {
      dispatch(
        setEditingInitialState({
          obj: curAdditionalInfo,
        })
      );

      // set component amounts correct with states components to disable buttons respectively
      curAdditionalInfo.components?.forEach((comp: Dictionary<any>) => {
        setElementCounts((prevCounts: any) => ({
          ...prevCounts,
          [comp.type]: elementCounts[comp.type] + 1,
        }));
      });
    }
  }, []);

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
            <AdditionalInfoCtrlButtons questionId={questionId} />
            <div>
              <div className={styles.mainheader}>
                <p>{questionDataCurrentLanguage.question_code ?? null}</p>
                <p className={styles.headerspacing}>
                  {questionDataCurrentLanguage.text ?? null}
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
                          questionId={questionId}
                          compId={id}
                          onDelete={() => handleDelete(id, "upload")}
                          initValue={
                            curAdditionalInfo?.pictures
                              ? curAdditionalInfo?.pictures
                              : null
                          }
                        />
                      </div>
                    );
                  } else if (type === "link") {
                    return (
                      <div className={styles.componentcontainer}>
                        <AdditionalInfoPicturesContent
                          onlyLink
                          key={`key_${id}`}
                          questionId={questionId}
                          compId={id}
                          onDelete={() => handleDelete(id, "link")}
                          initValue={
                            curAdditionalInfo?.pictures
                              ? curAdditionalInfo?.pictures
                              : null
                          }
                        />
                      </div>
                    );
                  } else if (type === "comment") {
                    return (
                      <div className={styles.componentcontainer}>
                        <AdditionalInfoCommentContent
                          key={`key_${id}`}
                          questionId={questionId}
                          compId={id}
                          onDelete={() => handleDelete(id, "comment")}
                          initValue={curAdditionalInfo.comments ?? null}
                        />
                      </div>
                    );
                  } else if (type === "location") {
                    return (
                      <div className={styles.componentcontainer}>
                        <AdditionalInfoLocationContent
                          key={`key_${id}`}
                          questionId={questionId}
                          compId={id}
                          onDelete={() => handleDelete(id, "location")}
                          initValue={curAdditionalInfo.location ?? null}
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
  params,
  locales,
}) => {
  const lngDict = await i18nLoader(locales);

  const reduxStore = store;
  // reduxStore.dispatch({ type: CLEAR_STATE });
  const initialReduxState = reduxStore.getState();

  const questionId = Number(params?.questionId) ?? null;

  //e.g.
  const questionDataReq = await fetch(
    `${API_FETCH_BACKEND_QUESTIONS}?question_id=${questionId}&format=json`
  );
  const questionData = await questionDataReq.json();

  // const user = await checkUser(req);
  // if (!user) {
  //   // Invalid user but login is not required
  // }
  // if (user && user.authenticated) {
  //   initialReduxState.general.user = user;
  // }

  return {
    props: {
      questionId,
      questionData,
      initialReduxState,
      lngDict,
    },
  };
};

export default AdditionalInfo;
