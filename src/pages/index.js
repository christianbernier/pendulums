import React, { useState, useEffect } from "react";
import { css } from "@emotion/core";
import GlobalCSS from "../components/GlobalCSS";
import Gap from "../components/Gap.js";
import Konva from "react-konva";

Konva.pixelRatio = 1;

//Default values
let stageSize = 600;
let GRAVITY = 1;
let mass1 = 20;
let mass2 = 17;
let length1 = 100;
let length2 = 125;
let angle1 = 0.25;
let angle2 = -0.33;
let framesBetweenRerender = 50;

//Parameters
const paramNames = [
  "Gravity",
  "Top pendulum's mass",
  "Bottom pendulum's mass",
  "Top pendulum's length",
  "Bottom pendulum's length",
  "Top pendulum's starting angle (in multiples of pi)",
  "Bottom' pendulum's starting angle (in multiples of pi)",
  "Frames between rerenders",
];

const paramIDs = [
  "param-gravity",
  "param-m1",
  "param-m2",
  "param-l1",
  "param-l2",
  "param-a1",
  "param-a2",
  "param-rr",
];

const paramDefaults = ["1", "20", "17", "100", "125", "0.25", "-0.33", "50"];

const setParameters = () => {
  const valuesForParams = [];
  for (const id of paramIDs) {
    valuesForParams.push(document.getElementById(id).value);
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    if (valuesForParams[0] <= 0) {
      window.alert("Invalid parameter: Gravity. The gravity must be positive.");
      return;
    }

    if (valuesForParams[1] <= 0) {
      window.alert(
        "Invalid parameter: Pendulum 1 Mass. The mass of pendulum 1 must be positive."
      );
      return;
    }

    if (valuesForParams[2] <= 0) {
      window.alert(
        "Invalid parameter: Pendulum 2 Mass. The mass of pendulum 2 must be positive."
      );
      return;
    }

    if (valuesForParams[3] <= 0) {
      window.alert(
        "Invalid parameter: Pendulum 1 Length. The length of pendulum 1 must be positive."
      );
      return;
    }

    if (valuesForParams[4] <= 0) {
      window.alert(
        "Invalid parameter: Pendulum 2 Length. The length of pendulum 2 must be positive."
      );
      return;
    }

    if (valuesForParams[7] <= 0) {
      window.alert(
        "Invalid parameter: Rerender frames. There must be at least 1 frame between rerenders."
      );
      return;
    }

    window.location = `?g=${valuesForParams[0]}&m1=${valuesForParams[1]}&m2=${valuesForParams[2]}&l1=${valuesForParams[3]}&l2=${valuesForParams[4]}&a1=${valuesForParams[5]}&a2=${valuesForParams[6]}&rr=${valuesForParams[7]}`;
  }
};

