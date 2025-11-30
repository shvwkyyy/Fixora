import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { workerAPI } from '../../utils/api';
import { getDummyData } from '../../utils/dummyData';
import styles from './WorkerProfile.module.css';

const getInitials = (firstName, lastName) => {
  const first = firstName?.[0] || '';
  const last = lastName?.[0] || '';
  return (first + last).toUpperCase() || 'ص';
};

function WorkerProfile() {
  const { id } = useParams(); // Get worker ID from URL
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchWorkerProfile = async () => {
      setLoading(true);
      setError('');
      try {
        let res;
        try {
          res = await workerAPI.getWorkerProfile(id);
        } catch (e) {
          // If API fails, try to load from dummy data
          const dummyWorkers = getDummyData('workers');
          const foundWorker = dummyWorkers.find(w => w._id === id);
          if (foundWorker) {
            res = { worker: foundWorker };
          } else {
            throw new Error('Worker not found');
          }
        }

        if (res.worker) {
          setWorker(res.worker);
        } else {
          setError('لم يتم العثور على ملف الصنايعي.');
        }
      } catch (e) {
        setError(e.message || 'فشل تحميل ملف الصنايعي.');
      } finally {
        setLoading(false);
      }
    };
    fetchWorkerProfile();
  }, [id]);

  if (loading) {
    return (
      <div className={styles['worker-profile-container']}>
        <div className={styles['worker-profile-card']}>جاري تحميل ملف الصنايعي...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles['worker-profile-container']}>
        <div className={styles['worker-profile-card']}>
          <p className={styles.error}>{error}</p>
          <button onClick={() => navigate('/workers')} className={styles['back-button']}>
            العودة لتصفح الصنايعيين
          </button>
        </div>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className={styles['worker-profile-container']}>
        <div className={styles['worker-profile-card']}>لا يوجد بيانات للعامل.</div>
      </div>
    );
  }

  return (
    <div className={styles['worker-profile-container']}>
      <div className={styles['worker-profile-card']}>
        <div className={styles['worker-profile-header']}>
          {worker.userId?.profilePhoto ? (
            <img
              src={worker.userId.profilePhoto}
              alt={`${worker.userId.firstName} ${worker.userId.lastName}`}
              className={styles['worker-photo']}
            />
          ) : (
            <div className={styles['worker-photo-placeholder']}>
              {getInitials(worker.userId?.firstName, worker.userId?.lastName)}
            </div>
          )}
          <h2>{worker.userId?.firstName} {worker.userId?.lastName}</h2>
          <p>{worker.specialty}</p>
        </div>
        <div className={styles['worker-details']}>
          <div className={styles['detail-group']}>
            <label>الاسم الكامل:</label>
            <p className={styles['detail-text']}>{worker.userId?.firstName} {worker.userId?.lastName}</p>
          </div>
          <div className={styles['detail-group']}>
            <label>التخصص:</label>
            <p className={styles['detail-text']}>{worker.specialty}</p>
          </div>
          <div className={styles['detail-group']}>
            <label>السعر بالساعة:</label>
            <p className={styles['detail-text']}>{worker.hourPrice} ج.م</p>
          </div>
          <div className={styles['detail-group']}>
            <label>المدينة:</label>
            <p className={styles['detail-text']}>{worker.userId?.city} - {worker.userId?.area}</p>
          </div>
          <div className={styles['detail-group']}>
            <label>رقم الهاتف:</label>
            <p className={styles['detail-text']}>{worker.userId?.phone}</p>
          </div>
          {worker.verificationStatus === 'verified' && (
            <div className={styles['detail-group']}>
              <label>حالة التوثيق:</label>
              <p className={`${styles['detail-text']} ${styles.verified}`}>✓ موثق</p>
            </div>
          )}
          {/* Add more worker details here if available */}
        </div>
        <button onClick={() => navigate('/workers')} className={styles['back-button']}>
          العودة لتصفح الصنايعيين
        </button>
      </div>
    </div>
  );
}

export default WorkerProfile;
