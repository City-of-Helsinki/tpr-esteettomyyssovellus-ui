import React, { ReactElement } from "react";
import { useI18n } from "next-localization";
import Head from "next/head";
import { GetServerSideProps } from "next";
import Layout from "../../components/common/Layout";
import { store } from "../../state/store";
import i18nLoader from "../../utils/i18n";
import QuestionInfo from "../../components/QuestionInfo";
import styles from "./accessibilityEdit.module.scss";
import { StatusLabel, IconCrossCircle, IconQuestionCircle } from "hds-react";
import ServicepointMainInfoContent from "../../components/ServicepointMainInfoContent";
import { API_FETCH_QUESTIONBLOCK_URL, API_FETCH_QUESTIONCHOICES, API_FETCH_QUESTION_URL } from "../../types/constants";
import { useAppSelector, useAppDispatch } from "../../state/hooks";
import QuestionBlock from "../../components/QuestionBlock";
import { MainEntranceFormProps, QuestionBlockProps } from "../../types/general";
import HeadlineQuestionContainer from "../../components/HeadlineQuestionContainer";
import { LANGUAGE_LOCALES } from "../../types/constants";
import QuestionFormCtrlButtons from "../../components/QuestionFormCtrlButtons";

const AccessibilityEdit = ({QuestionsData, QuestionChoicesData, QuestionBlocksData}: MainEntranceFormProps): ReactElement => {
    const i18n = useI18n();
    const curLocale: string = i18n.locale();
    const curLocaleId: number = LANGUAGE_LOCALES[curLocale]
    let curAnsweredChoices = useAppSelector((state) => state.formReducer.answeredChoices);
    
    //console.log(curAnsweredChoices)
    let visibleBlocks = (QuestionBlocksData && QuestionsData && QuestionChoicesData)
        ? QuestionBlocksData.map((block: QuestionBlockProps) => {
            // The visible_if_question_choice is sometimes of form "1231+1231+12313+etc"
            const visibleQuestions = block.visible_if_question_choice?.split('+');
            // @ts-ignore: For some reason curAnsweredChoices type string[] contains numbers O_o
            const answersIncludeAllVisibleQuestions = visibleQuestions ?  visibleQuestions.some(elem => curAnsweredChoices.includes(Number(elem))) : false;
            //console.log(visibleQuestions)
            const isVisible =
                (block.visible_if_question_choice == null && block.language_id == curLocaleId) ||
                (answersIncludeAllVisibleQuestions) &&
                (block.language_id == curLocaleId);

            const blockQuestions = isVisible
                ? QuestionsData.filter((question) => question.question_block_id === block.question_block_id && question.language_id == curLocaleId)
                : null;
            //console.log(blockQuestions)
            const answerChoices = isVisible
                ? QuestionChoicesData.filter((choice) => choice.question_block_id === block.question_block_id && choice.language_id == curLocaleId)
                : null;
            {
                return isVisible && blockQuestions && answerChoices ? (
                <HeadlineQuestionContainer key={block.question_block_id} text={block.text}>
                    <QuestionBlock description={block.description ?? null} questions={blockQuestions} answers={answerChoices} />
                </HeadlineQuestionContainer>
                ) : null;
            }
            })
        : null;


        //console.log(QuestionBlocksData)
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
                        <h1>PH: Päiväkoti apila</h1>
                        <h2>PH: Pääsisäänkäynti:</h2>
                    </div>
                    <div>
                        {visibleBlocks}
                        <QuestionFormCtrlButtons hasCancelButton hasValidateButton hasSaveDraftButton hasPreviewButton />
                    </div>
                </div>
            </main>
        </Layout>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ req, locales }) => {
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

    let QuestionsData;
    let QuestionChoicesData;
    let QuestionBlocksData;
    try {
        // todo: put urls in types/constants and get form_id from props
        const QuestionsResp = await fetch(API_FETCH_QUESTION_URL);
        const QuestionChoicesResp = await fetch(API_FETCH_QUESTIONCHOICES);
        const QuestionBlocksResp = await fetch(API_FETCH_QUESTIONBLOCK_URL);

        QuestionsData = await QuestionsResp.json();
        QuestionChoicesData = await QuestionChoicesResp.json();
        QuestionBlocksData = await QuestionBlocksResp.json();
    } catch (e) {
        QuestionsData = {};
        QuestionChoicesData = {};
        QuestionBlocksData = {};
    }

    return {
        props: {
        initialReduxState,
        QuestionsData: QuestionsData,
        QuestionChoicesData: QuestionChoicesData,
        QuestionBlocksData: QuestionBlocksData,
        lngDict,
        },
    };
};

  

export default AccessibilityEdit;