const downloadURI = (uri, name) => {
  var link = document.createElement("a");
  link.download = name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const exportToImage = () => {
  const stage = document.getElementsByTagName("CANVAS")[0];
  const dataURL = stage.toDataURL({ pixelRatio: 5 });
  downloadURI(dataURL, "pendulums.png");
};

class Pendulum extends React.Component {
  constructor(l_, m_, i_, d_) {
    super();
    this.l = l_;
    this.m = m_;
    this.i = i_;
    this.d = d_;
    this.v = 0;
    this.a = 0;
  }

  updateDisplacement() {
    this.d += this.v;
  }

  updateVelocity() {
    this.v += this.a;
  }

  updateAcceleration(o) {
    if (this.i === 0) {
      //Pendulum 1
      let num1 = -GRAVITY * (2 * this.m + o.m) * Math.sin(this.d);
      let num2 = -o.m * GRAVITY * Math.sin(this.d - 2 * o.d);
      let num3 = -2 * Math.sin(this.d - o.d) * o.m;
      let num4 =
        o.v * o.v * o.l + this.v * this.v * this.l * Math.cos(this.d - o.d);
      let den =
        this.l * (2 * this.m + o.m - o.m * Math.cos(2 * this.d - 2 * o.d));
      this.a = (num1 + num2 + num3 * num4) / den;
      return;
    }
    //Pendulum 2

    let num1 = 2 * Math.sin(o.d - this.d);
    let num2 = o.v * o.v * o.l * (o.m + this.m);
    let num3 = GRAVITY * (o.m + this.m) * Math.cos(o.d);
    let num4 = this.v * this.v * this.l * this.m * Math.cos(o.d - this.d);
    let den =
      this.l * (2 * o.m + this.m - this.m * Math.cos(2 * o.d - 2 * this.d));
    this.a = (num1 * (num2 + num3 + num4)) / den;
  }
}

export default () => {
  const [pendulums, setPendulums] = useState([]);

  //Frame counter and state variable for forced rerender
  let renderCycle = 0;
  const [rerender, setRerender] = useState(0);

  useEffect(() => {}, []);

  useEffect(() => {
    if (pendulums.length !== 2) {
      return;
    }

    setInterval(() => {
      pendulums[0].updateAcceleration(pendulums[1]);
      pendulums[1].updateAcceleration(pendulums[0]);
      pendulums[0].updateVelocity();
      pendulums[1].updateVelocity();
      pendulums[0].updateDisplacement();
      pendulums[1].updateDisplacement();

      setRerender(renderCycle++); //Forces a rerender
    }, framesBetweenRerender);
  }, [pendulums]);

  useEffect(() => {
    //This function is run once when the page loads
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      if (window.innerWidth < 500) {
        //Sets the size of the stage for mobile or desktop screens
        stageSize = window.innerWidth * 0.9;
      } else {
        stageSize = window.innerHeight * 0.8;
      }

      //Extracting parameters from the URL, if applicable
      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);
      const param0 = urlParams.get("circles");

      if (param0) {
        GRAVITY = urlParams.get("g") - 0;
        mass1 = urlParams.get("m1") - 0;
        mass2 = urlParams.get("m2") - 0;
        length1 = urlParams.get("l1") - 0;
        length2 = urlParams.get("l2") - 0;
        angle1 = urlParams.get("a1") - 0;
        angle2 = urlParams.get("a2") - 0;
        framesBetweenRerender = urlParams.get("rr") - 0;
      }

      let pendulumPrep = [];
      let p0 = new Pendulum(length1, mass1, 0, Math.PI * angle1);
      let p1 = new Pendulum(length2, mass2, 1, Math.PI * angle2);
      pendulumPrep.push(p0);
      pendulumPrep.push(p1);
      setPendulums(pendulumPrep);
    }
  }, []);

  return (
    <>
      <GlobalCSS />
      <div
        css={css`
          display: grid;
          width: 100vw;
          height: 100vh;
          overflow-x: hidden;
          grid-template-areas:
            "title stage"
            "infoLeft stage";
          grid-template-rows: 100px auto;
          grid-template-columns: 30vw 70vw;

          @media only screen and (max-width: 500px) {
            grid-template-areas: "title" "stage" "infoLeft" "gap";
            grid-template-rows: auto auto auto 50px;
            grid-template-columns: 100vw;
          }
        `}
      >
        <p
          css={css`
            font-size: 2.2rem;
            font-weight: 700;
            margin-top: 0;
            grid-area: title;
            padding: 50px 20px 0 20px;

            @media only screen and (max-width: 500px) {
              padding: 50px 20px;
            }
          `}
        >
          Double Pendulum
        </p>
        <div
          css={css`
            grid-area: infoLeft;
            padding: 50px 20px;
          `}
        >
          <p
            css={css`
              font-size: 1.1rem;
              font-weight: 300;
              margin-top: 0;
            `}
          >
            Double pendulums can demonstrate chaotic motion resulting from a
            relatively simple system. Try changing the parameters below to see
            what factors determine stability. In the visualization, the size of
            the bob represents its mass and the lengths are drawn to scale.
          </p>
          <Gap height="10px" />
          <p
            css={css`
              font-size: 1.4rem;
              font-weight: 600;
              margin-bottom: 10px;
            `}
          >
            Export Image
          </p>
          <p
            css={css`
              font-size: 1.1rem;
              font-weight: 300;
              margin-top: 0;
            `}
          >
            You can export a high-quality version of the render using the button
            below.
          </p>
          <p
            css={css`
              font-size: 1.2rem;
              font-weight: 700;
              margin-bottom: 0;
              padding: 5px;
              background-color: rgb(60, 60, 60);
              border-radius: 5px;
              width: 50%;
              text-align: center;
              cursor: pointer;
            `}
            onClick={() => exportToImage()}
          >
            Download image
          </p>
          <Gap height="10px" />
          <p
            css={css`
              font-size: 1.4rem;
              font-weight: 600;
              margin-bottom: 10px;
            `}
          >
            Parameters
          </p>
          <p
            css={css`
              font-size: 1.1rem;
              font-weight: 300;
              margin-top: 0;
            `}
          >
            Try changing the parameters below to see different results! If your
            computer is powerful, try decreasing frames between rerenders for a
            smoother animation.
          </p>
          {paramNames.map((param, i) => (
            <React.Fragment key={`param-div-${i}`}>
              <p
                css={css`
                  font-size: 1.1rem;
                  font-weight: 300;
                  font-style: italic;
                  margin-bottom: 0;
                `}
              >
                {param}:
              </p>
              <input
                type="number"
                defaultValue={paramDefaults[i]}
                id={paramIDs[i]}
              />
            </React.Fragment>
          ))}
          <p
            css={css`
              font-size: 1.2rem;
              font-weight: 700;
              margin-bottom: 0;
              padding: 5px;
              background-color: rgb(60, 60, 60);
              border-radius: 5px;
              width: 50%;
              text-align: center;
              cursor: pointer;
            `}
            onClick={() => setParameters()}
          >
            See the results!
          </p>

          <Gap height="10px" />
          <p
            css={css`
              font-size: 1.4rem;
              font-weight: 600;
              margin-bottom: 10px;
            `}
          >
            Site information
          </p>
          <p
            css={css`
              font-size: 1.1rem;
              font-weight: 300;
              margin-top: 0;
            `}
          >
            This site was made in April 2021 by Christian Bernier. Feel free to
            check out the{" "}
            <a href="https://github.com/christianbernier/pendulums">
              source code
            </a>
            . If you have any questions or recommendations, free free to{" "}
            <a href="https://cbernier.com">contact me</a>.
          </p>
        </div>
        <Konva.Stage
          width={stageSize}
          height={stageSize}
          css={css`
            grid-area: stage;
            display: flex;
            justify-content: center;
            margin-top: 50px;

            @media only screen and (max-width: 500px) {
              margin-top: 0;
            }
          `}
        >
          <Konva.Layer listening={false}>
            <Konva.Rect
              x={0}
              y={0}
              width={stageSize}
              height={stageSize}
              fill={"rgba(64, 64, 64)"}
            />
            {pendulums.length === 2 ? (
              <>
                <Konva.Line
                  x={stageSize / 2}
                  y={stageSize / 2}
                  points={[
                    0,
                    0,
                    pendulums[0].l * Math.sin(pendulums[0].d),
                    pendulums[0].l * Math.cos(pendulums[0].d),
                  ]}
                  strokeWidth={5}
                  stroke={"rgb(66, 147, 221)"}
                />
                <Konva.Line
                  x={stageSize / 2 + pendulums[0].l * Math.sin(pendulums[0].d)}
                  y={stageSize / 2 + pendulums[0].l * Math.cos(pendulums[0].d)}
                  points={[
                    0,
                    0,
                    pendulums[1].l * Math.sin(pendulums[1].d),
                    pendulums[1].l * Math.cos(pendulums[1].d),
                  ]}
                  strokeWidth={5}
                  stroke={"rgb(136, 171, 204)"}
                />
                <Konva.Circle
                  x={stageSize / 2 + pendulums[0].l * Math.sin(pendulums[0].d)}
                  y={stageSize / 2 + pendulums[0].l * Math.cos(pendulums[0].d)}
                  radius={pendulums[0].m}
                  fill={"rgb(66, 147, 221)"}
                />
                <Konva.Circle
                  x={
                    stageSize / 2 +
                    pendulums[0].l * Math.sin(pendulums[0].d) +
                    pendulums[1].l * Math.sin(pendulums[1].d)
                  }
                  y={
                    stageSize / 2 +
                    pendulums[0].l * Math.cos(pendulums[0].d) +
                    pendulums[1].l * Math.cos(pendulums[1].d)
                  }
                  radius={pendulums[1].m}
                  fill={"rgb(136, 171, 204)"}
                />
                <Konva.Circle
                  x={stageSize / 2}
                  y={stageSize / 2}
                  radius={10}
                  fill={"rgb(43, 43, 43)"}
                />
              </>
            ) : (
              <></>
            )}
          </Konva.Layer>
        </Konva.Stage>
        <div
          css={css`
            grid-area: gap;
          `}
        />
      </div>
    </>
  );
};
