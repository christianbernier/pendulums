import React from "react";
import { css, Global } from "@emotion/core";
import { Helmet } from "react-helmet-async";

import Favicon from "../../favicon.png";
import ShareImage from "../../shareimage.png";

export default () => {
  return (
    <>
      <Helmet>
        <title>Double Pendulum</title>
        <link rel="shortcut icon" href={Favicon} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Double Pendulum" />
        <meta property="og:title" content="Double Pendulum" />
        <meta
          property="og:description"
          content="Learn about double pendulums with this visualization tool!"
        />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="og:image" content={ShareImage}/>
        <meta
          property="description"
          content="Learn about double pendulums with this visualization tool!"
        />
      </Helmet>
      <Global
        styles={css`
          @import url("https://rsms.me/inter/inter.css");

          :root {
            --dark-background: #2d3748;
            --font-white: #f7fafc;
            font-family: "Inter", Arial, Helvetica, sans-serif;
          }

          body {
            padding: 0;
            margin: 0;
            background-color: rgb(43, 43, 43);
          }

          p {
            color: var(--font-white);
            line-height: 140%;
          }

          a {
            color: var(--font-white);
          }

          input {
            border: none;
            padding: 5px;
            font-size: 1.1rem;
            margin-top: 3px;
            border-radius: 5px;
            background-color: rgb(60, 60, 60);
            color: var(--font-white);
            width: 25%;
          }

          input:focus{
            outline-width: 0;
          }
        `}
      />
    </>
  );
};
