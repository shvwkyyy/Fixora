import React, { useState } from "react";
import profilepic from "./assets/profilepic.png";
import fixoralogo from "./assets/fixoralogo.jpg";

function CustomerProfile() {
  const [editing, setEditing] = useState(false);
  const [customer, setCustomer] = useState({
    name: "عمر خالد",
    age: 22,
    area: "المندره",
    city: "الإسكندرية",
    img: "",
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setCustomer((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <div className="profile-container">
      <header className="profile-header">
        <h2>بروفايل العميل</h2>
      </header>
            
      <div className="profile-content">
        <div className="profile-avatar-section">
          <img className="profile-avatar" src={profilepic} alt="صورة العميل" />

          <button className="close-btn">
            <img src={fixoralogo} alt="close" className="close-icon" />
            </button>

          <div className="profile-basic">
            <h3 className="profile-name">{customer.name}</h3>
            <p className="profile-join">عميل منذ 2024</p>
          </div>
        </div>

        <div className="profile-form full-width">
          <label>الاسم</label>
          <input
            type="text"
            name="name"
            value={customer.name}
            onChange={handleChange}
            readOnly={!editing}
          />

          <label>العمر</label>
          <input
            type="number"
            name="age"
            value={customer.age}
            onChange={handleChange}
            readOnly={!editing}
          />

          <label>المنطقة</label>
          <input
            type="text"
            name="area"
            value={customer.area}
            onChange={handleChange}
            readOnly={!editing}
          />

          <label>المدينة</label>
          <input
            type="text"
            name="city"
            value={customer.city}
            onChange={handleChange}
            readOnly={!editing}
          />

          <div className="profile-actions">
            <button
              className={`btn ${editing ? "btn-cancel" : "btn-edit"}`}
              onClick={() => setEditing((prev) => !prev)}
            >
              {editing ? "إلغاء" : "تعديل بيانات"}
            </button>

            {editing && (
              <button
                className="btn btn-save"
                onClick={() => {
                  setEditing(false);
                  alert("تم حفظ التغييرات");
                }}
              >
                حفظ
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerProfile;
