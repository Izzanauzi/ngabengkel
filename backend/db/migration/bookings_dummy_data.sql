--
-- PostgreSQL database dump
--

\restrict PDhIzP0DgEdQxuEnFMcrmvFPJLGftvSPXWCh12GI3cgolYbzjw0TyZSpJhhOZoI

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
-- Data for Name: bookings; Type: TABLE DATA; Schema: ngabengkel; Owner: postgres
--

INSERT INTO ngabengkel.bookings VALUES ('b1                                  ', 'u1                                  ', 'k1                                  ', '2026-04-17 10:14:15.037837', 'Mesin berisik', 'pending', NULL, '2026-04-17 10:14:15.037837');
INSERT INTO ngabengkel.bookings VALUES ('b2                                  ', 'u2                                  ', 'k2                                  ', '2026-04-17 10:14:15.037837', 'Rem blong', 'diterima', NULL, '2026-04-17 10:14:15.037837');
INSERT INTO ngabengkel.bookings VALUES ('b3                                  ', 'u5                                  ', 'k4                                  ', '2026-04-17 10:14:15.037837', 'Ban bocor', 'ditolak', 'Penuh', '2026-04-17 10:14:15.037837');
INSERT INTO ngabengkel.bookings VALUES ('b4                                  ', 'u1                                  ', 'k3                                  ', '2026-04-17 10:14:15.037837', 'AC rusak', 'pending', NULL, '2026-04-17 10:14:15.037837');
INSERT INTO ngabengkel.bookings VALUES ('b5                                  ', 'u2                                  ', 'k5                                  ', '2026-04-17 10:14:15.037837', 'Lampu mati', 'diterima', NULL, '2026-04-17 10:14:15.037837');


--
-- PostgreSQL database dump complete
--

\unrestrict PDhIzP0DgEdQxuEnFMcrmvFPJLGftvSPXWCh12GI3cgolYbzjw0TyZSpJhhOZoI

