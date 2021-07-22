import React, { ReactElement, useState, useEffect } from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useI18n } from "next-localization";
import { Button, IconAngleRight, IconStar, Koros } from "hds-react";
import { makeStyles } from "@material-ui/core/styles";
import { store } from "../state/store";
import i18nLoader from "../utils/i18n";
import Layout from "../components/common/Layout";
import Notice from "../components/common/Notice";
import styles from "./index.module.scss";
import { checkUser } from "../utils/serverside";
import { useAppSelector, useAppDispatch } from "../state/hooks";
import { decrement } from "../state/reducers/exampleSlice";
import HeadlineQuestionContainer from "../components/HeadlineQuestionContainer";
import QuestionBlock from "../components/QuestionBlock";
import QuestionFormCtrlButtons from "../components/QuestionFormCtrlButtons";
import SearchBoxWithButtons from "../components/SearchBoxWithButtons";
import SearchBoxWithButtonsMobile from "../components/SearchBoxWithButtonsMobile";
import { Hero, HeroShallow } from "../components/common/Hero";
import { MainEntranceFormProps, QuestionBlockProps } from "../types/general";
import { FRONT_URL_BASE, LANGUAGE_LOCALES } from "../types/constants";
import { connect } from "react-redux";

import { setAnsweredChoice } from "../state/reducers/formSlice";
import {
  API_FETCH_QUESTIONBLOCK_URL,
  API_FETCH_QUESTIONCHOICES,
  API_FETCH_QUESTION_URL
} from "../types/constants";

const useStyles = makeStyles((theme) => ({
  navi: {
    zIndex: 10000,
    fontFamily: "HelsinkiGrotesk",
    fontSize: 16
  },
  mainGrid: {
    marginTop: theme.spacing(3)
  },
  hero: (heroShallow: Boolean) => ({
    height: heroShallow ? 360 : 550
  }),
  main: {},
  paragraphs: {
    marginTop: 56
  }
}));

const Main = ({
  isMobile,
  QuestionsData,
  QuestionChoicesData,
  QuestionBlocksData
}: MainEntranceFormProps): ReactElement => {
  const i18n = useI18n();
  const curLocale: string = i18n.locale();
  // @ts-ignore: TODO:
  const curLocaleId: number = LANGUAGE_LOCALES[curLocale];
  const dispatch = useAppDispatch();

  const openTermsOfUse = () => {
    window.open("www.google.com", "_blank");
  };

  let curAnsweredChoices = useAppSelector(
    (state) => state.formReducer.answeredChoices
  );

  // This checks whether the view has become so thin, i.e. mobile view, that the languageselector component should change place.
  if (typeof window !== "undefined") {
    const [width, setWidth] = useState<number>(window.innerWidth);
    useEffect(() => {
      window.addEventListener("resize", () => setWidth(window.innerWidth));
      return () => {
        window.removeEventListener("resize", () => setWidth(window.innerWidth));
      };
    }, []);
    isMobile = width < 768;
  }

  let heroTitle = i18n.t("common.landing.title");
  let heroText = "";
  // let heroUrl = "https://i.stack.imgur.com/y9DpT.jpg";
  // let heroUrl = "https://i.stack.imgur.com/y9DpT.jpg";

  const heroUrl = FRONT_URL_BASE + "homepagephoto.png";

  // TODO: isHero variable can be removed if the hero component is placed directly to index.tsx. If it is placed into a page templ
  // let isHero = true;
  const heroShallow = false;
  const classes = useStyles(heroShallow);

  return (
    <Layout>
      <Head>
        <title>{i18n.t("common.header.title")}</title>
      </Head>
      <main id="content" className={styles.content}>
        {
          // isHero ? ()
          // isHero ? (
          <div className={classes.hero}>
            {heroShallow ? (
              <HeroShallow title={heroTitle} imageUrl={heroUrl} />
            ) : (
              <Hero title={heroTitle} text={heroText} imageUrl={heroUrl} />
            )}
          </div>
          /* ) : (
          <></>
        )*/
        }
        <div>
          {isMobile ? <SearchBoxWithButtonsMobile /> : <SearchBoxWithButtons />}
        </div>
        {/*
        <div className={styles.infoLinkContainer}>
          <Button variant="supplementary" size="small" iconRight={<IconAngleRight aria-hidden />} onClick={openTermsOfUse}>
            {i18n.t("common.header.title")}
          </Button>
        </div>

        for redux-toolkit example -> delete
        <h2>{`count is: ${curCount}`}</h2>

        <Notice
          className={styles.modifyOwnPlace}
          icon={<IconStar size="xl" aria-hidden />}
          titleKey=""
          messageKey=""
          button={
            <Link href="/">
              <Button variant="secondary" onClick={handleTestButton}>
                {" "}
                test button{" "}
              </Button>
            </Link>
          }
        />
        */}
        {/* for demo purposes modify with data / delete later */}
        {/* QuestionsData, QuestionChoicesData, QuestionBlocksData */}

        {QuestionBlocksData && QuestionsData && QuestionChoicesData
          ? QuestionBlocksData.map((block: QuestionBlockProps) => {
              const isVisible =
                (block.visible_if_question_choice == null &&
                  block.language_id == curLocaleId) ||
                (curAnsweredChoices.includes(
                  block.visible_if_question_choice
                    ? block.visible_if_question_choice
                    : ""
                ) &&
                  block.language_id == curLocaleId);

              const blockQuestions = isVisible
                ? QuestionsData.filter(
                    (question) =>
                      question.question_block_id === block.question_block_id &&
                      question.language_id == curLocaleId
                  )
                : null;

              const answerChoices = isVisible
                ? QuestionChoicesData.filter(
                    (choice) =>
                      choice.question_block_id === block.question_block_id &&
                      choice.language_id == curLocaleId
                  )
                : null;
              {
                return isVisible && blockQuestions && answerChoices ? (
                  <HeadlineQuestionContainer
                    key={block.question_block_id}
                    text={block.text}
                  >
                    <QuestionBlock
                      description={block.description ?? null}
                      questions={blockQuestions}
                      answers={answerChoices}
                    />
                  </HeadlineQuestionContainer>
                ) : null;
              }
            })
          : null}

        {/* <HeadlineQuestionContainer headline="1. ensimmäinen otsikko">
          {" "}
          <QuestionBlock />
        </HeadlineQuestionContainer>
        <HeadlineQuestionContainer headline="2. toinen otsikko">
          {" "}
          <QuestionBlock />{" "}
        </HeadlineQuestionContainer> */}
        <QuestionFormCtrlButtons
          hasCancelButton
          hasValidateButton
          hasSaveDraftButton
          hasPreviewButton
        />
      </main>
    </Layout>
  );
};

// Server-side rendering
export const getServerSideProps: GetServerSideProps = async ({
  params,
  req,
  locales
}) => {
  const lngDict = await i18nLoader(locales);

  const reduxStore = store;
  // reduxStore.dispatch({ type: CLEAR_STATE });
  const initialReduxState = reduxStore.getState();

  const user = await checkUser(req);
  if (!user) {
    // Invalid user but login is not required
  }
  if (user && user.authenticated) {
    initialReduxState.general.user = user;
  }

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
      lngDict
    }
  };
};

Main.defaultProps = {
  isMobile: false
};

export default Main;
