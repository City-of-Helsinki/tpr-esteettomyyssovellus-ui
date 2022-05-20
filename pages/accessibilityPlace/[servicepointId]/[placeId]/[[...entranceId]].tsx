import React, { ReactElement } from "react";
import { GetServerSideProps } from "next";
import { useI18n } from "next-localization";
import Head from "next/head";
import { IconCrossCircle, IconQuestionCircle } from "hds-react";
import Layout from "../../../../components/common/Layout";
import ValidationSummary from "../../../../components/common/ValidationSummary";
import QuestionInfo from "../../../../components/QuestionInfo";
import ServicepointMainInfoContent from "../../../../components/ServicepointMainInfoContent";
import PathTreeComponent from "../../../../components/PathTreeComponent";
import AccessibilityPlaceBox from "../../../../components/AccessibilityPlaceBox";
import AccessibilityPlaceCtrlButtons from "../../../../components/AccessibilityPlaceCtrlButtons";
import AccessibilityPlaceNewButton from "../../../../components/AccessibilityPlaceNewButton";
import LoadSpinner from "../../../../components/common/LoadSpinner";
import { useAppSelector, useLoading } from "../../../../state/hooks";
import { formatAddress, getTokenHash } from "../../../../utils/utilFunctions";
import {
  API_FETCH_BACKEND_ENTRANCE,
  API_FETCH_BACKEND_PLACES,
  API_FETCH_BACKEND_SERVICEPOINT,
  API_FETCH_ENTRANCES,
  API_URL_BASE,
  LanguageLocales,
} from "../../../../types/constants";
import { BackendEntrance, BackendPlace, BackendServicepoint, Entrance, EntranceResults } from "../../../../types/backendModels";
import { AccessibilityPlaceProps } from "../../../../types/general";
import i18nLoader from "../../../../utils/i18n";
import styles from "./accessibilityPlace.module.scss";

