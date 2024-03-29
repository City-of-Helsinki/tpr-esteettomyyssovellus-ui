import React, { ReactElement } from "react";
import { GetServerSideProps } from "next";
import { useI18n } from "next-localization";
import Head from "next/head";
import Layout from "../../../../components/common/Layout";
import LoadSpinner from "../../../../components/common/LoadSpinner";
import PageHelp from "../../../../components/common/PageHelp";
import ValidationSummary from "../../../../components/common/ValidationSummary";
import AdditionalComment from "../../../../components/AdditionalComment";
import AdditionalCommentCtrlButtons from "../../../../components/AdditionalCommentCtrlButtons";
import { useAppSelector, useLoading } from "../../../../state/hooks";
import { formatAddress, getTokenHash } from "../../../../utils/utilFunctions";
import {
  API_FETCH_BACKEND_ENTRANCE,
  API_FETCH_BACKEND_FORM_GUIDE,
  API_FETCH_BACKEND_SERVICEPOINT,
  API_FETCH_ENTRANCES,
  API_FETCH_QUESTIONBLOCK_URL,
  API_URL_BASE,
} from "../../../../types/constants";
import {
  BackendEntrance,
  BackendFormGuide,
  BackendQuestionBlock,
  BackendServicepoint,
  Entrance,
  EntranceResults,
} from "../../../../types/backendModels";
import { EntranceQuestionBlockCommentProps } from "../../../../types/general";
import i18nLoader from "../../../../utils/i18n";
import { getMaxLogId, validateServicepointHash } from "../../../../utils/serverside";
import styles from "./blockComment.module.scss";

