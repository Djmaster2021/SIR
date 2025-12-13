import os
import time


def wait_mysql() -> None:
    import MySQLdb

    host = os.getenv("DB_HOST", "db")
    port = int(os.getenv("DB_PORT", "3306"))
    user = os.getenv("DB_USER", "root")
    password = os.getenv("DB_PASSWORD", "")
    db = os.getenv("DB_NAME", "")

    for _ in range(30):
        try:
            MySQLdb.connect(host=host, port=port, user=user, passwd=password, db=db)
            print("DB ready")
            return
        except Exception as exc:
            print("Esperando base de datos...", exc)
            time.sleep(2)
    raise SystemExit("DB no disponible")


if __name__ == "__main__":
    engine = os.getenv("DB_ENGINE", "mysql")
    if engine == "mysql":
        wait_mysql()
    else:
        # SQLite u otros motores no requieren espera explícita aquí.
        print(f"Sin espera: motor {engine}")
