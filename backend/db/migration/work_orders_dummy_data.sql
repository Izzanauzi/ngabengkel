--
-- PostgreSQL database dump
--

\restrict fZbmXodW9DiRTHydgIH5eXzuSbWODSq7r0MHRdJinCyw3gewfD62aT0FBfFFvUX

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: work_orders; Type: TABLE DATA; Schema: ngabengkel; Owner: postgres
--

INSERT INTO ngabengkel.work_orders VALUES ('wo1                                 ', 'WO001', 'u1                                  ', 'k1                                  ', 'b1                                  ', 'm1                                  ', 'Servis mesin', 500000.00, 100000.00, 'open', '2026-04-17 10:15:08.221878');
INSERT INTO ngabengkel.work_orders VALUES ('wo2                                 ', 'WO002', 'u2                                  ', 'k2                                  ', 'b2                                  ', 'm2                                  ', 'Perbaiki rem', 300000.00, 800000.00, 'progress', '2026-04-17 10:15:08.221878');
INSERT INTO ngabengkel.work_orders VALUES ('wo3                                 ', 'WO003', 'u5                                  ', 'k4                                  ', 'b3                                  ', 'm3                                  ', 'Ganti ban', 200000.00, 50000.00, 'done', '2026-04-17 10:15:08.221878');
INSERT INTO ngabengkel.work_orders VALUES ('wo4                                 ', 'WO004', 'u1                                  ', 'k3                                  ', 'b4                                  ', 'm4                                  ', 'Perbaiki AC', 400000.00, 90000.00, 'open', '2026-04-17 10:15:08.221878');
INSERT INTO ngabengkel.work_orders VALUES ('wo5                                 ', 'WO005', 'u2                                  ', 'k5                                  ', 'b5                                  ', 'm5                                  ', 'Lampu mati', 1500000.00, 300000.00, 'progress', '2026-04-17 10:15:08.221878');


--
-- PostgreSQL database dump complete
--

\unrestrict fZbmXodW9DiRTHydgIH5eXzuSbWODSq7r0MHRdJinCyw3gewfD62aT0FBfFFvUX

