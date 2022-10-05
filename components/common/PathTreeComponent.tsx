import React from "react";
import Link from "next/link";
import { useI18n } from "next-localization";
import { Link as HdsLink } from "hds-react";
import { PathTreeProps } from "../../types/general";
import styles from "./PathTreeComponent.module.scss";

// usage: general breadcrumb component
const PathTreeComponent = ({ treeItems }: PathTreeProps): JSX.Element => {
  const i18n = useI18n();

  const getPathTree = () => {
    return Object.keys(treeItems).map((itemText, index, array) => {
      const itemUrl = treeItems[itemText];
      const isLastItem = index + 1 === array.length;
      const key = `treeitem_${index}`;

      return (
        <li key={key} className={styles.pathTreeItem}>
          <Link href={itemUrl}>
            <HdsLink href="#" size="M" disableVisitedStyles aria-current={isLastItem ? "page" : undefined}>
              {itemText}
            </HdsLink>
          </Link>
        </li>
      );
    });
  };

  return (
    <nav aria-label={i18n.t("common.breadcrumb")} className={styles.pathTree}>
      <ul className={styles.pathTreeList}>{getPathTree()}</ul>
    </nav>
  );
};

export default PathTreeComponent;
