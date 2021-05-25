import React from "react";
import { IconSearch, IconAngleDown } from "hds-react";
import styles from "./SearchBoxWithButtons.module.scss";
import QuestionTextInput from "./QuestionTextInput";
import Button from "./QuestionButton";


const SearchBoxWithButtons = (): JSX.Element => {

        


    return (
        <>
            <div className={styles.container}>
    
                <div className={styles.search}>
                    <p className={styles.searchText}> Hae toimipistettä</p>
                    <div className={styles.input}>
                        <QuestionTextInput id="1" placeholder="Anna toimipisteen nimi tai joku muu hakusana" />
                        <div>
                            <a className={styles.helpText}> näytä hakuohje <IconAngleDown style={{marginLeft: "1px"}} /></a>
                        </div>
                    </div>
                    <div className={styles.button}>
                        <Button variant="primary" iconLeft={<IconSearch />}>
                            Hae
                        </Button>
                    </div>
                    <div className={styles.button}>
                        <Button variant="secondary">
                            Tyhjennä
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SearchBoxWithButtons;