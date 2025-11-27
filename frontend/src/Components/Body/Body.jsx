import styles from './Body.module.css';
import services from './services';

function Services({ service }) {
    return (
        <div className={styles["service"]}>
            <div className={styles["service-logo-container"]}>
                <img src={service.icon} alt="Icon" />
            </div>
            <p className={styles["service-name"]}>{service.name}</p>
            <p className={styles["service-description"]}>{service.description}</p>
        </div>
    );
}

function Body() {
    return (
        <main>
            <section className={styles["introduction-section"]}>
                <h2 className={styles["services-header"]}>خدماتنا</h2>
                <p className={styles["services-paragraph"]}>ابحث عن محترفين موثوقين لأي خدمة منزلية تحتاجها</p>
            </section>
            <div className={styles["services"]}>
                {services.map((service, index) => {
                    return <Services key={index} service={service} />
                })}
            </div>
            <section className={styles["how-works-section"]}>
                <div className={styles["how-works-introduction"]}>
                    <h2>كيف يعمل</h2>
                    <p>الحصول على المساعدة لمنزلك لم يكن أسهل من أي وقت مضى</p>
                </div>
                <div className={styles["how-works-steps"]}>
                    <div className={styles["step"]}>
                        <span>3</span>
                        <h3>أنجز المهمة</h3>
                        <p>
                            استرخ ودع المحترفين يتولون الأمر
                        </p>
                    </div>
                    <div className={styles["step"]}>
                        <span>2</span>
                        <h3>احجز وحدد موعد</h3>
                        <p>
                            اختر المحترف الخاص بك واحجز وقتاً يناسبك
                        </p>
                    </div>
                    <div className={styles["step"]}>
                        <span>1</span>
                        <h3>ابحث وتصفح</h3>
                        <p>
                            ابحث عن محترفين في منطقتك حسب نوع الخدمة
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default Body;