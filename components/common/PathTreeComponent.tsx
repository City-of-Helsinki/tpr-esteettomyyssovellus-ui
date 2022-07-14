import React from "react";
import Link from "next/link";
import { Link as HdsLink } from "hds-react";
import { PathTreeProps } from "../../types/general";
import { useAppSelector } from "../../state/hooks";
import styles from "./PathTreeComponent.module.scss";

// usage: general breadcrumb component
const PathTreeComponent = ({ treeItems }: PathTreeProps): JSX.Element => {
  const curServicepointId = useAppSelector((state) => state.formReducer.currentServicepointId);

  const getPathTree = () => {
    return treeItems.map((elem, index) => {
      const key = `treeitem_${index}`;

      return treeItems.indexOf(elem) === treeItems.length - 1 ? (
        <div key={key}>{`${index > 0 ? " > " : ""}${elem}`}</div>
      ) : (
        <div key={key}>
          <Link href={`/details/${curServicepointId}`}>
            <HdsLink href="#" size="M" disableVisitedStyles>
              {elem}
            </HdsLink>
          </Link>
        </div>
      );
    });
  };

  return <div className={styles.pathTree}>{getPathTree()}</div>;
};

export default PathTreeComponent;
