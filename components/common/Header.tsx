import React, { KeyboardEvent, ReactElement } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useI18n } from "next-localization";
import { Header as HdsHeader,
    IconSearch,
    IconUser,
    IconSignin,
    IconSignout,
    LoginProvider,
    Button,
    LoginButton,
    Logo,
    logoFi,
    logoSv,
    logoSvDark,
    WithoutAuthenticatedUser,
    WithAuthenticatedUser,
 } from "hds-react";
import { useAppSelector, useAppDispatch } from "../../state/hooks";
import { setChecksum, setUser } from "../../state/reducers/generalSlice";
import { defaultLocale } from "../../utils/i18n";
import styles from "./Header.module.scss";
import { useSelector } from "react-redux";
import { RootState } from "../../state/store";

interface HeaderProps {
  isSummary?: boolean;
  children?: React.ReactNode;
  homePagePath?: string;
}

// NOTE: The HDS Navigation component does not currently work for mobile views when server-side rendering
// A workaround for this is to only use the Navigation component on the client-side
const DynamicHeader = dynamic(() => import("hds-react").then((hds) => hds.Header), { ssr: false });

const Header = ({ isSummary, children, homePagePath }: HeaderProps): ReactElement => {
  const i18n = useI18n();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.generalSlice.user);

  //const currentUser = useSelector((state: RootState) => state.general.user);

  const logoSrcFromLanguage = () => {
    if (router.locale == "sv") {
      return logoSv;
    } else {
      return logoFi;
    }
  };

  const changeLanguage = (locale: string) => {
    // Use the shallow option to avoid a server-side render in order to preserve the state
    router.push(router.pathname, router.asPath, { locale, shallow: true });
  };

  const signOut = async () => {
    // Nothing to do
    window.open("https://api.hel.fi/sso/openid/end-session/", "_self");
    dispatch(setUser(""));
    dispatch(setChecksum(""));
  };

  const handleKeyPress = (evt: KeyboardEvent<HTMLAnchorElement>, id: string) => {
    if (evt.code === "Enter") {
      document.getElementById(id)?.click();
    }
  };

  //const initials = currentUser ? currentUser?.first_name.charAt(0) + currentUser?.last_name.charAt(0) : "";

  return (
    <>
      <DynamicHeader
        // @ts-ignore: The HDS Navigation component comes from a dynamic import, see above for details
        title={i18n.t("common.header.title")}
        // titleUrl={`${router.basePath}${router.asPath}`}
        theme={{
          
        }}
        className={styles.header}
      >
        {children}
        <HdsHeader.ActionBar
          logo={<Logo src={logoSrcFromLanguage()} alt={i18n.t("common.header.title")} />}
          logoHref={`${router.basePath}${homePagePath}/`}
          title={i18n.t("common.header.title")}
          titleAriaLabel={i18n.t("common.header.titleAlt")}
          titleHref={`${router.basePath}${homePagePath}/`}
          aria-label={i18n.t("common.header.openMenu")}
          frontPageLabel=""

        >
          {/*
          <div className={styles.choices} role="region">
            <Navigation.Row>
              <Navigation.Item
                role="button"
                as="a"
                label={i18n.t("common.header.homepage")}
                href={`${router.basePath}/${router.locale}`}
                active={router.pathname === `/`}
              />
              <Navigation.Item
                role="button"
                as="a"
                label={i18n.t("common.header.servicepoints")}
                href={`${router.basePath}/${router.locale}/servicepoints`}
                active={router.pathname.includes("servicepoint") || router.pathname.includes("accessibilityEdit")}
              />
              <Navigation.Item
                role="button"
                as="a"
                label={i18n.t("common.header.information")}
                href={`${router.basePath}/${router.locale}/about`}
                active={router.pathname === `/about`}
              />
            </Navigation.Row>
          </div>
          */}

          {!isSummary && (
            <><HdsHeader.ActionBarItem
              id="user"
              fixedRightPosition
              aria-label={user}
              icon={<IconUser />}
              label={user}
              className="user"
            >
              <HdsHeader.ActionBarSubItem href="#" iconRight={<IconSignout aria-hidden />} label={i18n.t("common.header.logout")} onClick={signOut} />
            </HdsHeader.ActionBarItem>
            </>)
              /*
              <Navigation.User label={i18n.t("common.header.login")} authenticated userName={user}>
                <Navigation.Item
                  as="a"
                  href="#"
                  variant="supplementary"
                  icon={<IconSignout aria-hidden />}
                  label={i18n.t("common.header.logout")}
                  onClick={signOut}
                />
              </Navigation.User>*/
              }

          <HdsHeader.LanguageSelector label={(router.locale || defaultLocale).toUpperCase()}>
            <HdsHeader.ActionBarSubItem 
              role="button"
              id="fi"
              lang="fi"
              label="Suomeksi"
              tabIndex={0}
              onKeyPress={(e: KeyboardEvent<HTMLAnchorElement>) => handleKeyPress(e, "fi")}
              onClick={() => changeLanguage("fi")}
            />
            <HdsHeader.ActionBarSubItem 
              role="button"
              id="sv"
              lang="sv"
              label="På svenska"
              tabIndex={0}
              onKeyPress={(e: KeyboardEvent<HTMLAnchorElement>) => handleKeyPress(e, "sv")}
              onClick={() => changeLanguage("sv")}
            />
            <HdsHeader.ActionBarSubItem 
              role="button"
              id="en"
              lang="en"
              label="In English"
              tabIndex={0}
              onKeyPress={(e: KeyboardEvent<HTMLAnchorElement>) => handleKeyPress(e, "en")}
              onClick={() => changeLanguage("en")}
            />
          </HdsHeader.LanguageSelector>*/
        </HdsHeader.ActionBar>
      </DynamicHeader>
    </>
  );
};

Header.defaultProps = {
  children: [],
};

export default Header;
