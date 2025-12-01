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
  const [openedImage, setOpenedImage] = useState(null); // للتحكم بالصورة المفتوحة

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
      <div className={styles['worker-profile-card']} style={{maxWidth:'400px', margin:'0 auto'}}>
        <div className={styles['worker-profile-header']} style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
          {worker.userId?.profilePhoto ? (
            <img
              src={worker.userId.profilePhoto}
              alt={`${worker.userId.firstName} ${worker.userId.lastName}`}
              className={styles['worker-photo']}
              style={{width: 92, height: 92, borderRadius:'50%', objectFit:'cover', marginBottom: 16, boxShadow: '0 4px 18px rgba(0,0,0,0.09)'}}
            />
          ) : (
            <div className={styles['worker-photo-placeholder']} style={{width: 92, height: 92, borderRadius: '50%', background: '#e5e5e5',display:'flex',alignItems:'center',justifyContent:'center', fontSize:'2.7rem',marginBottom: 16, color:'#555',fontWeight:600}}>
              {getInitials(worker.userId?.firstName, worker.userId?.lastName)}
            </div>
          )}
          <h2 style={{marginBottom: 4}}>{worker.userId?.firstName} {worker.userId?.lastName}</h2>
          <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:8}}>
            <span style={{background:'#e3f9ee',color:'#1ba37a',borderRadius:12,padding:'2px 10px',fontSize:'0.98rem'}}>{worker.specialty}</span>
            {worker.verificationStatus === 'verified' && (
              <span style={{color:'#3bb94c', fontWeight:600, fontSize:'1.1rem'}}>✓ موثق</span>
            )}
          </div>
          <button 
            style={{margin:'8px 0 0 0', background:'#26B176', color:'#fff',padding:'8px 26px',fontSize:'1.03rem', border:'none', borderRadius:17, cursor:'pointer',fontWeight:600}}
            onClick={()=>navigate(`/messages?workerId=${worker._id}&workerName=${encodeURIComponent(worker.userId?.firstName + ' ' + worker.userId?.lastName || '')}`)}
          >
            أرسل رسالة
          </button>
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
        </div>
        {/* معرض الأعمال (Gallery) */}
        {Array.isArray(worker.images) && worker.images.length > 0 && (
          <div className={styles['gallery-section']} style={{margin:'18px 0'}}>
            <h3 style={{margin:'0 0 10px 0', fontSize:'1.04rem', color:'#27ae60',textAlign:'right',letterSpacing:'0.2px'}}>معرض الأعمال</h3>
            <div style={{display:'flex',gap:9,flexWrap:'wrap'}}>
              {worker.images.map((img, i)=>(
                <img key={i} src={img} alt={`عمل ${i+1}`} 
                  style={{width:98,height:98,objectFit:'cover',borderRadius:10,border:'1px solid #eee',boxShadow:'0 2px 8px #0001', cursor:'pointer'}}
                  onClick={()=>setOpenedImage(img)}
                />
              ))}
            </div>
            {openedImage && (
              <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',zIndex:5000,background:'rgba(46,58,70,0.79)',display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setOpenedImage(null)}>
                <div style={{position:'relative',maxWidth:'92vw',maxHeight:'80vh'}} onClick={e=>e.stopPropagation()}>
                  <img src={openedImage} alt="صورة مكبرة" style={{maxWidth:'92vw',maxHeight:'80vh',borderRadius:18,boxShadow:'0 4px 32px #0005',background:'#fff'}} />
                  <button aria-label="إغلاق" onClick={()=>setOpenedImage(null)}
                    style={{position:'absolute',top:-10,right:-10,background:'#fff',border:'none',borderRadius:30,width:34,height:34,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 2px 8px #0005',cursor:'pointer',fontSize:'1.5rem'}}
                  >×</button>
                </div>
              </div>
            )}
          </div>
        )}
        <button onClick={() => navigate('/workers')} className={styles['back-button']} style={{marginTop:12}}>
          العودة لتصفح الصنايعيين
        </button>
      </div>
    </div>
  );
}

export default WorkerProfile;
