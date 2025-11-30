import styles from './Body.module.css';
import services from './services';
import check_logo from '../../assets/check.svg';
import shield_logo from '../../assets/shield.svg';
import clock_logo from '../../assets/clock.svg';

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
            <section className={styles["introduction-section"]} id="services">
                <h2 className={styles["services-header"]}>خدماتنا</h2>
                <p className={styles["services-paragraph"]}>ابحث عن محترفين موثوقين لأي خدمة منزلية تحتاجها</p>
            </section>
            <div className={styles["services"]} >
                {services.map((service, index) => {
                    return <Services key={index} service={service} />
                })}
            </div>
            <section className={styles["how-works-section"]} id="how-works">
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
            <section className={styles["trust-section"]}>
                <div className={styles["trust-element"]}>
                    <div className={styles["logo-container"]}>
                        <img src={clock_logo} alt="Check Logo" />
                    </div>
                    <h3>دعم على مدار الساعة</h3>
                    <p>
                        دعم العملاء متاح عندما تحتاجه
                    </p>
                </div>
                <div className={styles["trust-element"]}>
                    <div className={styles["logo-container"]}>
                        <img src={shield_logo} alt="Check Logo" />
                    </div>
                    <h3>دفع آمن</h3>
                    <p>
                        معالجة آمنة ومأمونة للمدفوعات
                    </p>
                </div>
                <div className={styles["trust-element"]}>
                    <div className={styles["logo-container"]}>
                        <img src={check_logo} alt="Check Logo" />
                    </div>
                    <h3>محترفون موثوقون</h3>
                    <p>
                        جميع العمال تم فحص خلفياتهم والتحقق منهم
                    </p>
                </div>
            </section>
            <section className={styles["about-us"]} id='about-us'>
                <h1>
                    عن فيكسورا
                </h1>
                <p>
                    فيكسورا يربط أصحاب المنازل بمحترفين موثوقين ومعتمدين لجميع أنواع الخدمات المنزلية. سواء كنت بحاجة إلى إصلاح سريع أو تجديد كبير، منصتنا تجعل من السهل العثور على الشخص المناسب للوظيفة.
                </p>
                <p>
                    نحن نتحقق بعناية من جميع المحترفين لدينا لضمان خدمة عالية الجودة وراحة البال لعملائنا. انضم إلى آلاف أصحاب المنازل الراضين الذين يثقون في فيكسورا لاحتياجات الخدمات المنزلية الخاصة بهم.
                </p>
            </section>
        </main>
    );
}

export default Body;