// usage: the comments of a question block for an entrance
const EntranceQuestionBlockComment = ({
  servicepointData,
  entranceData,
  questionBlockId,
  block,
  formGuideData,
  formId,
  isChecksumValid,
}: EntranceQuestionBlockCommentProps): ReactElement => {
  const i18n = useI18n();
  const curLocale: string = i18n.locale();
  const isLoading = useLoading();

  const user = useAppSelector((state) => state.generalSlice.user);
  const checksum = useAppSelector((state) => state.generalSlice.checksum);
  const isUserValid = !!user && user.length > 0;

  // NOTE: don't clear the state in this page, since any new data should be used after returning to the question form
  /*
  useEffect(() => {
    // Clear the state on initial load
    persistor.purge();
  }, []);
  */

  const curServicepointId = useAppSelector((state) => state.formReducer.currentServicepointId);
  const curEntranceId = useAppSelector((state) => state.formReducer.currentEntranceId);
  const curQuestionBlockComments = useAppSelector((state) => state.additionalInfoReducer.questionBlockComments);
  const curQuestionBlockCommentValid = useAppSelector((state) => state.additionalInfoReducer.questionBlockCommentValid);
  const questionBlockCommentValidationTime = useAppSelector((state) => state.additionalInfoReducer.questionBlockCommentValidationTime);

  const hasData = Object.keys(servicepointData).length > 0 && curServicepointId === servicepointData.servicepoint_id;
  const isExistingEntrance = hasData && Object.keys(entranceData).length > 0;

  // Note: There is no sub-header for meeting rooms (form id 2)
  const entranceName = entranceData ? entranceData[`name_${curLocale}`] : "";
  const entranceHeader =
    formId === 0
      ? `${i18n.t("common.mainEntrance")}: ${formatAddress(
          servicepointData.address_street_name,
          servicepointData.address_no,
          servicepointData.address_city
        )}`
      : `${i18n.t("common.entrance")}: ${entranceName}`;
  const newEntranceHeader = formId === 0 ? i18n.t("common.mainEntrance") : i18n.t("common.newEntrance");
  const servicePointHeader = isExistingEntrance ? entranceHeader : newEntranceHeader;
  const subHeader = formId >= 2 ? "" : servicePointHeader;

  const { text } = block;

  // Show the comments for this question block
  const filteredQuestionBlockComment = curQuestionBlockComments.find((blockComment) => {
    return blockComment.question_block_id === questionBlockId;
  });
  const { invalidValues = [] } = filteredQuestionBlockComment || {};

  const treeItems = {
    [servicepointData.servicepoint_name ?? ""]: hasData ? `/details/${servicepointData.servicepoint_id}?checksum=${checksum}` : "",
    [i18n.t("servicepoint.contactFormSummaryHeader")]:
      curEntranceId > 0
        ? `/entranceAccessibility/${curServicepointId}/${curEntranceId}?checksum=${checksum}`
        : `/entranceAccessibility/${curServicepointId}?checksum=${checksum}`,
    [`${i18n.t("additionalInfo.additionalInfo")} > ${text}`]:
      curEntranceId > 0
        ? `/blockComment/${curServicepointId}/${questionBlockId}/${curEntranceId}?checksum=${checksum}`
        : `/blockComment/${curServicepointId}/${questionBlockId}?checksum=${checksum}`,
  };

  return (
    <Layout>
      <Head>
        <title>{i18n.t("common.header.title")}</title>
      </Head>
      {!isChecksumValid && <h1>{i18n.t("common.invalidParams")}</h1>}

      {isChecksumValid && !isUserValid && <h1>{i18n.t("common.notAuthorized")}</h1>}

      {isChecksumValid && isUserValid && isLoading && <LoadSpinner />}

      {isChecksumValid && isUserValid && !isLoading && !hasData && <h1>{i18n.t("common.noData")}</h1>}

      {isChecksumValid && isUserValid && !isLoading && hasData && (
        <main id="content">
          <div className={styles.maincontainer}>
            <div className={styles.infocontainer}>
              <PageHelp formGuideData={formGuideData} treeItems={treeItems} />
            </div>

            <div className={styles.headingcontainer}>
              <h1>{servicepointData.servicepoint_name}</h1>
              <div className={styles.subHeader}>{subHeader}</div>

              <div className={styles.mainbuttons}>
                <AdditionalCommentCtrlButtons questionBlockId={questionBlockId} questionBlockComment={filteredQuestionBlockComment} />
                {!curQuestionBlockCommentValid && (
                  <ValidationSummary
                    pageValid={curQuestionBlockCommentValid}
                    validationSummary={invalidValues}
                    validationTime={questionBlockCommentValidationTime}
                  />
                )}
              </div>

              <div className={styles.infoHeader}>{`${i18n.t("additionalInfo.additionalInfo")} > ${text}`}</div>
              <div className={styles.infoText}>
                <div>{i18n.t("additionalInfo.fillComment")}</div>
              </div>
            </div>

            <div className={styles.contentcontainer}>
              <AdditionalComment questionBlockId={questionBlockId} questionBlockComment={filteredQuestionBlockComment} />
            </div>

            <div className={styles.footercontainer}>
              <div className={styles.footerbutton}>
                <AdditionalCommentCtrlButtons questionBlockId={questionBlockId} questionBlockComment={filteredQuestionBlockComment} />
              </div>
            </div>
          </div>
        </main>
      )}
    </Layout>
  );
};

