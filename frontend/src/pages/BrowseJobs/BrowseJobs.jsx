import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, serviceRequestAPI } from '../../utils/api';
import { getDummyData } from '../../utils/dummyData';
import styles from './BrowseJobs.module.css';

const SPECIALTIES = ['سباكة', 'كهرباء', 'تنظيف', 'دهان', 'نجارة', 'إصلاح أجهزة', 'بناء', 'نجارة أثاث', 'سباك صحي', 'أخرى'];
const DISTANCE_OPTIONS = [
  { value: 'all', label: 'جميع المسافات' },
  { value: '5', label: 'أقل من 5 كم' },
  { value: '10', label: 'أقل من 10 كم' },
  { value: '20', label: 'أقل من 20 كم' },
  { value: '50', label: 'أقل من 50 كم' },
];

function BrowseJobs() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  
  // Filters
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedDistance, setSelectedDistance] = useState('all');
  const [userLocation, setUserLocation] = useState(null);
  
  // Worker info
  const [workerSpecialty, setWorkerSpecialty] = useState('');

  useEffect(() => {
    loadJobs();
    getUserLocation();
    loadWorkerProfile();
    // TODO: Initialize socket.io connection for real-time updates
    // setupSocketListeners();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [jobs, selectedSpecialty, selectedDistance, userLocation]);

  const loadWorkerProfile = async () => {
    try {
      const profileRes = await authAPI.getProfile();
      // Try to get worker specialty from profile or worker profile
      // This is a placeholder - in real scenario, you'd fetch worker profile
      if (profileRes.user?.userType === 'worker') {
        // Worker specialty would come from worker profile
        // For now, we'll use empty string to show all jobs
      }
    } catch (err) {
      console.error('Error loading worker profile:', err);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.warn('Could not get user location:', error);
        }
      );
    }
  };

  const loadJobs = async () => {
    setLoading(true);
    setError('');
    
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.id && !user._id) {
        navigate('/login');
        return;
      }

      // Fetch pending service requests (available jobs)
      const response = await serviceRequestAPI.getAll({ status: 'pending' });
      let jobsList = response.requests || [];
      
      // Use dummy data if empty
      if (jobsList.length === 0) {
        jobsList = getDummyData('jobs');
      }
      
      // Enrich jobs with distance if user location is available
      const enrichedJobs = jobsList.map(job => {
        let distance = null;
        if (userLocation && job.userId?.location) {
          // Calculate distance if location data is available
          // This is a placeholder - actual implementation would use coordinates
          distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            job.userId.location.latitude || 0,
            job.userId.location.longitude || 0
          );
        }
        return { ...job, distance };
      });

      setJobs(enrichedJobs);
    } catch (err) {
      console.error('Load jobs error:', err);
      // Use dummy data on error
      const jobsList = getDummyData('jobs');
      const enrichedJobs = jobsList.map(job => {
        let distance = null;
        if (userLocation && job.userId?.location) {
          distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            job.userId.location.latitude || 0,
            job.userId.location.longitude || 0
          );
        }
        return { ...job, distance };
      });
      setJobs(enrichedJobs);
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    // Haversine formula to calculate distance between two coordinates
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10; // Distance in km
  };

  const applyFilters = () => {
    let filtered = [...jobs];

    // Filter by specialty (if job has specialty field, otherwise show all)
    if (selectedSpecialty) {
      // Note: Service requests might not have specialty field directly
      // This would need backend support or filtering by worker specialty matching
      // For now, we'll show all jobs if specialty filter is selected
      // In real implementation, backend would filter by matching worker specialty
    }

    // Filter by distance
    if (selectedDistance !== 'all' && userLocation) {
      const maxDistance = parseFloat(selectedDistance);
      filtered = filtered.filter(job => {
        if (!job.distance) return false;
        return job.distance <= maxDistance;
      });
    }

    // Sort by distance (closest first) if location is available
    if (userLocation) {
      filtered.sort((a, b) => {
        if (!a.distance) return 1;
        if (!b.distance) return -1;
        return a.distance - b.distance;
      });
    }

    setFilteredJobs(filtered);
  };

  const handleApply = (jobId) => {
    // Navigate to job application page
    navigate(`/worker/jobs/${jobId}/apply`);
  };

  const handleViewDetails = (jobId) => {
    // Navigate to job details page
    navigate(`/worker/jobs/${jobId}`);
  };

  const clearFilters = () => {
    setSelectedSpecialty('');
    setSelectedDistance('all');
  };

  if (loading) {
    return (
      <div className={styles['browse-jobs-container']}>
        <div className={styles.loading}>جاري تحميل الوظائف...</div>
      </div>
    );
  }

  return (
    <div className={styles['browse-jobs-container']}>
      <div className={styles['page-header']}>
        <h1>تصفح الوظائف</h1>
        <p>ابحث عن الوظائف المتاحة التي تناسب تخصصك</p>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {/* Real-time indicator */}
      <div className={styles['real-time-badge']}>
        <span className={styles['real-time-dot']}></span>
        <span>تحديثات مباشرة</span>
      </div>

      {/* Filters Section */}
      <div className={styles['filters-section']}>
        <h3>تصفية الوظائف</h3>
        <div className={styles['filters-grid']}>
          <div className={styles['filter-group']}>
            <label htmlFor="specialty">التخصص</label>
            <select
              id="specialty"
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
            >
              <option value="">جميع التخصصات</option>
              {SPECIALTIES.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>

          <div className={styles['filter-group']}>
            <label htmlFor="distance">المسافة</label>
            <select
              id="distance"
              value={selectedDistance}
              onChange={(e) => setSelectedDistance(e.target.value)}
              disabled={!userLocation}
            >
              {DISTANCE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {!userLocation && (
              <small style={{ color: '#64748b', fontSize: '12px', marginTop: '4px' }}>
                تفعيل الموقع الجغرافي لتصفية حسب المسافة
              </small>
            )}
          </div>
        </div>
        {(selectedSpecialty || selectedDistance !== 'all') && (
          <button className={styles['clear-filters']} onClick={clearFilters}>
            مسح الفلاتر
          </button>
        )}
      </div>

      {/* Jobs Section */}
      <div className={styles['jobs-section']}>
        <div className={styles['jobs-header']}>
          <h2>الوظائف المتاحة</h2>
          <span className={styles['jobs-count']}>
            {filteredJobs.length} وظيفة متاحة
          </span>
        </div>

        {filteredJobs.length === 0 ? (
          <div className={styles['empty-state']}>
            <div className={styles['empty-state-icon']}>🔍</div>
            <h3>لا توجد وظائف متاحة</h3>
            <p>
              {selectedSpecialty || selectedDistance !== 'all'
                ? 'جرب تغيير الفلاتر للعثور على المزيد من الوظائف'
                : 'لا توجد وظائف متاحة حالياً. تحقق لاحقاً!'}
            </p>
          </div>
        ) : (
          <div className={styles['jobs-grid']}>
            {filteredJobs.map((job) => (
              <div key={job._id} className={styles['job-card']}>
                <div className={styles['job-card-header']}>
                  <div>
                    <div className={styles['job-card-title']}>
                      {job.userId?.firstName} {job.userId?.lastName}
                    </div>
                  </div>
                  <span className={styles['job-card-status']}>متاح</span>
                </div>

                <div className={styles['job-card-description']}>
                  {job.problemDescription}
                </div>

                <div className={styles['job-card-meta']}>
                  <div className={styles['meta-item']}>
                    <span className={styles['meta-item-icon']}>📍</span>
                    <span>
                      {job.userId?.city || 'غير محدد'}
                      {job.userId?.area && ` - ${job.userId.area}`}
                    </span>
                  </div>
                  
                  {job.distance !== null && (
                    <div className={styles['meta-item']}>
                      <span className={styles['meta-item-icon']}>📏</span>
                      <span>{job.distance} كم</span>
                    </div>
                  )}
                  
                  <div className={styles['meta-item']}>
                    <span className={styles['meta-item-icon']}>📅</span>
                    <span>{new Date(job.createdAt).toLocaleDateString('ar-EG')}</span>
                  </div>
                </div>

                <div className={styles['job-card-actions']}>
                  <button
                    className={`${styles.btn} ${styles['btn-primary']}`}
                    onClick={() => handleApply(job._id)}
                  >
                    التقديم
                  </button>
                  <button
                    className={`${styles.btn} ${styles['btn-secondary']}`}
                    onClick={() => handleViewDetails(job._id)}
                  >
                    التفاصيل
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BrowseJobs;

