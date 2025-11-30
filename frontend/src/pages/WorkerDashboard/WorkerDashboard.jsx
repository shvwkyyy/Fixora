import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, serviceRequestAPI, workerAPI } from '../../utils/api';
import { getDummyData, dummyCurrentWorker } from '../../utils/dummyData';
import styles from './WorkerDashboard.module.css';

function WorkerDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('available');
  
  // Stats
  const [stats, setStats] = useState({
    earnings: 0,
    completedJobs: 0,
    activeJobs: 0,
    appliedJobs: 0,
  });
  
  // Worker profile
  const [workerProfile, setWorkerProfile] = useState(null);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState('not-verified');
  
  // Jobs
  const [availableJobs, setAvailableJobs] = useState([]);
  const [activeJobs, setActiveJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);

  useEffect(() => {
    loadDashboardData();
    // TODO: Initialize socket.io connection for real-time updates
    // setupSocketListeners();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    
    try {
      let user = JSON.parse(localStorage.getItem('user') || '{}');
      let userId = user.id || user._id;
      
      // Initialize dummy worker user if not logged in (for testing)
      if (!userId) {
        const { initializeDummyUser } = require('../../utils/dummyData');
        user = initializeDummyUser('worker');
        userId = user.id;
      }

      // Load worker profile
      try {
        const profileRes = await authAPI.getProfile();
        const profile = profileRes.user;
        
        // Try to get worker profile details
        // First, we need to find the worker profile by userId
        // For now, we'll use the user profile and check if they're a worker
        if (profile.userType === 'worker') {
          // Use dummy worker profile for now
          const workerProfile = dummyCurrentWorker;
          setWorkerProfile(workerProfile);
          setVerificationStatus(workerProfile.verificationStatus || 'pending');
          calculateProfileCompletion(workerProfile);
        } else {
          // Not a worker, but use dummy data for testing
          const workerProfile = dummyCurrentWorker;
          setWorkerProfile(workerProfile);
          setVerificationStatus(workerProfile.verificationStatus || 'pending');
          calculateProfileCompletion(workerProfile);
        }
      } catch (e) {
        console.error('Error loading profile:', e);
        // Use dummy data on error
        const workerProfile = dummyCurrentWorker;
        setWorkerProfile(workerProfile);
        setVerificationStatus(workerProfile.verificationStatus || 'pending');
        calculateProfileCompletion(workerProfile);
      }

      // Load available jobs (pending, not assigned)
      try {
        const availableRes = await serviceRequestAPI.getAll({ status: 'pending' });
        const jobs = availableRes.requests || [];
        // Use dummy data if empty
        setAvailableJobs(jobs.length > 0 ? jobs : getDummyData('jobs'));
      } catch (e) {
        console.error('Error loading available jobs:', e);
        // Use dummy data on error
        setAvailableJobs(getDummyData('jobs'));
      }

      // Load active jobs (accepted/in-progress assigned to this worker)
      try {
        const activeRes = await serviceRequestAPI.getAll({ 
          assignedWorker: userId,
          status: 'accepted'
        });
        const jobs = activeRes.requests || [];
        // Use dummy data if empty
        const activeJobsList = jobs.length > 0 ? jobs : getDummyData('active-jobs', 'worker1');
        setActiveJobs(activeJobsList);
        setStats(prev => ({ ...prev, activeJobs: activeJobsList.length }));
      } catch (e) {
        console.error('Error loading active jobs:', e);
        // Use dummy data on error
        const activeJobsList = getDummyData('active-jobs', 'worker1');
        setActiveJobs(activeJobsList);
        setStats(prev => ({ ...prev, activeJobs: activeJobsList.length }));
      }

      // Load completed jobs
      try {
        const completedRes = await serviceRequestAPI.getCompletedForWorker(userId);
        const completed = completedRes.completedServices || [];
        // Use dummy data if empty
        const completedJobsList = completed.length > 0 ? completed : getDummyData('completed-jobs', 'worker1');
        setStats(prev => ({ 
          ...prev, 
          completedJobs: completedJobsList.length,
          earnings: calculateEarnings(completedJobsList)
        }));
      } catch (e) {
        console.error('Error loading completed jobs:', e);
        // Use dummy data on error
        const completedJobsList = getDummyData('completed-jobs', 'worker1');
        setStats(prev => ({ 
          ...prev, 
          completedJobs: completedJobsList.length,
          earnings: calculateEarnings(completedJobsList)
        }));
      }

      // Load applied jobs (jobs worker has applied to but not yet accepted)
      // This would need a separate endpoint or we can filter from available
      setStats(prev => ({ ...prev, appliedJobs: 0 }));

    } catch (err) {
      setError('فشل تحميل بيانات لوحة التحكم. يرجى المحاولة مرة أخرى.');
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateProfileCompletion = (profile) => {
    const fields = [
      'specialty',
      'hourPrice',
      'nationalIdFront',
      'nationalIdBack',
      'nationalIdWithFace',
    ];
    const completed = fields.filter(field => profile[field]).length;
    const percentage = Math.round((completed / fields.length) * 100);
    setProfileCompletion(percentage);
  };

  const calculateEarnings = (completedJobs) => {
    // Calculate earnings from completed jobs
    // This is a placeholder - actual calculation would depend on job pricing
    return completedJobs.length * 500; // Example: 500 EGP per job
  };

  const handleAcceptJob = async (jobId) => {
    try {
      await serviceRequestAPI.accept(jobId);
      loadDashboardData(); // Reload data
    } catch (err) {
      setError('فشل قبول الطلب. يرجى المحاولة مرة أخرى.');
      console.error('Accept job error:', err);
    }
  };

  if (loading) {
    return (
      <div className={styles['dashboard-container']}>
        <div className={styles.loading}>جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className={styles['dashboard-container']}>
      <div className={styles['dashboard-header']}>
        <h1>لوحة تحكم الصنايعي</h1>
        <p>مرحباً بك في لوحة التحكم الخاصة بك</p>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {/* Stats Cards */}
      <div className={styles['stats-grid']}>
        <div className={styles['stat-card']}>
          <div className={styles['stat-card-title']}>إجمالي الأرباح</div>
          <div className={styles['stat-card-value']}>{stats.earnings} ج.م</div>
          <div className={styles['stat-card-subtitle']}>من الوظائف المكتملة</div>
        </div>
        
        <div className={styles['stat-card']}>
          <div className={styles['stat-card-title']}>الوظائف المكتملة</div>
          <div className={styles['stat-card-value']}>{stats.completedJobs}</div>
          <div className={styles['stat-card-subtitle']}>وظيفة مكتملة</div>
        </div>
        
        <div className={styles['stat-card']}>
          <div className={styles['stat-card-title']}>الوظائف النشطة</div>
          <div className={styles['stat-card-value']}>{stats.activeJobs}</div>
          <div className={styles['stat-card-subtitle']}>وظيفة قيد التنفيذ</div>
        </div>
        
        <div className={styles['stat-card']}>
          <div className={styles['stat-card-title']}>الوظائف المتقدمة لها</div>
          <div className={styles['stat-card-value']}>{stats.appliedJobs}</div>
          <div className={styles['stat-card-subtitle']}>في انتظار القبول</div>
        </div>
      </div>

      {/* Status Section */}
      <div className={styles['status-section']}>
        <div className={styles['status-card']}>
          <h3>حالة التحقق</h3>
          <span className={`${styles['status-badge']} ${styles[verificationStatus]}`}>
            {verificationStatus === 'verified' ? 'تم التحقق' : 
             verificationStatus === 'pending' ? 'قيد المراجعة' : 'غير محقق'}
          </span>
        </div>
        
        <div className={styles['status-card']}>
          <h3>اكتمال الملف الشخصي</h3>
          <div className={styles['profile-completion']}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>{profileCompletion}%</span>
            </div>
            <div className={styles['profile-completion-bar']}>
              <div 
                className={styles['profile-completion-fill']} 
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
            {profileCompletion < 100 && (
              <p style={{ marginTop: '0.5rem', fontSize: '13px', color: '#64748b' }}>
                أكمل ملفك الشخصي للحصول على المزيد من الوظائف
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Jobs Section */}
      <div className={styles['jobs-section']}>
        <h2>الوظائف</h2>
        
        <div className={styles['jobs-tabs']}>
          <button
            className={`${styles['tab-button']} ${activeTab === 'available' ? styles.active : ''}`}
            onClick={() => setActiveTab('available')}
          >
            الوظائف المتاحة ({availableJobs.length})
          </button>
          <button
            className={`${styles['tab-button']} ${activeTab === 'active' ? styles.active : ''}`}
            onClick={() => setActiveTab('active')}
          >
            الوظائف النشطة ({activeJobs.length})
          </button>
          <button
            className={`${styles['tab-button']} ${activeTab === 'applied' ? styles.active : ''}`}
            onClick={() => setActiveTab('applied')}
          >
            المتقدمة لها ({appliedJobs.length})
          </button>
        </div>

        <div className={styles['jobs-list']}>
          {activeTab === 'available' && (
            <>
              {availableJobs.length === 0 ? (
                <div className={styles['empty-state']}>
                  <p>لا توجد وظائف متاحة حالياً</p>
                </div>
              ) : (
                availableJobs.map((job) => (
                  <div key={job._id} className={styles['job-card']}>
                    <div className={styles['job-card-header']}>
                      <div>
                        <div className={styles['job-card-title']}>
                          {job.userId?.firstName} {job.userId?.lastName}
                        </div>
                        <div className={styles['job-card-meta']}>
                          <span>📍 {job.userId?.city || 'غير محدد'}</span>
                          <span>📅 {new Date(job.createdAt).toLocaleDateString('ar-EG')}</span>
                        </div>
                      </div>
                      <span className={`${styles['job-card-status']} ${styles.pending}`}>
                        متاح
                      </span>
                    </div>
                    <div className={styles['job-card-description']}>
                      {job.problemDescription}
                    </div>
                    <div className={styles['job-card-actions']}>
                      <button
                        className={`${styles.btn} ${styles['btn-primary']}`}
                        onClick={() => handleAcceptJob(job._id)}
                      >
                        قبول الوظيفة
                      </button>
                      <button
                        className={`${styles.btn} ${styles['btn-secondary']}`}
                        onClick={() => navigate(`/worker/jobs/${job._id}`)}
                      >
                        عرض التفاصيل
                      </button>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {activeTab === 'active' && (
            <>
              {activeJobs.length === 0 ? (
                <div className={styles['empty-state']}>
                  <p>لا توجد وظائف نشطة حالياً</p>
                </div>
              ) : (
                activeJobs.map((job) => (
                  <div key={job._id} className={styles['job-card']}>
                    <div className={styles['job-card-header']}>
                      <div>
                        <div className={styles['job-card-title']}>
                          {job.userId?.firstName} {job.userId?.lastName}
                        </div>
                        <div className={styles['job-card-meta']}>
                          <span>📍 {job.userId?.city || 'غير محدد'}</span>
                          <span>📅 {new Date(job.createdAt).toLocaleDateString('ar-EG')}</span>
                        </div>
                      </div>
                      <span className={`${styles['job-card-status']} ${styles.accepted}`}>
                        قيد التنفيذ
                      </span>
                    </div>
                    <div className={styles['job-card-description']}>
                      {job.problemDescription}
                    </div>
                    <div className={styles['job-card-actions']}>
                      <button
                        className={`${styles.btn} ${styles['btn-secondary']}`}
                        onClick={() => navigate(`/worker/jobs/${job._id}`)}
                      >
                        عرض التفاصيل
                      </button>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {activeTab === 'applied' && (
            <>
              {appliedJobs.length === 0 ? (
                <div className={styles['empty-state']}>
                  <p>لم تتقدم لأي وظائف بعد</p>
                </div>
              ) : (
                <div className={styles['empty-state']}>
                  <p>قريباً: عرض الوظائف التي تقدمت لها</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default WorkerDashboard;

