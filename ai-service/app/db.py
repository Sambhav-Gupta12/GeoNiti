import os
import psycopg
from psycopg.rows import dict_row

def get_db_pool():
    # We are returning a connection for simple use case
    conn_str = os.getenv("DATABASE_URL")
    return psycopg.connect(conn_str, row_factory=dict_row)
