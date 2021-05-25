import React, { ReactElement } from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useI18n } from "next-localization";
import { Button, IconAngleRight, IconStar, Koros } from "hds-react";
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
import SearchBoxWithButtons from "../components/SearchBoxWithButtons";

const Main = (): ReactElement => {
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

  return (
    <Layout>
      <Head>
        <title>{i18n.t("common.header.title")}</title>
      </Head>
      <main id="content" className={styles.content}>
        <div>
          <SearchBoxWithButtons></SearchBoxWithButtons>
        </div>

        <div className={styles.infoLinkContainer}>
          <Button variant="supplementary" size="small" iconRight={<IconAngleRight aria-hidden />} onClick={openTermsOfUse}>
            {i18n.t("common.header.title")}
          </Button>
        </div>

        {/* for redux-toolkit example -> delete */}
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
      lngDict,
    },
  };
};

export default Main;