// usage: the accessibility place of a question
const AccessibilityPlace = ({ servicepointData, entranceData, accessibilityPlaceData, formId }: AccessibilityPlaceProps): ReactElement => {
  const i18n = useI18n();
  const curLocale: string = i18n.locale();
  const isLoading = useLoading();

  const treeItems = [servicepointData.servicepoint_name ?? ""];

  // TODO - improve this by checking user on server-side
  const user = useAppSelector((state) => state.generalSlice.user);
  const isUserValid = !!user && user.length > 0;

  // NOTE: don't clear the state in this page, since any new data should be used after returning to the question form
  /*
  useEffect(() => {
    // Clear the state on initial load
    persistor.purge();
  }, []);
  */

  const curServicepointId = useAppSelector((state) => state.formReducer.currentServicepointId);
  // const curEntranceId = useAppSelector((state) => state.formReducer.currentEntranceId);
  const curEntrancePlaceBoxes = useAppSelector((state) => state.additionalInfoReducer.entrancePlaceBoxes);
  const curEntrancePlaceValid = useAppSelector((state) => state.additionalInfoReducer.entrancePlaceValid);

  const hasData = Object.keys(servicepointData).length > 0 && curServicepointId === servicepointData.servicepoint_id;
  const isExistingEntrance = hasData && Object.keys(entranceData).length > 0;

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
  const subHeader = isExistingEntrance ? entranceHeader : newEntranceHeader;

  const localeId: number = LanguageLocales[i18n.locale() as keyof typeof LanguageLocales];
  const filteredPlaceData = accessibilityPlaceData?.find((place) => place.language_id === localeId) ?? ({} as BackendPlace);

  // Show the boxes for this entrance place that have not been deleted
  const filteredEntrancePlaceBoxes = curEntrancePlaceBoxes
    ? curEntrancePlaceBoxes
        .filter((placeBox) => {
          return placeBox.place_id === filteredPlaceData.place_id && !placeBox.isDeleted;
        })
        .sort((a, b) => (a.order_number ?? 1) - (b.order_number ?? 1))
    : [];
  const filteredEntrancePlaceInvalidValues = filteredEntrancePlaceBoxes.flatMap((box) => box.invalidValues);

  return (
    <Layout>
      <Head>
        <title>{i18n.t("notification.title")}</title>
      </Head>
      {!isUserValid && <h1>{i18n.t("common.notAuthorized")}</h1>}

      {isUserValid && isLoading && <LoadSpinner />}

      {isUserValid && !isLoading && !hasData && <h1>{i18n.t("common.noData")}</h1>}

      {isUserValid && !isLoading && hasData && (
        <main id="content">
          <div className={styles.maincontainer}>
            <div className={styles.treecontainer}>
              <PathTreeComponent treeItems={treeItems} />
            </div>

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
              <h1>{servicepointData.servicepoint_name}</h1>
              <div className={styles.subHeader}>{subHeader}</div>

              <div className={styles.mainbuttons}>
                <AccessibilityPlaceCtrlButtons placeId={filteredPlaceData.place_id} entrancePlaceBoxes={filteredEntrancePlaceBoxes} />
                {!curEntrancePlaceValid && (
                  <ValidationSummary pageValid={curEntrancePlaceValid} validationSummary={filteredEntrancePlaceInvalidValues} />
                )}
              </div>

              <div className={styles.infoHeader}>{`${i18n.t("additionalInfo.additionalInfo")} > ${filteredPlaceData.name}`}</div>
              <div className={styles.infoText}>
                <div>{`${i18n.t("additionalInfo.fillPlaceData1")} '${filteredPlaceData.name}' ${i18n.t("additionalInfo.fillPlaceData2")}`}</div>
                <div>{i18n.t("additionalInfo.orderPlaceData")}</div>
              </div>
            </div>

            <div>
              {filteredEntrancePlaceBoxes.map((entrancePlaceBox, index) => {
                const key = `box_${index}`;
                return (
                  <AccessibilityPlaceBox key={key} entrancePlaceBox={entrancePlaceBox} canAddLocation={filteredPlaceData.can_add_location === "Y"} />
                );
              })}
            </div>

            <div className={styles.footercontainer}>
              <div className={styles.footerbutton}>
                <AccessibilityPlaceNewButton accessibilityPlaceData={filteredPlaceData} orderNumber={filteredEntrancePlaceBoxes.length + 1} />
              </div>
              <div className={styles.footerbutton}>
                <AccessibilityPlaceCtrlButtons placeId={filteredPlaceData.place_id} entrancePlaceBoxes={filteredEntrancePlaceBoxes} />
              </div>
            </div>
          </div>
        </main>
      )}
    </Layout>
  );
};

// Server-side rendering
export const getServerSideProps: GetServerSideProps = async ({ params, locales }) => {
  const lngDict = await i18nLoader(locales);

  let entranceData: BackendEntrance = {} as BackendEntrance;
  let servicepointData: BackendServicepoint = {} as BackendServicepoint;
  let accessibilityPlaceData: BackendPlace[] = [];
  let formId = -1;

  if (params !== undefined) {
    try {
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

      const accessibilityPlaceResp = await fetch(`${API_URL_BASE}${API_FETCH_BACKEND_PLACES}?place_id=${params.placeId}&format=json`, {
        headers: new Headers({ Authorization: getTokenHash() }),
      });

      accessibilityPlaceData = await (accessibilityPlaceResp.json() as Promise<BackendPlace[]>);

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
          // Return entrance data for the highest log id only, in case both published and draft data exists (form_submitted = 'Y' and 'D')
          const maxLogId =
            entranceDetail.sort((a: BackendEntrance, b: BackendEntrance) => {
              return (b.log_id ?? 0) - (a.log_id ?? 0);
            })[0].log_id ?? -1;

          entranceData = entranceDetail.find((a) => a.log_id === maxLogId) as BackendEntrance;

          // In some cases there is no published entrance, so form_submitted and log_id are null
          if (!entranceData) {
            entranceData = entranceDetail[0];
          }
        }
      }
    } catch (err) {
      console.error("Error", err);

      servicepointData = {} as BackendServicepoint;
      entranceData = {} as BackendEntrance;
      accessibilityPlaceData = [];
    }
  }

  return {
    props: {
      lngDict,
      servicepointData,
      entranceData,
      accessibilityPlaceData,
      formId,
    },
  };
};

export default AccessibilityPlace;