import React, { ReactElement, useEffect, useState } from "react";
import { useI18n } from "next-localization";
import Head from "next/head";
import { GetServerSideProps } from "next";
import { IconCrossCircle, IconLink, IconLocation, IconQuestionCircle, IconSpeechbubbleText, IconUpload } from "hds-react";
import Layout from "../../components/common/Layout";
import i18nLoader from "../../utils/i18n";
import styles from "./additionalInfo.module.scss";
import QuestionInfo from "../../components/QuestionInfo";
import ServicepointMainInfoContent from "../../components/ServicepointMainInfoContent";
import AdditionalInfoCtrlButtons from "../../components/AdditionalInfoCtrlButtons";
import QuestionButton from "../../components/QuestionButton";
import AdditionalInfoLocationContent from "../../components/AdditionalInfoLocationContent";
import AdditionalInfoPicturesContent from "../../components/AdditionalInfoPicturesContent";
import AdditionalInfoCommentContent from "../../components/AdditionalInfoCommentContent";
import { addComponent, removeAllInvalids, removeComponent, setEditingInitialState } from "../../state/reducers/additionalInfoSlice";
import { useAppSelector, useAppDispatch, useLoading } from "../../state/hooks";
import { BackendQuestion } from "../../types/backendModels";
import { AdditionalComponentProps, AdditionalInfoPageProps, ElementCountProps } from "../../types/general";
import { LanguageLocales, API_FETCH_BACKEND_QUESTIONS } from "../../types/constants";
import { setCurrentlyEditingQuestion } from "../../state/reducers/generalSlice";
import LoadSpinner from "../../components/common/LoadSpinner";

