// TODO: file might need to be renamed eg. like additionalinfo/[id] where id is the question (?)

import React, { ReactElement } from "react";
import { useI18n } from "next-localization";
import Head from "next/head";
import { GetServerSideProps } from "next";
import { IconCrossCircle, IconLink, IconLocation, IconQuestionCircle, IconUpload } from "hds-react";
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


// TODO: need to know what page is e.g. picture, comment or location
const AdditionalInfo = (): ReactElement => {
  const i18n = useI18n();

  // TODO: not sure if this or different components better but for now here
  // TODO: this just placeholder
  const placeholderCurrent = 'location'
  let infoButton: JSX.Element | null = null;
  let infoText: string = '';
  let headerPrefix: string = ''

  // TODO: change logic and make come from the button clicked
  if (placeholderCurrent === 'location') {
    infoButton = (<QuestionButton variant="secondary" iconRight={<IconLocation/>}>{i18n.t("additionalInfo.addLocation")}</QuestionButton>);
    infoText= i18n.t("additionalInfo.locationInstructions");
    headerPrefix = i18n.t("additionalInfo.addLocation")

  }
  // if (placeholderCurrent === 'picture') {
  //   infoButton = (  <>
  //                     <QuestionButton variant="secondary" iconRight={<IconUpload/>}>{i18n.t("common.buttons.addPictureFromDevice")}</QuestionButton>
  //                     <QuestionButton variant="secondary" iconRight={<IconLink/>}>{i18n.t("common.buttons.addPictureLink")}</QuestionButton>
  //                   </>);
  //   infoText= i18n.t("additionalInfo.picturesInstructions");
  //   headerPrefix = i18n.t("additionalInfo.addPictures")
  // }
  // if (placeholderCurrent === 'comment') {
  //   infoText=i18n.t("additionalInfo.commentInstructions");
  //   headerPrefix = i18n.t("additionalInfo.addComment")
  // }

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
            <h2>PH: Pääsisäänkäynti: Katukatu 12, 00100 Helsinki</h2>
          </div>
          <div>
          <AdditionalInfoCtrlButtons />
          <div>
            <div className={styles.mainheader}>
              <p>{i18n.t("additionalInfo.addLocation")} {'>'} 1.4 Onko kulkureittiä</p>
            </div>
            <div className={styles.maininfoctrl}>
              { infoButton ? <div className={styles.maininfocontent}>{infoButton}</div> : null}
              <div className={styles.maininfocontent}>{infoText}</div>
            </div>
          </div>
          <div className={styles.overrideheadlinestyles}>
            {/* test */}
          <HeadlineQuestionContainer headline="PH: Lokaatio 1" initOpen> <AdditionalInfoLocationContent questionNumber="1" /></HeadlineQuestionContainer>
          {/* <HeadlineQuestionContainer headline="PH: Kuva 1" initOpen> <AdditionalInfoLocationContent questionNumber="2" /></HeadlineQuestionContainer> */}
          <HeadlineQuestionContainer headline="PH: Kuva 1" initOpen> <AdditionalInfoPicturesContent questionNumber="2" /> </HeadlineQuestionContainer>
          <HeadlineQuestionContainer headline="PH: Kuva 2" initOpen> <AdditionalInfoPicturesContent questionNumber="2" /> </HeadlineQuestionContainer>
          <HeadlineQuestionContainer headline="PH: Kommentti 1" initOpen> <AdditionalInfoCommentContent questionNumber="4" /> </HeadlineQuestionContainer>
          </div>
          <AdditionalInfoCtrlButtons />            
          </div>
          
        </div>
      </main>
    </Layout>
  );
};

// Server-side rendering
// Todo: edit, get servicepoint data
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

  return {
    props: {
      initialReduxState,
      lngDict,
    },
  };
};

export default AdditionalInfo;
