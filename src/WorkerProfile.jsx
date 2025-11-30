import React from "react";
import profilepic from "./assets/profilepic.png";
import fixoralogo from "./assets/fixoralogo.jpg";

function WorkerProfile() {
    const worker = {
    name: "فارس العصب",
    age: 38,
    area: "ميدان الساعه فيكتوريا",
    city: "الأسكندرية",
    price: "150 جنيه / ساعة",
    specialization: "سباك",
    avatar: "",
    portfolio: [
        "https://via.placeholder.com/100?text=صورة+1",
        "https://via.placeholder.com/100?text=صورة+2",
        "https://via.placeholder.com/100?text=صورة+3",
    ],
    social: {
      facebook: "#",
      instagram: "#",
      whatsapp: "#",
    },
  };

 return (
    <div className="profile-container">
      <header className="profile-header">
        <h2>بروفايل العامل</h2>
      </header>

      <div className="profile-content">
        <div className="profile-avatar-section">
          <img className="profile-avatar" src={profilepic} alt="صورة العامل" />

          <button className="close-btn">
              <img src={fixoralogo} alt="close" className="close-icon" />
              </button>

          <div className="profile-basic">
            <h3 className="profile-name">{worker.name}</h3>
            <p className="profile-sub">{worker.specialization}</p>
          </div>
        </div>

        <div className="profile-info-grid">
          <div>
            <label>العمر</label>
            <div className="profile-value">{worker.age} سنة</div>
          </div>

          <div>
            <label>المنطقة</label>
            <div className="profile-value">{worker.area}</div>
          </div>

          <div>
            <label>المدينة</label>
            <div className="profile-value">{worker.city}</div>
          </div>

          <div>
            <label>السعر</label>
            <div className="profile-value">{worker.price}</div>
          </div>
        </div>

        <div className="profile-portfolio">
          <h4>بورتفوليو الأعمال</h4>
          <div className="profile-portfolio-grid">
            {worker.portfolio.map((img, i) => (
              <div key={i} className="profile-portfolio-item">
                <img src={img} alt={`عمل ${i}`} />
              </div>
            ))}
          </div>
        </div>

        <div className="profile-social">
          <h4>تواصل</h4>
          <div className="profile-social-links">
            <a href={worker.social.facebook}>فيسبوك</a>
            <a href={worker.social.instagram}>إنستجرام</a>
            <a href={worker.social.whatsapp}>واتساب</a>
          </div>
        </div>

        <div className="profile-actions">
          <button className="btn btn-contact">مراسلة</button>
          <button className="btn btn-book">طلب خدمة</button>
        </div>
      </div>
    </div>
  );
}

export default WorkerProfile;