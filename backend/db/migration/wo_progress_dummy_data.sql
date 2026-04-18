--
-- PostgreSQL database dump
--

\restrict ja6amgzWUfonwYCrFDebT9bfu7mkjcFSugHqCVBU3ZUZ2mB1wUCeI355IsgeokH

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
-- Data for Name: wo_progress; Type: TABLE DATA; Schema: ngabengkel; Owner: postgres
--

INSERT INTO ngabengkel.wo_progress VALUES ('p1                                  ', 'wo1                                 ', 'Cek mesin', 'check', 'url1', 10000.00, '2026-04-17 10:33:28.931264');
INSERT INTO ngabengkel.wo_progress VALUES ('p2                                  ', 'wo2                                 ', 'Perbaiki rem', 'repair', 'url2', 20000.00, '2026-04-17 10:33:28.931264');
INSERT INTO ngabengkel.wo_progress VALUES ('p3                                  ', 'wo3                                 ', 'Ganti ban', 'finish', 'url3', 0.00, '2026-04-17 10:33:28.931264');
INSERT INTO ngabengkel.wo_progress VALUES ('p4                                  ', 'wo4                                 ', 'Cek AC', 'check', 'url4', 15000.00, '2026-04-17 10:33:28.931264');
INSERT INTO ngabengkel.wo_progress VALUES ('p5                                  ', 'wo5                                 ', 'Ganti lampu', 'repair', 'url5', 5000.00, '2026-04-17 10:33:28.931264');


--
-- PostgreSQL database dump complete
--

\unrestrict ja6amgzWUfonwYCrFDebT9bfu7mkjcFSugHqCVBU3ZUZ2mB1wUCeI355IsgeokH

