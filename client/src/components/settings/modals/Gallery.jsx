import { useContext, useEffect, useRef, useState } from "react";
import styles from "../SettingsList.module.css";
import axiosInstance from "../../../utils/axiosInstance.js";
import { AuthContext } from "../../../contexts/AuthContext.jsx";
import { format, subDays } from "date-fns";

const pageSize = 4;
const ANIM_MS = 200;

const Gallery = ({ onClose }) => {
  const { user } = useContext(AuthContext);

  const [pieces, setPieces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [isFading, setIsFading] = useState(false);

  // holds the current AbortController so we can cancel on unmount / re-render
  const abortRef = useRef(null);

  // pagination helpers
  const changePage = (dir) => {
    if (
      (dir === "prev" && currentPage === 1) ||
      (dir === "next" && !hasMorePages)
    )
      return;

    /* fade-out, then flip page index; the effect below will load + fade-in */
    setIsFading(true);
    setTimeout(() => {
      setCurrentPage((p) => p + (dir === "next" ? 1 : -1));
    }, ANIM_MS);
  };

  // fetch pieces when user or page changes
  useEffect(() => {
    if (!user) return; // guard for first render

    // cancel any previous in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setErr(null);

    (async () => {
      try {
        const since = subDays(new Date(), 7).toISOString();
        const { data } = await axiosInstance.get("/gen-art", {
          params: { sinceISO: since, page: currentPage, pageSize },
          signal: controller.signal,
        });

        setPieces(data);
        setHasMorePages(data.length === pageSize);
      } catch (e) {
        if (e.name !== "CanceledError") setErr("failed to load art");
      } finally {
        // fade-in starts as soon as loading flag drops
        setLoading(false);
        setIsFading(false);
      }
    })();

    return () => controller.abort();
  }, [user?.id, currentPage]);

  return (
    <div className={styles["settings-list"]}>
      <button
        onClick={onClose}
        className={styles["back-btn"]}
        aria-label="back"
      >
        ←
      </button>

      <div className={styles["gallery-container"]}>
        <p className={styles["main-text"]}>Your Gallery</p>

        {loading && <p>loading…</p>}
        {err && <p className={styles.error}>{err}</p>}
        {!loading && pieces.length === 0 && <p>No art yet</p>}

        <ul
          className={`${styles["gallery-grid"]} ${
            isFading ? styles.fadingOut : ""
          }`}
        >
          {pieces.map((p) => (
            <li key={p.id} className={styles["gallery-item"]}>
              <div className={styles["thumb-wrapper"]}>
                <img
                  src={p.thumbnailUrl}
                  alt={p.title}
                  loading="lazy"
                  className={styles["thumb-img"]}
                />
                <img
                  src={p.gifUrl}
                  alt={p.title}
                  loading="lazy"
                  className={styles["gif-img"]}
                />
              </div>
              <span className={styles["thumb-caption"]}>
                {p.title || format(new Date(p.createdAt), "eee, MMM d")}
              </span>
            </li>
          ))}
        </ul>

        {!loading && pieces.length > 0 && (
          <div className={styles["pagination-controls"]}>
            <button
              onClick={() => changePage("prev")}
              disabled={currentPage === 1}
              className={styles["pagination-button"]}
              aria-label="previous page"
            >
              ←
            </button>

            <span className={styles["page-indicator"]}>
              page&nbsp;{currentPage}
            </span>

            <button
              onClick={() => changePage("next")}
              disabled={!hasMorePages}
              className={styles["pagination-button"]}
              aria-label="next page"
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;
