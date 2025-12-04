import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI, serviceRequestAPI } from '../../utils/api';
import styles from './MyJobs.module.css';

function MyJobs() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  
  // Jobs by status
  const [activeJobs, setActiveJobs] = useState([]);
  const [pendingJobs, setPendingJobs] = useState([]);
  const [inProgressJobs, setInProgressJobs] = useState([]);
  const [completedJobs, setCompletedJobs] = useState([]);
  
  // Stats
  const [stats, setStats] = useState({
    active: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
  });

  useEffect(() => {
    loadJobs();
    // TODO: Initialize socket.io connection for real-time updates
    // setupSocketListeners();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    setError('');
    
    try {
      let user = JSON.parse(localStorage.getItem('user') || '{}');
      let userId = user.id || user._id;
      
      if (!userId) {
        navigate('/login');
        return;
      }

      // Load all jobs for this user
      const response = await serviceRequestAPI.getAll({ userId });
      const allJobs = response.requests || [];
      
      // Categorize jobs by status
      const active = allJobs.filter(job => job.status === 'pending' && !job.assignedWorker);
      const pending = allJobs.filter(job => job.status === 'pending' && job.assignedWorker);
      const inProgress = allJobs.filter(job => job.status === 'accepted' || job.status === 'in-progress');
      const completed = allJobs.filter(job => job.status === 'completed');
      
      setActiveJobs(active);
      setPendingJobs(pending);
      setInProgressJobs(inProgress);
      setCompletedJobs(completed);
      
      setStats({
        active: active.length,
        pending: pending.length,
        inProgress: inProgress.length,
        completed: completed.length,
      });
    } catch (err) {
      setError('فشل تحميل الوظائف. يرجى المحاولة مرة أخرى.');
      console.error('Load jobs error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptApplicant = async (jobId, workerId) => {
    try {
      // This would need a backend endpoint to accept an applicant
      // For now, we'll use the acceptService endpoint which assigns a worker
      await serviceRequestAPI.accept(jobId);
      loadJobs(); // Reload jobs
    } catch (err) {
      setError('فشل قبول الطلب. يرجى المحاولة مرة أخرى.');
      console.error('Accept applicant error:', err);
    }
  };

  const handleRejectApplicant = async (jobId, workerId) => {
    try {
      // This would need a backend endpoint to reject an applicant
      // For now, this is a placeholder
      alert('ميزة رفض المتقدمين قريباً');
      loadJobs();
    } catch (err) {
      setError('فشل رفض الطلب. يرجى المحاولة مرة أخرى.');
      console.error('Reject applicant error:', err);
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      'pending': 'قيد الانتظار',
      'accepted': 'مقبول',
      'in-progress': 'قيد التنفيذ',
      'completed': 'مكتمل',
    };
    return labels[status] || status;
  };

  const getStatusClass = (status) => {
    if (status === 'completed') return 'completed';
    if (status === 'accepted' || status === 'in-progress') return 'in-progress';
    return 'pending';
  };

  const renderJobCard = (job) => {
    return (
      <div key={job._id} className={styles['job-card']}>
        <div className={styles['job-card-header']}>
          <div>
            <div className={styles['job-card-title']}>طلب خدمة #{job._id.slice(-6)}</div>
            <div className={styles['job-card-meta']}>
              <span>📅 {new Date(job.createdAt).toLocaleDateString('ar-EG')}</span>
              {job.acceptedAt && (
                <span>✅ تم القبول: {new Date(job.acceptedAt).toLocaleDateString('ar-EG')}</span>
              )}
            </div>
          </div>
          <span className={`${styles['job-card-status']} ${styles[getStatusClass(job.status)]}`}>
            {getStatusLabel(job.status)}
          </span>
        </div>

        <div className={styles['job-card-description']}>
          {job.problemDescription}
        </div>

        {/* Show assigned worker if exists */}
        {job.assignedWorker && (
          <div className={styles['assigned-worker']}>
            <div className={styles['assigned-worker-info']}>
              <div className={styles['assigned-worker-name']}>
                الصنايعي المكلف: {job.assignedWorker?.userId?.firstName || 'غير محدد'}
              </div>
              {job.assignedWorker?.specialty && (
                <div className={styles['assigned-worker-details']}>
                  التخصص: {job.assignedWorker.specialty}
                  {job.assignedWorker.hourPrice && ` • السعر: ${job.assignedWorker.hourPrice} ج.م/ساعة`}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Show applicants for pending jobs */}
        {job.status === 'pending' && !job.assignedWorker && (
          <div className={styles['applicants-section']}>
            <h4>المتقدمون للوظيفة</h4>
            {job.applicants && job.applicants.length > 0 ? (
              <div className={styles['applicants-list']}>
                {job.applicants.map((applicant, idx) => (
                  <div key={idx} className={styles['applicant-card']}>
                    <div className={styles['applicant-info']}>
                      <div className={styles['applicant-name']}>
                        {applicant.workerName || 'صنايعي'}
                      </div>
                      <div className={styles['applicant-details']}>
                        {applicant.specialty && `التخصص: ${applicant.specialty}`}
                        {applicant.price && ` • السعر: ${applicant.price} ج.م/ساعة`}
                      </div>
                    </div>
                    <div className={styles['applicant-actions']}>
                      <button
                        className={`${styles.btn} ${styles['btn-primary']}`}
                        onClick={() => handleAcceptApplicant(job._id, applicant.workerId)}
                      >
                        قبول
                      </button>
                      <button
                        className={`${styles.btn} ${styles['btn-danger']}`}
                        onClick={() => handleRejectApplicant(job._id, applicant.workerId)}
                      >
                        رفض
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#64748b', fontSize: '14px' }}>
                لا يوجد متقدمون بعد
              </p>
            )}
          </div>
        )}

        <div className={styles['job-card-actions']}>
          <button
            className={`${styles.btn} ${styles['btn-secondary']}`}
            onClick={() => navigate(`/jobs/${job._id}/details`)}
          >
            عرض التفاصيل
          </button>
          {job.assignedWorker && job.status !== 'completed' && (
            <button
              className={`${styles.btn} ${styles['btn-secondary']}`}
              onClick={() => navigate(`/messages/${job.assignedWorker.userId?._id || job.assignedWorker.userId}`)}
            >
              مراسلة الصنايعي
            </button>
          )}
        </div>
      </div>
    );
  };

  const getCurrentJobs = () => {
    switch (activeTab) {
      case 'active':
        return activeJobs;
      case 'pending':
        return pendingJobs;
      case 'in-progress':
        return inProgressJobs;
      case 'completed':
        return completedJobs;
      default:
        return [];
    }
  };

  const getEmptyMessage = () => {
    switch (activeTab) {
      case 'active':
        return 'لا توجد وظائف نشطة حالياً';
      case 'pending':
        return 'لا توجد طلبات في انتظار القبول';
      case 'in-progress':
        return 'لا توجد وظائف قيد التنفيذ';
      case 'completed':
        return 'لا توجد وظائف مكتملة';
      default:
        return 'لا توجد وظائف';
    }
  };

  if (loading) {
    return (
      <div className={styles['my-jobs-container']}>
        <div className={styles.loading}>جاري تحميل الوظائف...</div>
      </div>
    );
  }

  return (
    <div className={styles['my-jobs-container']}>
      <div className={styles['page-header']}>
        <h1>وظائفي</h1>
        <p>إدارة جميع طلبات الخدمة الخاصة بك</p>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {/* Real-time indicator */}
      <div className={styles['real-time-badge']}>
        <span className={styles['real-time-dot']}></span>
        <span>تحديثات مباشرة</span>
      </div>

      {/* Stats Summary */}
      <div className={styles['stats-summary']}>
        <div className={styles['stat-badge']}>
          <div className={styles['stat-badge-value']}>{stats.active}</div>
          <div className={styles['stat-badge-label']}>وظائف نشطة</div>
        </div>
        <div className={styles['stat-badge']}>
          <div className={styles['stat-badge-value']}>{stats.pending}</div>
          <div className={styles['stat-badge-label']}>في انتظار القبول</div>
        </div>
        <div className={styles['stat-badge']}>
          <div className={styles['stat-badge-value']}>{stats.inProgress}</div>
          <div className={styles['stat-badge-label']}>قيد التنفيذ</div>
        </div>
        <div className={styles['stat-badge']}>
          <div className={styles['stat-badge-value']}>{stats.completed}</div>
          <div className={styles['stat-badge-label']}>مكتملة</div>
        </div>
      </div>

      {/* Jobs Section */}
      <div className={styles['jobs-section']}>
        <div className={styles['jobs-header']}>
          <h2>الوظائف</h2>
          <Link to="/jobs/create" className={styles['create-job-button']}>
            + إنشاء طلب جديد
          </Link>
        </div>

        <div className={styles['jobs-tabs']}>
          <button
            className={`${styles['tab-button']} ${activeTab === 'active' ? styles.active : ''}`}
            onClick={() => setActiveTab('active')}
          >
            <span className={styles['tab-badge']}>{stats.active}</span>
            نشطة
          </button>
          <button
            className={`${styles['tab-button']} ${activeTab === 'pending' ? styles.active : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            <span className={styles['tab-badge']}>{stats.pending}</span>
            في انتظار القبول
          </button>
          <button
            className={`${styles['tab-button']} ${activeTab === 'in-progress' ? styles.active : ''}`}
            onClick={() => setActiveTab('in-progress')}
          >
            <span className={styles['tab-badge']}>{stats.inProgress}</span>
            قيد التنفيذ
          </button>
          <button
            className={`${styles['tab-button']} ${activeTab === 'completed' ? styles.active : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            <span className={styles['tab-badge']}>{stats.completed}</span>
            مكتملة
          </button>
        </div>

        <div className={styles['jobs-list']}>
          {getCurrentJobs().length === 0 ? (
            <div className={styles['empty-state']}>
              <div className={styles['empty-state-icon']}>📋</div>
              <h3>{getEmptyMessage()}</h3>
              {activeTab === 'active' && (
                <p>
                  <Link to="/jobs/create" style={{ color: '#10b981', textDecoration: 'none' }}>
                    أنشئ طلب خدمة جديد
                  </Link>
                </p>
              )}
            </div>
          ) : (
            getCurrentJobs().map(job => renderJobCard(job))
          )}
        </div>
      </div>
    </div>
  );
}

export default MyJobs;

