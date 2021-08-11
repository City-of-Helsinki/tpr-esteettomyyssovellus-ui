import { Dictionary } from "@reduxjs/toolkit";
import { useI18n } from "next-localization";
import proj4 from "proj4";
import publicIp from "public-ip";
import {
  API_FETCH_QUESTION_ANSWER_COMMENTS,
  API_FETCH_QUESTION_ANSWER_LOCATIONS,
  API_FETCH_QUESTION_ANSWER_PHOTOS,
  API_FETCH_QUESTION_ANSWER_PHOTO_TEXTS
} from "../types/constants";
import { AdditionalInfos } from "../types/general";

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

// Helper function
export const isLocationValid = (coordinates: [number, number]): boolean =>
  coordinates &&
  coordinates.length === 2 &&
  coordinates[0] > 0 &&
  coordinates[1] > 0;

// define CRS's here, can be made as a list, need to add named crs here to be able to use it's name in conversion
proj4.defs(
  "EPSG:3067",
  "+title=EPSG:3067 +proj=utm +zone=35 +ellps=GRS80 +datum=ETRS89 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
);

// convert coordinates from proj to another proj
// returns coordinates in [x, y] / [lon, lat] / [pituus, leveys]
// notice for be able to convert another crs than epsg3067 - WGS84 need to add them to defs above
export const convertCoordinates = (
  fromProjection: string,
  toProjection: string,
  coordinates: [number, number]
): [number, number] => {
  if (!isLocationValid(coordinates)) return [0, 0];
  return proj4(fromProjection, toProjection, coordinates);
};

export const postData = async (url: string, data: {}) => {
  let postAnswerOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  };
  return fetch(url, postAnswerOptions)
    .then((response) => response.json())
    .then((data) => data);
};

export const getClientIp = async () =>
  await publicIp.v4({
    fallbackUrls: ["https://ifconfig.co/ip"]
  });

export const postAdditionalInfo = async (
  logId: number,
  data: ((string | AdditionalInfos)[] | undefined)[]
) => {
  console.log("Started posting additional info");
  data.map((question: any) => {
    if (question != undefined) {
      const comments =
        question[1]["comments"] != undefined ? question[1]["comments"] : null;
      const pictures =
        question[1]["pictures"] != undefined ? question[1]["pictures"] : null;
      const location =
        question[1]["locations"] != undefined ? question[1]["locations"] : null;
      // COMMENTS
      if (comments != null) {
        Object.keys(comments).map((key) => {
          const url = API_FETCH_QUESTION_ANSWER_COMMENTS;
          let comment = comments[key];
          let language = 0;
          switch (key) {
            case "fi":
              language = 1;
              break;
            case "sv":
              language = 2;
              break;
            case "en":
              language = 3;
              break;
          }
          const commentData = {
            comment: comment,
            log: logId,
            question: question[0],
            language: language
          };
          postData(url, commentData);
          console.log(
            "Posted additionalinfo comments for question ",
            question[0]
          );
        });
      }
      // LOCATION
      if (location != null) {
        const locationData = {
          loc_easting: location["locEasting"],
          loc_northing: location["locNorthing"],
          log: logId,
          question: question[0]
        };
        postData(API_FETCH_QUESTION_ANSWER_LOCATIONS, locationData);
        console.log(
          "Posted additionalinfo location for question ",
          question[0]
        );
      }
      // PICTURES
      if (pictures != null) {
        pictures.map(async (pic: any) => {
          const pictureData = {
            photo_url: pic["url"],
            log: logId,
            question: pic["qNumber"]
          };
          const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(pictureData)
          };
          let responseData = null;
          await fetch(API_FETCH_QUESTION_ANSWER_PHOTOS, requestOptions)
            .then((response) => response.json())
            .then((data) => {
              responseData = data;
              // console.log(responseData);
            });
          console.log(
            "Posted additionalinfo pictures for question ",
            question[0]
          );
          const photoId =
            responseData != null ? responseData["answer_photo_id"] : null;

          const fiComment = pic["fi"];
          const svComment = pic["sv"];
          const enComment = pic["en"];
          if (photoId != null) {
            if (fiComment != "") {
              const pictureTextData = {
                photo_text: fiComment,
                answer_photo: photoId,
                language: 1
              };
              postData(API_FETCH_QUESTION_ANSWER_PHOTO_TEXTS, pictureTextData);
              // console.log("Posted additionalinfo picture text in fi for question ", question[0]);
            }
            if (svComment != "") {
              const pictureTextData = {
                photo_text: svComment,
                answer_photo: photoId,
                language: 2
              };
              postData(API_FETCH_QUESTION_ANSWER_PHOTO_TEXTS, pictureTextData);
              // console.log("Posted additionalinfo picture text in sv ");
            }
            if (enComment != "") {
              const pictureTextData = {
                photo_text: enComment,
                answer_photo: photoId,
                language: 3
              };
              postData(API_FETCH_QUESTION_ANSWER_PHOTO_TEXTS, pictureTextData);
              // console.log("Posted additionalinfo picture text in en");
            }
            console.log(
              "Posted additionalinfo picture texts for question ",
              question[0]
            );
          }
        });
      }
    }
  });
};

export const validateChecksum = (
  string: string,
  checksum: string | string[]
) => {
  var crypto = require("crypto");
  const hash = crypto
    .createHash("sha256")
    .update(string)
    .digest("hex")
    .toUpperCase();
  return hash == checksum;
};
