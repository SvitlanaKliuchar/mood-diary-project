// src/components/settings/modals/Gallery.jsx
import { useContext, useEffect, useState } from 'react';
import styles from '../SettingsList.module.css';
import axiosInstance from '../../../utils/axiosInstance.js';
import { AuthContext } from '../../../contexts/AuthContext.jsx';
import { format, subDays } from 'date-fns';

const Gallery = ({ onClose }) => {
  const { user } = useContext(AuthContext);

  const [pieces, setPieces]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr]         = useState(null);

  // fetch last week of art on mount
  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const since = subDays(new Date(), 7).toISOString();
        const { data } = await axiosInstance.get(
          `/gen-art`,
          { params: { sinceISO: since, pageSize: 50 } }
        );
        if (!cancel) setPieces(data);
      } catch (e) {
        if (!cancel) setErr('failed to load art');
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => (cancel = true);
  }, [user.id]);

  return (
    <div className={styles['settings-list']}>
      <button onClick={onClose} className={styles['back-btn']} aria-label="back">←</button>

      <div className={styles['gallery-container']}>
        <p className={styles['main-text']}>Your Gallery</p>

        {loading && <p>loading…</p>}
        {err && <p className={styles.error}>{err}</p>}

        {!loading && pieces.length === 0 && <p>no art this week yet</p>}

        <ul className={styles['gallery-grid']}>
          {pieces.map(p => (
            <li key={p.id} className={styles['gallery-item']}>
              <div className={styles['thumb-wrapper']}>
                {/* static thumb */}
                <img
                  src={p.thumbnailUrl}
                  alt={p.title}
                  loading="lazy"
                  className={styles['thumb-img']}
                />
                {/* gif on hover */}
                <img
                  src={p.gifUrl}
                  alt={p.title}
                  loading="lazy"
                  className={styles['gif-img']}
                />
              </div>
              <span className={styles['thumb-caption']}>
                {p.title || format(new Date(p.createdAt), 'eee, MMM d')}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Gallery;