// Notes: this component was doned for the new servicepoint list/landing page, might be obsolete

import React from "react";

import { makeStyles, Typography, Container, Hidden, Card, CardMedia, CardContent, withStyles } from "@material-ui/core";
import dynamic from "next/dynamic";

const FiCard = withStyles({
  root: {
    position: "relative",
  },
})(Card);

const FiCardMedia = withStyles({
  root: {
    position: "absolute",
    top: 0,
    right: 0,
    height: 550,
    width: "100%",
  },
})(CardMedia);

const FiCardContent = withStyles({
  root: {
    position: "relative",
    backgroundColor: "transparent",
  },
})(CardContent);

// @ts-ignore: A dynamic import must be used to force client-side rendering regardless of the typescript errors
const DynamicKoros = dynamic(() => import("hds-react").then((hds) => hds.Koros), { ssr: false });
// import { drupalUrl } from "../config";

const drupalUrl = process.env.REACT_APP_DRUPAL_URL;

// TODO: Move styles to Hero.module.scss
const useStyles = makeStyles((theme) => ({
  container: {
    padding: 0,
    height: 550,
    marginBottom: 32,
  },
  card: {
    backgroundColor: "#0000bf",
  },
  media: {
    height: 550,
  },
  fiCardContent: {
    height: 510,
    color: "white",
    width: "30%",
    [theme.breakpoints.only("xs")]: {
      top: 40,
      left: 50,
      padding: 30,
    },
    [theme.breakpoints.only("sm")]: {
      top: 40,
      left: 50,
      padding: 30,
    },
    [theme.breakpoints.only("md")]: {
      top: 40,
      left: 40,
    },
    [theme.breakpoints.only("lg")]: {
      top: 70,
      left: 50,
    },
    [theme.breakpoints.only("xl")]: {
      top: 100,
      left: 120,
    },
  },
  title: {
    [theme.breakpoints.only("xs")]: {
      fontSize: 36,
      paddingLeft: 20,
      paddingTop: 20,
    },
    [theme.breakpoints.only("sm")]: {
      fontSize: 36,
      paddingLeft: 20,
      paddingTop: 20,
    },
    [theme.breakpoints.only("md")]: {
      fontSize: 45,
    },
    [theme.breakpoints.only("lg")]: {
      fontSize: 52,
    },
    [theme.breakpoints.only("xl")]: {
      fontSize: 52,
    },
  },
  fiCardContentTextSecondary: {
    color: "white",
    fontSize: 20,
    left: 120,
    lineHeight: "30px",
    fontWeigth: 400,
    [theme.breakpoints.only("xs")]: {
      paddingLeft: 20,
      paddingTop: 20,
    },
  },
  mediaPic: {
    clipPath: "url(#koros)",
    "-webkitClipPath": "url(#koros)",
  },
  koro: {
    fill: "#0000bf",
    color: "#0000bf",
    background: "transparent",
    marginTop: -40,
  },
  smallCard: {
    padding: 0,
    marginTop: -30,
  },
  mobileContainer: {
    backgroundColor: "#0000bf",
    padding: 0,
    marginBottom: 28,
  },
  mobileCard: {
    padding: 0,
    margin: 0,
  },
  mobileTitle: {
    backgroundColor: "#0000bf",
    color: "white",
    marginBottom: 0,
    fontSize: 36,
    paddingLeft: 20,
    paddingTop: 40,
  },
  mobileText: {
    backgroundColor: "#0000bf",
    color: "white",
    fontSize: 20,
    fontWeigth: 400,
    paddingLeft: 20,
    paddingRight: 20,
  },
  shallowContainer: {
    height: 358,
    marginBottom: 32,
    marginTop: 32,
    maxWidth: 1440,
    padding: 0,
  },
  shallowKoro: {
    fill: "#0000bf",
    color: "#0000bf",
    marginTop: -40,
  },
}));

interface HeroProps {
  title: string;
  text: string;
  imageUrl: string;
}

