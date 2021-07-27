import { Dictionary } from "@reduxjs/toolkit";
import { useI18n } from "next-localization";

export const getCurrentDate = () => {
  let today = new Date();
  const date =
    today.getFullYear() +
    "-" +
    (today.getMonth() + 1) +
    "-" +
    today.getDate() +
    "T" +
    today.getHours() +
    ":" +
    today.getMinutes() +
    ":" +
    today.getSeconds() +
    "Z";
  return date;
};

export const getFinnishDate = (jsonTimeStamp: Date) => {
  const date = new Date(jsonTimeStamp);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();
  const finnish_date = day + "." + month + "." + year;
  return finnish_date;
};

export const filterByLanguage = (dict: Dictionary<any>) => {
  const i18n = useI18n();
  return dict.filter((entry: any) => {
    return entry.language_code == i18n.locale();
  });
};