// usage: additional information page (per question)
const AdditionalInfo = ({ questionId, questionData }: AdditionalInfoPageProps): ReactElement => {
  const i18n = useI18n();
  // todo: figure out better way to id (?)
  // current checks biggest id from cur addinfo and increments, if no found start form zero
  // init for current highest id is doned in useEffect [] 'highestElementId'
  const [increasingId, setIncreasingId] = useState(0);
  const isLoading = useLoading();
  const dispatch = useAppDispatch();
  const curAdditionalInfo = useAppSelector((state) => state.additionalInfoReducer.additionalInfo[questionId]);

  // check/init addinfo can add comment / location and number of pictures able to add
  // disable control buttons for adding these components respectively
  const canAddCommentCount = questionData && questionData[0].can_add_comment === "Y" ? 0 : -1;
  const photoMaxCount = questionData && questionData[0].can_add_photo_max_count ? questionData[0]?.can_add_photo_max_count : -1;
  const canAddLocationCount = questionData && questionData[0].can_add_location === "Y" ? 0 : -1;

  const filterByLanguage = (data: BackendQuestion[]) => {
    const curLocale: string = i18n.locale();
    const curLocaleId: number = LanguageLocales[curLocale as keyof typeof LanguageLocales];
    return data.filter((entry: BackendQuestion) => {
      return entry.language_id === curLocaleId;
    });
  };

  const questionDataCurrentLanguage = questionData ? filterByLanguage(questionData).pop() : undefined;

  // element counts for control buttons
  const [elementCounts, setElementCounts] = useState<ElementCountProps>({
    comment: 0,
    upload: 0,
    link: 0,
    location: 0,
  });

  // add element to addinfo page, increment elementCounts
  const handleAddElement = (type: string) => {
    setElementCounts((prevCounts: ElementCountProps) => ({
      ...prevCounts,
      [type]: elementCounts[type] + 1,
    }));
    dispatch(
      addComponent({
        questionId,
        type,
        id: increasingId,
      })
    );
    setIncreasingId(increasingId + 1);
  };

  // remove component, decrease elementCount, remove invalid validations from that component
  const handleDelete = (deleteId: number, type: string) => {
    setElementCounts((prevCounts: ElementCountProps) => ({
      ...prevCounts,
      [type]: elementCounts[type] - 1,
    }));
    dispatch(removeComponent({ questionId, delId: deleteId }));
    dispatch(removeAllInvalids({ questionId, compId: deleteId }));
  };

  // for saving current state obj initial state for if user edits and cancels without saving to return to old state or empty if no init addinfo
  useEffect(() => {
    dispatch(setCurrentlyEditingQuestion(questionId));

    const highestIdState = curAdditionalInfo.components
      ? Math.max(...curAdditionalInfo.components.map((comp: AdditionalComponentProps) => comp.id))
      : -1;

    const highestExistingId = curAdditionalInfo?.components ? curAdditionalInfo.components.length + highestIdState : highestIdState;

    if (highestExistingId && typeof highestExistingId === "number" && highestExistingId > -1) {
      setIncreasingId(highestExistingId + 1);
    }

    if (curAdditionalInfo && Object.entries(curAdditionalInfo).length > 0) {
      dispatch(
        setEditingInitialState({
          obj: { [questionId]: curAdditionalInfo },
        })
      );

      // set component amounts correct with states components to disable buttons respectively
      curAdditionalInfo.components?.forEach((comp: AdditionalComponentProps) => {
        setElementCounts((prevCounts: ElementCountProps) => ({
          ...prevCounts,
          [comp.type]: elementCounts[comp.type] + 1,
        }));
      });
    }
  }, [curAdditionalInfo, elementCounts, questionId, dispatch]);

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
              <AdditionalInfoCtrlButtons questionId={questionId} />
              <div>
                <div className={styles.mainheader}>
                  <p>{questionDataCurrentLanguage?.question_code ?? null}</p>
                  <p className={styles.headerspacing}>{questionDataCurrentLanguage?.text ?? null}</p>
                </div>
                <div className={styles.maininfoctrl}>{i18n.t("additionalInfo.mainInfoText")}</div>
              </div>
              <div className={styles.overrideheadlinestyles}>
                {curAdditionalInfo?.components?.map((component: AdditionalComponentProps) => {
                  const { id } = component;
                  const { type } = component;
                  if (type === "upload") {
                    return (
                      <div className={styles.componentcontainer}>
                        <AdditionalInfoPicturesContent
                          key={`key_${id}`}
                          questionId={questionId}
                          compId={id}
                          onDelete={() => handleDelete(id, "upload")}
                          initValue={curAdditionalInfo?.pictures}
                        />
                      </div>
                    );
                  }
                  if (type === "link") {
                    return (
                      <div className={styles.componentcontainer}>
                        <AdditionalInfoPicturesContent
                          onlyLink
                          key={`key_${id}`}
                          questionId={questionId}
                          compId={id}
                          onDelete={() => handleDelete(id, "link")}
                          initValue={curAdditionalInfo?.pictures}
                        />
                      </div>
                    );
                  }
                  if (type === "comment") {
                    return (
                      <div className={styles.componentcontainer}>
                        <AdditionalInfoCommentContent
                          key={`key_${id}`}
                          questionId={questionId}
                          compId={id}
                          onDelete={() => handleDelete(id, "comment")}
                          initValue={curAdditionalInfo.comments}
                        />
                      </div>
                    );
                  }
                  if (type === "location") {
                    return (
                      <div className={styles.componentcontainer}>
                        <AdditionalInfoLocationContent
                          key={`key_${id}`}
                          questionId={questionId}
                          compId={id}
                          onDelete={() => handleDelete(id, "location")}
                          initValue={curAdditionalInfo.locations?.coordinates}
                        />
                      </div>
                    );
                  }
                  return <></>;
                })}
              </div>
              <div className={styles.editedelementsctrl}>
                <h3>{i18n.t("additionalInfo.elementsCtrlButtonsHeader")}</h3>
                <div className={styles.editedelementsctrlbuttons}>
                  <QuestionButton
                    variant="secondary"
                    iconRight={<IconSpeechbubbleText />}
                    onClickHandler={() => handleAddElement("comment")}
                    disabled={elementCounts.comment > canAddCommentCount}
                  >
                    {i18n.t("additionalInfo.ctrlButtons.addNewComment")}
                  </QuestionButton>
                  <QuestionButton
                    variant="secondary"
                    iconRight={<IconUpload />}
                    onClickHandler={() => handleAddElement("upload")}
                    disabled={elementCounts.upload + elementCounts.link >= photoMaxCount}
                  >
                    {i18n.t("additionalInfo.ctrlButtons.addUploadImageFromDevice")}
                  </QuestionButton>
                  <QuestionButton
                    variant="secondary"
                    iconRight={<IconLink />}
                    onClickHandler={() => handleAddElement("link")}
                    disabled={elementCounts.upload + elementCounts.link >= photoMaxCount}
                  >
                    {i18n.t("additionalInfo.ctrlButtons.addPictureLink")}
                  </QuestionButton>
                  <QuestionButton
                    variant="secondary"
                    iconRight={<IconLocation />}
                    onClickHandler={() => handleAddElement("location")}
                    disabled={elementCounts.location > canAddLocationCount}
                  >
                    {i18n.t("additionalInfo.ctrlButtons.addNewLocation")}
                  </QuestionButton>
                </div>
              </div>
              <AdditionalInfoCtrlButtons questionId={questionId} />
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

  const questionId = Number(params?.questionId) ?? null;

  const questionDataReq = await fetch(`${API_FETCH_BACKEND_QUESTIONS}?question_id=${questionId}&format=json`);
  const questionData = await (questionDataReq.json() as Promise<BackendQuestion[]>);

  return {
    props: {
      questionId,
      questionData,
      lngDict,
    },
  };
};

export default AdditionalInfo;
