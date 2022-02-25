import React, { ReactElement } from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useI18n } from "next-localization";
import { makeStyles } from "@material-ui/core/styles";
import i18nLoader from "../utils/i18n";
import Layout from "../components/common/Layout";
import styles from "./index.module.scss";
import { Hero, HeroShallow } from "../components/common/Hero";

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

  const heroTitle = i18n.t("common.header.servicepoints");
  const heroText = "";

  const heroUrl = "/homepagephoto.png";

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
      </main>
    </Layout>
  );
};

// Server-side rendering
export const getServerSideProps: GetServerSideProps = async ({ locales }) => {
  const lngDict = await i18nLoader(locales);

  return {
    props: {
      lngDict,
    },
  };
};

export default Main;
