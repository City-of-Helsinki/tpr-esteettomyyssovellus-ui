import { Dictionary } from "@reduxjs/toolkit";
import { useI18n } from "next-localization";
import proj4 from "proj4";

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