// Server-side rendering
export const getServerSideProps: GetServerSideProps = async ({ params, query, locales }) => {
  const lngDict = await i18nLoader(locales);

  let servicepointData: BackendServicepoint = {} as BackendServicepoint;
  let entranceData: BackendEntrance = {} as BackendEntrance;
  let questionBlockId = -1;
  let block: BackendQuestionBlock = {} as BackendQuestionBlock;
  let formGuideData: BackendFormGuide[] = [];
  let formId = -1;

  const isChecksumValid = params !== undefined && query !== undefined && validateServicepointHash(Number(params.servicepointId), query.checksum);

  if (isChecksumValid && params !== undefined) {
    try {
      questionBlockId = Number(params.questionBlockId);

      const servicepointBackendDetailResp = await fetch(
        `${API_URL_BASE}${API_FETCH_BACKEND_SERVICEPOINT}?servicepoint_id=${params.servicepointId}&format=json`,
        {
          headers: new Headers({ Authorization: getTokenHash() }),
        }
      );
      const servicepointBackendDetail = await (servicepointBackendDetailResp.json() as Promise<BackendServicepoint[]>);

      if (servicepointBackendDetail?.length > 0) {
        servicepointData = servicepointBackendDetail[0];
      }

      // Get all the existing entrances for the service point
      const servicepointEntranceResp = await fetch(`${API_URL_BASE}${API_FETCH_ENTRANCES}?servicepoint=${params.servicepointId}&format=json`, {
        headers: new Headers({ Authorization: getTokenHash() }),
      });
      const servicepointEntranceResults = await (servicepointEntranceResp.json() as Promise<EntranceResults>);

      const mainEntrance = servicepointEntranceResults?.results?.find((result) => result.is_main_entrance === "Y");
      let isMainEntrancePublished = false;
      if (!!mainEntrance) {
        // The main entrance exists, but check if it's published
        const entranceDetailResp = await fetch(`${API_URL_BASE}${API_FETCH_BACKEND_ENTRANCE}?entrance_id=${mainEntrance.entrance_id}&format=json`, {
          headers: new Headers({ Authorization: getTokenHash() }),
        });
        const entranceDetail = await (entranceDetailResp.json() as Promise<BackendEntrance[]>);
        isMainEntrancePublished = entranceDetail.some((e) => e.form_submitted === "Y");
      } else {
        isMainEntrancePublished = false;
      }

      // Check this specific entrance
      if (params.entranceId === undefined && (servicepointData.servicepoint_id === undefined || servicepointData.new_entrance_possible === "Y")) {
        // New entrance
        // This is a new main entrance if not existing, otherwise an additional entrance
        formId = !isMainEntrancePublished || !mainEntrance || servicepointData.servicepoint_id === undefined ? 0 : 1;
      } else if (params.entranceId !== undefined) {
        // Existing entrance
        const entranceResp = await fetch(`${API_URL_BASE}${API_FETCH_ENTRANCES}${params.entranceId}/?format=json`, {
          headers: new Headers({ Authorization: getTokenHash() }),
        });
        const entrance = await (entranceResp.json() as Promise<Entrance>);

        // Use the form id from the entrance if available
        formId = entrance ? entrance.form : -1;

        const entranceDetailResp = await fetch(`${API_URL_BASE}${API_FETCH_BACKEND_ENTRANCE}?entrance_id=${params.entranceId}&format=json`, {
          headers: new Headers({ Authorization: getTokenHash() }),
        });
        const entranceDetail = await (entranceDetailResp.json() as Promise<BackendEntrance[]>);
        if (entranceDetail.length > 0) {
          // Return entrance data for the published log id if available (form_submitted = 'Y'), otherwise the draft log id (form_submitted = 'D')
          const maxLogId = getMaxLogId(entranceDetail);
          entranceData = entranceDetail.find((a) => a.log_id === maxLogId) as BackendEntrance;

          // In some cases there is no published entrance, so form_submitted and log_id are null
          if (!entranceData) {
            entranceData = entranceDetail[0];
          }
        }
      }

      // Get the question block related to this comment
      const questionBlocksResp = await fetch(
        `${API_URL_BASE}${API_FETCH_QUESTIONBLOCK_URL}?format=json&form_id=${formId}&question_block_id=${questionBlockId}`,
        {
          headers: new Headers({ Authorization: getTokenHash() }),
        }
      );
      const questionBlocksData = await (questionBlocksResp.json() as Promise<BackendQuestionBlock[]>);

      if (questionBlocksData?.length > 0) {
        block = questionBlocksData[0];
      }

      // Get the guide text using the form id for this entrance
      if (formId >= 0) {
        const formGuideResp = await fetch(`${API_URL_BASE}${API_FETCH_BACKEND_FORM_GUIDE}?form_id=${formId}`, {
          headers: new Headers({ Authorization: getTokenHash() }),
        });
        formGuideData = await (formGuideResp.json() as Promise<BackendFormGuide[]>);
      }
    } catch (err) {
      console.error("Error", err);
    }
  }

  return {
    props: {
      lngDict,
      servicepointData,
      entranceData,
      questionBlockId,
      block,
      formGuideData,
      formId,
      isChecksumValid,
    },
  };
};

export default EntranceQuestionBlockComment;
