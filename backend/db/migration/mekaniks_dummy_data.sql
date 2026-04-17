--
-- PostgreSQL database dump
--

\restrict gX5485NNghrqJYeV6qGaAURlVuhyESsKdBtPk6l59BaGk1FdtGh3re0naiEesWc

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
-- Data for Name: mekaniks; Type: TABLE DATA; Schema: ngabengkel; Owner: postgres
--

INSERT INTO ngabengkel.mekaniks VALUES ('m1                                  ', 'Dodo', '08121', 'Mesin', 'aktif');
INSERT INTO ngabengkel.mekaniks VALUES ('m2                                  ', 'Agus', '08122', 'Kelistrikan', 'aktif');
INSERT INTO ngabengkel.mekaniks VALUES ('m3                                  ', 'Rudi', '08123', 'Ban', 'aktif');
INSERT INTO ngabengkel.mekaniks VALUES ('m4                                  ', 'Tono', '08124', 'Body', 'nonaktif');
INSERT INTO ngabengkel.mekaniks VALUES ('m5                                  ', 'Eko', '08125', 'Umum', 'aktif');


--
-- PostgreSQL database dump complete
--

\unrestrict gX5485NNghrqJYeV6qGaAURlVuhyESsKdBtPk6l59BaGk1FdtGh3re0naiEesWc

