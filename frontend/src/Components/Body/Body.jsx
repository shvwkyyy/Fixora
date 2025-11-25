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
        </main>
    );
}

export default Body;