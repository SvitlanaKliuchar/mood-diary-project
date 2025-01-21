import React from "react";
import styles from "./LoadingSpinner.module.css";

const LoadingSpinner = () => {
  return (
    <div
      className={styles["spinner-container"]}
      role="status"
      aria-live="polite"
      aria-label="Loading content. Please wait."
    >
      <svg
        className={styles.spinner}
        xmlns="http://www.w3.org/2000/svg"
        width="200"
        height="200"
        fill="none"
        viewBox="0 0 200 200"
        version="1.1"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        xmlns:svgjs="http://svgjs.dev/svgjs"
      >
        <g clipPath="url(#clip0_118_208)">
          <path
            fill='url("#SvgjsLinearGradient1657")'
            d="M100 200c-2.895-94.738-5.262-97.09-100-100 94.738-2.895 97.09-5.262 100-100 2.895 94.738 5.262 97.09 100 100-94.738 2.91-97.09 5.233-100 100Z"
          ></path>
        </g>
        <defs>
          <linearGradient
            gradientTransform="rotate(0 0.5 0.5)"
            id="SvgjsLinearGradient1657"
          >
            <stop
              stopOpacity=" 1"
              stopColor="rgba(183, 201, 245)"
              offset="0"
            ></stop>
            <stop
              stopOpacity=" 1"
              stopColor="rgba(186, 183, 245)"
              offset="0.48"
            ></stop>
            <stop
              stopOpacity=" 1"
              stopColor="rgba(226, 183, 245)"
              offset="1"
            ></stop>
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default LoadingSpinner;
