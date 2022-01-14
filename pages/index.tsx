import React, { ReactElement, useState, useEffect } from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useI18n } from "next-localization";
import { makeStyles } from "@material-ui/core/styles";
// import store from "../state/store";
import i18nLoader from "../utils/i18n";
import Layout from "../components/common/Layout";
import styles from "./index.module.scss";
import SearchBoxWithButtons from "../components/SearchBoxWithButtons";
import SearchBoxWithButtonsMobile from "../components/SearchBoxWithButtonsMobile";
import { Hero, HeroShallow } from "../components/common/Hero";
import { FRONT_URL_BASE } from "../types/constants";

const useStyles = makeStyles((theme) => ({
  navi: {
    zIndex: 10000,
    fontFamily: "HelsinkiGrotesk",
    fontSize: 16,
  },
  mainGrid: {
    marginTop: theme.spacing(3),
  },
  hero: (props: { heroShallow: boolean }) => ({
    height: props.heroShallow ? 360 : 550,
  }),
  main: {},
  paragraphs: {
    marginTop: 56,
  },
}));

const Main = (): ReactElement => {
  const i18n = useI18n();

  // This checks whether the view has become so thin, i.e. mobile view, that the languageselector component should change place.
  const [width, setWidth] = useState<number>(0);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setWidth(window.innerWidth);
      window.addEventListener("resize", () => setWidth(window.innerWidth));
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", () => setWidth(window.innerWidth));
      }
    };
  }, []);
  const isMobile = width < 768;

  const heroTitle = i18n.t("common.landing.title");
  const heroText = "";

  const heroUrl = `${FRONT_URL_BASE}homepagephoto.png`;

  // TODO: isHero variable can be removed if the hero component is placed directly to index.tsx. If it is placed into a page templ
  // let isHero = true;
  const heroShallow = false;
  const classes = useStyles({ heroShallow });

  return (
    <Layout>
      <Head>
        <title>{i18n.t("common.header.title")}</title>
      </Head>
      <main id="content" className={styles.content}>
        <div className={classes.hero}>
          {heroShallow ? <HeroShallow title={heroTitle} imageUrl={heroUrl} /> : <Hero title={heroTitle} text={heroText} imageUrl={heroUrl} />}
        </div>
        <div>{isMobile ? <SearchBoxWithButtonsMobile /> : <SearchBoxWithButtons />}</div>
      </main>
    </Layout>
  );
};

// Server-side rendering
export const getServerSideProps: GetServerSideProps = async ({ locales }) => {
  const lngDict = await i18nLoader(locales);

  // todo: if user not checked here remove these
  // also reduxStore and reduxStore.getState() need to be changed to redux-toolkit
  // const reduxStore = store;
  // const initialReduxState = reduxStore.getState();

  // const user = await checkUser(req);
  // if (!user) {
  //   // Invalid user but login is not required
  // }
  // if (user && user.authenticated) {
  //   initialReduxState.general.user = user;
  // }

  return {
    props: {
      lngDict,
    },
  };
};

export default Main;
