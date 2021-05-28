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
import QuestionFormCtrlButtons from "../components/QuestionFormCtrlButtons";
<<<<<<< Updated upstream
import SearchBoxWithButtons from "../components/SearchBoxWithButtons";
import SearchBoxWithButtonsMobile from "../components/SearchBoxWithButtonsMobile";
import { makeStyles } from '@material-ui/core/styles';
import {Hero, HeroShallow} from "../components/common/Hero";
=======
import { Hero, HeroShallow } from "../components/common/Hero";
>>>>>>> Stashed changes

const useStyles = makeStyles((theme) => ({
  navi: {
    zIndex: 10000,
    fontFamily: "HelsinkiGrotesk",
    fontSize: 16,
  },
  mainGrid: {
    marginTop: theme.spacing(3),
  },
  hero: (heroShallow: boolean) => ({
    height: heroShallow ? 360 : 550,
  }),
  main: {},
  paragraphs: {
    marginTop: 56,
  },
}));


interface MainProps {
  isMobile?: boolean
}

const Main = ({isMobile}: MainProps): ReactElement => {
  const i18n = useI18n();

  const openTermsOfUse = () => {
    window.open("www.google.com", "_blank");
  };

  // TODO: delete this just example
  const curCount = useAppSelector((state) => state.exampleReducer.value);
  const dispatch = useAppDispatch();

  // TODO: delete this just example
  const handleTestButton = (): void => {
    console.log(curCount);
    dispatch(decrement());
  };

<<<<<<< Updated upstream
  // This checks whether the view has become so thin, i.e. mobile view, that the languageselector component should change place.
  if (typeof window !== "undefined") {
    const [width, setWidth] = useState<number>(window.innerWidth);
    useEffect(() => {
      window.addEventListener('resize', () => setWidth(window.innerWidth));
      return () => {
          window.removeEventListener('resize', () => setWidth(window.innerWidth));
      }
    }, []);
    isMobile = (width < 768);
  }

  let heroTitle = i18n.t("common.landing.title");
  let heroText = ""
  //let heroUrl = "https://i.stack.imgur.com/y9DpT.jpg";
  const heroTitle = i18n.t("common.landing.title");
  const heroText = "";
  // let heroUrl = "https://i.stack.imgur.com/y9DpT.jpg";

  const heroUrl = "http://localhost:3000/homepagephoto.png";

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
        
      {// isHero ? (
        {
          // isHero ? (
          <div className={classes.hero}>
            {heroShallow ? <HeroShallow title={heroTitle} imageUrl={heroUrl} /> : <Hero title={heroTitle} text={heroText} imageUrl={heroUrl} />}
          </div>
          /* ) : (
          <></>
        )*/}
        <div>
          { isMobile ? 
          (<SearchBoxWithButtonsMobile/>) : 
          (<SearchBoxWithButtons/>)}
        </div>
        ) */
        }

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
        <HeadlineQuestionContainer headline="1. ensimmäinen otsikko" />
        <HeadlineQuestionContainer headline="2. toinen otsikko" />
        <QuestionFormCtrlButtons hasCancelButton hasValidateButton hasSaveDraftButton hasPreviewButton />
      </main>
    </Layout>
  );
};

// Server-side rendering
export const getServerSideProps: GetServerSideProps = async ({ req, locales }) => {
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

  return {
    props: {
      initialReduxState,
      lngDict
    },
  };
};

Main.defaultProps = {
  isMobile: false
};


export default Main;
