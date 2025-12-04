import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { serviceRequestAPI } from '../../utils/api';
import styles from './ServiceRequestDetails.module.css';

function ServiceRequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRequest = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await serviceRequestAPI.getById(id);
        if (response.ok && response.request) {
          setRequest(response.request);
        } else {
          setError('لم يتم العثور على الطلب.');
        }
      } catch (err) {
        console.error('Fetch request error:', err);
        setError('فشل تحميل تفاصيل الطلب.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRequest();
    }
  }, [id]);

  const getStatusLabel = (status) => {
    const labels = {
      'pending': 'قيد الانتظار',
      'accepted': 'مقبول',
      'in-progress': 'قيد التنفيذ',
      'completed': 'مكتمل',
      'rejected': 'مرفوض',
    };
    return labels[status] || status;
  };

  const getStatusClass = (status) => {
    if (status === 'completed') return 'completed';
    if (status === 'accepted' || status === 'in-progress') return 'in-progress';
    if (status === 'rejected') return 'rejected';
    return 'pending';
  };

  if (loading) {
    return (
      <div className={styles['details-container']}>
        <div className={styles['details-card']}>جاري التحميل...</div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className={styles['details-container']}>
        <div className={styles['details-card']}>
          <p className={styles.error}>{error || 'لم يتم العثور على الطلب.'}</p>
          <button onClick={() => navigate('/jobs')} className={styles['back-button']}>
            العودة إلى قائمة الوظائف
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles['details-container']}>
      <div className={styles['details-card']}>
        <div className={styles['details-header']}>
          <h2>تفاصيل طلب الخدمة</h2>
          <span className={`${styles['status-badge']} ${styles[getStatusClass(request.status)]}`}>
            {getStatusLabel(request.status)}
          </span>
        </div>

        <div className={styles['details-content']}>
          <div className={styles['detail-section']}>
            <h3>وصف المشكلة</h3>
            <p className={styles['description']}>{request.problemDescription}</p>
          </div>

          <div className={styles['detail-section']}>
            <h3>معلومات العميل</h3>
            <div className={styles['info-grid']}>
              <div className={styles['info-item']}>
                <span className={styles['info-label']}>الاسم:</span>
                <span className={styles['info-value']}>
                  {request.userId?.firstName} {request.userId?.lastName}
                </span>
              </div>
              <div className={styles['info-item']}>
                <span className={styles['info-label']}>البريد الإلكتروني:</span>
                <span className={styles['info-value']}>{request.userId?.email || 'غير متوفر'}</span>
              </div>
              <div className={styles['info-item']}>
                <span className={styles['info-label']}>رقم الهاتف:</span>
                <span className={styles['info-value']}>{request.userId?.phone || 'غير متوفر'}</span>
              </div>
              <div className={styles['info-item']}>
                <span className={styles['info-label']}>الموقع:</span>
                <span className={styles['info-value']}>
                  {request.userId?.city || 'غير محدد'}
                  {request.userId?.area && ` - ${request.userId.area}`}
                </span>
              </div>
            </div>
          </div>

          {request.assignedWorker && (
            <div className={styles['detail-section']}>
              <h3>الصنايعي المكلف</h3>
              <div className={styles['info-grid']}>
                <div className={styles['info-item']}>
                  <span className={styles['info-label']}>التخصص:</span>
                  <span className={styles['info-value']}>
                    {request.assignedWorker?.specialty || 'غير محدد'}
                  </span>
                </div>
                {request.assignedWorker?.hourPrice && (
                  <div className={styles['info-item']}>
                    <span className={styles['info-label']}>سعر الساعة:</span>
                    <span className={styles['info-value']}>
                      {request.assignedWorker.hourPrice} ج.م
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className={styles['detail-section']}>
            <h3>معلومات الطلب</h3>
            <div className={styles['info-grid']}>
              <div className={styles['info-item']}>
                <span className={styles['info-label']}>تاريخ الإنشاء:</span>
                <span className={styles['info-value']}>
                  {new Date(request.createdAt).toLocaleDateString('ar-EG', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              {request.acceptedAt && (
                <div className={styles['info-item']}>
                  <span className={styles['info-label']}>تاريخ القبول:</span>
                  <span className={styles['info-value']}>
                    {new Date(request.acceptedAt).toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles['details-actions']}>
          <button onClick={() => navigate('/jobs')} className={styles['back-button']}>
            العودة إلى قائمة الوظائف
          </button>
          {request.assignedWorker && (
            <button
              onClick={() => {
                const workerUserId = request.assignedWorker?.userId?._id || request.assignedWorker?.userId;
                const workerName = request.userId?.firstName + ' ' + request.userId?.lastName;
                navigate(`/messages?userId=${workerUserId}&userName=${encodeURIComponent(workerName)}`);
              }}
              className={styles['chat-button']}
            >
              مراسلة الصنايعي
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ServiceRequestDetails;

