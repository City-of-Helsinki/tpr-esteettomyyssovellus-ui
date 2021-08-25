import React from "react";
import { IconSearch, TextInput } from "hds-react";
import styles from "./SearchBoxWithButtonsMobile.module.scss";
import Button from "./QuestionButton";

// usage: not used / implemented atm, was designed to be used in the search page -> which will not be doned
// todo: delete this component if not used
const SearchBoxWithButtonsMobile = (): JSX.Element => {
  return (
    <>
      <div className={styles.container}>
        <p className={styles.searchText}> Hae toimipistettä</p>
        <div className={styles.input}>
          <TextInput
            id="search"
            placeholder="Anna toimipisteen nimi tai joku muu hakusana"
          />
        </div>
        <div className={styles.buttons}>
          <div className={styles.button}>
            <Button variant="primary" iconLeft={<IconSearch />}>
              Hae toimipistettä
            </Button>
          </div>
          <div id="empty" className={styles.button}>
            <Button variant="secondary">Tyhjennä haku</Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchBoxWithButtonsMobile;
