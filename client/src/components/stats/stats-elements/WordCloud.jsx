import { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import cloud from "d3-cloud";
import styles from "../MoodDashboard.module.css";

const WordCloud = ({ data }) => {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  //function to update dimensions based on container size
  const updateDimensions = () => {
    if (containerRef.current) {
      const { width } = containerRef.current.getBoundingClientRect();
      //set height proportionally (you can adjust the ratio)
      const height = Math.max(300, width * 0.6);
      setDimensions({ width, height });
    }
  };

  //initialize dimensions and set up resize listener
  useEffect(() => {
    updateDimensions();

    //add resize event listener
    window.addEventListener("resize", updateDimensions);

    //clean up
    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  //word cloud rendering effect
  useEffect(() => {
    //only proceed if we have dimensions and SVG ref
    if (dimensions.width === 0 || !svgRef.current) return;

    //clear any previous content
    d3.select(svgRef.current).selectAll("*").remove();

    //early return with a message if data is not available or properly structured
    if (!data || !Array.isArray(data) || data.length === 0) {
      //display a message in the SVG
      d3.select(svgRef.current)
        .attr("width", dimensions.width)
        .attr("height", dimensions.height)
        .append("text")
        .attr("x", dimensions.width / 2)
        .attr("y", dimensions.height / 2)
        .attr("text-anchor", "middle")
        .style("font-family", "Arial, sans-serif")
        .style("font-size", "16px")
        .text("No data available for word cloud");
      return;
    }

    try {
      //calculate font size scale based on word frequency and container size
      const maxFreq = d3.max(data, (d) => d.value) || 1;
      const minFreq = d3.min(data, (d) => d.value) || 1;

      //adjust the font size range based on container width
      const maxFontSize = Math.max(10, Math.min(60, dimensions.width / 10));
      const minFontSize = Math.max(8, maxFontSize / 3);

      const fontSizeScale = d3
        .scaleLinear()
        .domain([minFreq, maxFreq])
        .range([minFontSize, maxFontSize]);

      //color scale based on word frequency
      const colorScale = d3
        .scaleOrdinal([
          "#544FBF",
          "#FF00F2",
          "#D72638",
          "#E2B7F5",
          "#B7C9F5",
          "#BAB7F5",
          "#605CDB",
          "#FFA07A",
          "#FFD700",
          "#5E6366",
        ])
        .domain([minFreq - 0.5, maxFreq + 0.5]);

      //configure the layout
      const layout = cloud()
        .size([dimensions.width, dimensions.height])
        .words(data)
        .padding(5)
        .rotate(() => ~~(Math.random() * 2) * 90) //either 0 or 90 degrees rotation
        .fontSize((d) => fontSizeScale(d.value))
        .on("end", draw);

      //start layout calculation
      layout.start();

      //function to draw the words
      function draw(words) {
        d3.select(svgRef.current)
          .attr("width", dimensions.width)
          .attr("height", dimensions.height)
          .append("g")
          .attr(
            "transform",
            `translate(${dimensions.width / 2},${dimensions.height / 2})`,
          )
          .selectAll("text")
          .data(words)
          .enter()
          .append("text")
          .style("font-size", (d) => `${d.size}px`)
          .style("font-family", "Impact, sans-serif")
          .style("fill", (d) => colorScale(d.value))
          .attr("text-anchor", "middle")
          .attr(
            "transform",
            (d) => `translate(${d.x},${d.y}) rotate(${d.rotate})`,
          )
          .text((d) => d.text)
          .style("cursor", "pointer")
          .on("mouseover", function () {
            d3.select(this)
              .transition()
              .duration(200)
              .style("font-size", (d) => `${d.size * 1.2}px`)
              .style("fill", "orange");
          })
          .on("mouseout", function () {
            d3.select(this)
              .transition()
              .duration(200)
              .style("font-size", (d) => `${d.size}px`)
              .style("fill", (d) => colorScale(d.value));
          });
      }
    } catch (error) {
      console.error("Error generating word cloud:", error);

      //sisplay an error message in the SVG
      d3.select(svgRef.current)
        .attr("width", dimensions.width)
        .attr("height", dimensions.height)
        .append("text")
        .attr("x", dimensions.width / 2)
        .attr("y", dimensions.height / 2)
        .attr("text-anchor", "middle")
        .style("font-family", "Arial, sans-serif")
        .style("font-size", "16px")
        .text("Error generating word cloud");
    }
  }, [data, dimensions]); //re-render when data or dimensions change

  return (
    <div className={styles["word-count-container"]} ref={containerRef}>
      <div className={styles["word-cloud-svg-container"]}>
        <svg ref={svgRef} width="100%" height={dimensions.height}></svg>
      </div>
      <p className={styles["tips"]}>
        We have processed the notes from all your entries and generated this
        word cloud. Word size represents frequency. Hover over words to
        highlight them.
      </p>
    </div>
  );
};

export default WordCloud;
