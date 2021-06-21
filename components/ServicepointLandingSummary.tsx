import React from "react";
import { IconAlertCircle } from "hds-react";
import { useI18n } from "next-localization";
import Button from "./QuestionButton";
import ServicepointLandingSummaryContent from "./ServicepointLandingSummaryContent";
import { ServicepointLandingSummaryProps } from "../types/general";
import styles from "./ServicepointLandingSummary.module.scss";
import router from "next/router";
import { current } from "@reduxjs/toolkit";
import { array } from "yup/lib/locale";

const ServicepointLandingSummary = ({ header, data }: ServicepointLandingSummaryProps): JSX.Element => {
  const i18n = useI18n();
  const handleEditorAddPointData = () => {
    if (data) {
      console.log("edit data clicked, todo create logic");
    } else {
      console.log("create servicepoint data clicked, todo create logic");
    }
  };

  // Add React components to these arrays.
  let contents: any = [];
  let mainEntrance: any = [];

  // If the data is of type servicePointData
  if (data && 'servicepoint_id' in data) {
    const keysToDisplay = ['accessibility_phone', 'accessibility_email']
    let itemList: any = [];
    keysToDisplay.map((key) => {
      let title = "";
      switch (key) {
        case 'accessibility_phone':
          title = "PH: puhelinnumero";
          break;
        case 'accessibility_email':
          title = "PH: sähköpostiosoite";
          break;
        default:
          console.log("Incorrect key")
      }
      itemList.push(<div className={styles.infocontainer}><h4>{title}</h4><p>{data[key] ? data[key] : "PH: (ei tietoa)"}</p></div>)
    })
    contents.push(<ServicepointLandingSummaryContent><div className={styles.contactInformation}>{itemList}</div></ServicepointLandingSummaryContent>)
  // Else if the data is of type accessibilityData
  } else if (data) {
    let keys = Object.keys(data);
    keys.map((key) => { 
      let itemList: any = [];
      let currentTitle = ""
      if (data[key]) {
        data[key].map((x:any) => {
          if (x.sentence_group_name != currentTitle) {
            currentTitle = x.sentence_group_name;
            // Add h3 titles in the container
            itemList.push(<h3 className={styles.sentenceGroupName}>{currentTitle}</h3>)
          }
          itemList.push(<li>{x.sentence}</li>);
        })
      }

      // Check if main entrance.
      if (key == "main") {
        mainEntrance.push(
          // TODO: Add to locales Pääsisäänkäynti jne.
          <ServicepointLandingSummaryContent contentHeader={"PH: Pääsisäänkäynti" }>
            <ul>
              {itemList}
            </ul>
          </ServicepointLandingSummaryContent>
        )
      } else {
        contents.push(
          // TODO: Add to locales Lisäsisäänkäynti jne.
          <ServicepointLandingSummaryContent contentHeader={"PH: Lisäsisäänkäynti"}>
            <ul>
              {itemList}
            </ul>
          </ServicepointLandingSummaryContent>
        )
      }
      }
    )
  }

  // Make sure that the main entrance is listed before the side entrances.
  contents = mainEntrance.concat(contents)


  const buttonText = data ? i18n.t("servicepoint.buttons.editServicepoint") : i18n.t("servicepoint.buttons.createServicepoint");
  return (
    <div className={styles.maincontainer}>
      <div className={styles.headercontainer}>
        <h2> {header} </h2>
        <Button variant="primary" onClickHandler={handleEditorAddPointData}>
          {buttonText}
        </Button>
      </div>
      <div>
        {data ? (
          <>
            {contents}
          </>
        ) : (
          <div className={styles.nodatacontainer}>
            <ServicepointLandingSummaryContent>
              <span>
                <IconAlertCircle />
                <p>{i18n.t("servicepoint.noDataContactinfo")}</p>
              </span>
            </ServicepointLandingSummaryContent>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicepointLandingSummary;
