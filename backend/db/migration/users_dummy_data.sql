--
-- PostgreSQL database dump
--

\restrict 3zt6Plk5qcEfQckQLtu1PexqDDItp7kT1v6egBKyIY5eKpu5y1vphj59h6nlu1C

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
-- Data for Name: users; Type: TABLE DATA; Schema: ngabengkel; Owner: postgres
--

INSERT INTO ngabengkel.users VALUES ('u1                                  ', 'Bowo', 'bowo@mail.com', '0811', 'pass', 'token1', 'customer', '2026-04-17 09:45:00.827868');
INSERT INTO ngabengkel.users VALUES ('u2                                  ', 'Andi', 'andi@mail.com', '0812', 'pass', 'token2', 'customer', '2026-04-17 09:59:04.070966');
INSERT INTO ngabengkel.users VALUES ('u3                                  ', 'Adil', 'adil@mail.com', '0813', 'pass', 'token3', 'admin', '2026-04-17 09:59:04.070966');
INSERT INTO ngabengkel.users VALUES ('u4                                  ', 'Joko', 'joko@mail.com', '0814', 'pass', 'token4', 'customer', '2026-04-17 09:59:04.070966');
INSERT INTO ngabengkel.users VALUES ('u5                                  ', 'Rina', 'rina@mail.com', '0815', 'pass', 'token5', 'customer', '2026-04-17 09:59:04.070966');


--
-- PostgreSQL database dump complete
--

\unrestrict 3zt6Plk5qcEfQckQLtu1PexqDDItp7kT1v6egBKyIY5eKpu5y1vphj59h6nlu1C

