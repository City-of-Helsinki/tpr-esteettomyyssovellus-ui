import React from "react";
import { useI18n } from "next-localization";
import { PathTreeProps } from "../types/general";
import styles from "./PathTreeComponent.module.scss";
import { useAppSelector } from "../state/hooks";

// usage: general breadcrumb component
const PathTreeComponent = ({ treeItems }: PathTreeProps): JSX.Element => {
  const i18n = useI18n();
  const { length } = treeItems;
  const curServicepointId = useAppSelector((state) => state.formReducer.currentServicepointId);
  const pathTree = treeItems.map((elem, index) => {
    const key = `treeitem_${index}`;
    const treeItem =
      treeItems.indexOf(elem) === length - 1 ? (
        <div key={key}>
          {" > "}
          {elem}
        </div>
      ) : (
        <div key={key}>
          {" > "}
          <a className={styles.link} href={`/details/${curServicepointId}`}>
            {elem}
          </a>
        </div>
      );

    return treeItem;
  });

  return (
    <>
      <a href="/" className={styles.link}>
        {i18n.t("common.search")}
      </a>
      {pathTree}
    </>
  );
};

export default PathTreeComponent;