export function Hero(props: HeroProps) {
  const classes = useStyles();
  const { title, text, imageUrl } = props;

  const imagePath = imageUrl && (imageUrl.startsWith("https") || imageUrl.startsWith("http")) ? imageUrl : drupalUrl + imageUrl;

  return (
    <>
      <Hidden smDown>
        <Container maxWidth="xl" className={classes.container}>
          <FiCard className={classes.card}>
            <div>
              <FiCardMedia className={classes.mediaPic} image={imagePath} title={title} />
              <FiCardContent className={classes.fiCardContent}>
                <Typography gutterBottom variant="h2" component="h1" className={classes.title}>
                  {title}
                </Typography>
                <Typography component="div" dangerouslySetInnerHTML={{ __html: text }} className={classes.fiCardContentTextSecondary} />
              </FiCardContent>
            </div>
          </FiCard>
          <svg id="clip" width="0" height="0" version="1.1">
            <defs>
              <polygon id="poly" points="0.39,1 0.69,0 1,0 1,1" />
              <path
                fill="#9FC9EB"
                id="arch"
                transform="scale( .00084 .002)"
                d="M953,520.000443 L0,520.000443 L0,520.000443 L2.15245491,515.412731 L2.15245491,515.412731 C5.6267527,508.865909 10.6009035,501.901614 18.327954,494.171617 C33.6299816,478.863754 45.9292894,474.327855 57.9128568,470.884628 L60.3061565,470.207684 L60.3061565,470.207684 L64.289253,469.097457 L64.289253,469.097457 L65.8846121,468.6448 C77.8605406,465.209215 90.1178352,460.715346 105.343475,445.4839 C120.230767,430.59093 124.855127,418.538119 128.259557,406.814501 L128.717085,405.217631 L128.717085,405.217631 L130.272907,399.640293 C130.347537,399.37452 130.422492,399.108652 130.497879,398.84266 L130.956225,397.24497 C134.367859,385.514145 139.025836,373.427704 153.97316,358.47468 C168.920484,343.521656 181.003509,338.86071 192.734034,335.443601 L194.331702,334.984492 L194.331702,334.984492 L195.926416,334.535703 L195.926416,334.535703 L199.909563,333.425426 L199.909563,333.425426 L201.505082,332.97261 L201.505082,332.97261 L203.104015,332.507171 C214.578656,329.114113 226.425411,324.355787 240.988681,309.786963 C256.229313,294.540519 260.728468,282.271548 264.163033,270.290763 L264.615516,268.694797 L264.615516,268.694797 L265.724973,264.710528 L265.724973,264.710528 L266.173436,263.11536 C269.644703,250.876209 274.02589,238.376166 289.653452,222.742645 C304.601554,207.788841 316.685016,203.127459 328.416008,199.709883 L330.01374,199.25071 L330.01374,199.25071 L331.608518,198.801856 L331.608518,198.801856 L335.59183,197.691415 C335.857555,197.616702 336.123364,197.541677 336.389285,197.466231 L337.986403,197.007672 C349.711996,193.595498 361.770257,188.959326 376.673359,174.05054 C391.57646,159.141755 396.370912,146.918787 399.890244,135.080224 L400.363079,133.46804 L400.363079,133.46804 L400.825084,131.859326 L400.825084,131.859326 L401.965382,127.844204 L401.965382,127.844204 L402.428682,126.237417 L402.428682,126.237417 L402.90355,124.628263 C406.360125,113.08441 411.091504,101.25828 425.342515,87.0018346 C439.262107,73.0769341 450.830249,68.2923862 462.09065,64.8929034 L463.697406,64.4158478 C463.964924,64.3376297 464.232322,64.2599875 464.499628,64.1828165 L466.102586,63.7246066 L466.102586,63.7246066 L470.109042,62.5955799 L470.109042,62.5955799 L471.714725,62.1373792 C483.769779,58.6647701 496.141872,54.2385152 511.34468,39.3199499 L512.435928,38.2340377 L512.435928,38.2340377 L512.996297,37.6392968 L512.996297,37.6392968 L513.74192,36.8194762 L513.74192,36.8194762 L514.551182,35.9013599 L514.551182,35.9013599 L515.308609,35.0181543 L515.308609,35.0181543 L515.9348,34.271363 L515.9348,34.271363 L516.377775,33.7341614 L516.377775,33.7341614 L517.077622,32.8704727 L517.077622,32.8704727 L517.566095,32.2567454 L517.566095,32.2567454 L518.070749,31.6131951 L518.070749,31.6131951 L518.59043,30.9402718 L518.59043,30.9402718 L519.123985,30.2384252 L519.123985,30.2384252 L519.67026,29.5081054 L519.67026,29.5081054 L520.228102,28.7497622 L520.228102,28.7497622 L520.796356,27.9638456 C520.891869,27.8305867 520.987767,27.6961976 521.084028,27.5606878 L521.665738,26.7342545 C521.763349,26.594299 521.861274,26.4532415 521.959489,26.3110914 L522.55206,25.4451537 L522.55206,25.4451537 L523.15043,24.5534421 C523.250577,24.4027006 523.350918,24.2509041 523.451429,24.0980617 L524.056333,23.1685328 L524.056333,23.1685328 L524.664152,22.2143548 C524.765634,22.053296 524.867189,21.8912289 524.968794,21.7281629 L525.578821,20.7378548 L525.578821,20.7378548 L526.188879,19.7240222 C527.611486,17.3313177 529.02492,14.7501714 530.363234,12.0063026 L530.932005,10.8204711 C532.529405,7.43281301 534.002149,3.81063965 535.232162,4.72937245e-11 L953,4.72937245e-11 L953,4.72937245e-11 L953,520.000443 Z"
              />
            </defs>
            <defs>
              <clipPath id="koros" clipPathUnits="objectBoundingBox">
                <use href="#arch" transform="translate(.2)" />
              </clipPath>
            </defs>
          </svg>
        </Container>
      </Hidden>
      <Hidden mdUp>
        <Container maxWidth="lg" className={classes.mobileContainer}>
          <Typography gutterBottom variant="h2" component="h1" className={classes.mobileTitle}>
            {title}
          </Typography>
          <Typography className={classes.mobileText} component="div" dangerouslySetInnerHTML={{ __html: text }} />
          <Card elevation={0} className={classes.mobileCard}>
            <div>
              <DynamicKoros
                // @ts-ignore: The HDS Koros component comes from a dynamic import, see above for details
                type="basic"
                flipHorizontal
                className={classes.koro}
              />
              <CardMedia className={classes.smallCard} component="img" alt="picture" height="440" image={imagePath} title={title} />
            </div>
          </Card>
        </Container>
      </Hidden>
    </>
  );
}

interface HeroShallowProps {
  title: string;
  imageUrl: string;
}

export function HeroShallow(props: HeroShallowProps) {
  const classes = useStyles();
  const { title, imageUrl } = props;

  const imagePath = imageUrl && (imageUrl.startsWith("https") || imageUrl.startsWith("http")) ? imageUrl : drupalUrl + imageUrl;

  return (
    <Container className={classes.shallowContainer}>
      <img alt={title} src={imagePath} />
      <DynamicKoros
        // @ts-ignore: The HDS Koros component comes from a dynamic import, see above for details
        type="basic"
        className={classes.shallowKoro}
      />
    </Container>
  );
}
