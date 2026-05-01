--
-- PostgreSQL database dump
--

\restrict fvfxanoxDwkSdyiEVcAepgRZjfcp1SQQ446TGcknStblId7KrfCCp1uvS24snMs

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
-- Data for Name: queue; Type: TABLE DATA; Schema: ngabengkel; Owner: postgres
--

INSERT INTO ngabengkel.queue VALUES ('q1                                  ', 'wo1                                 ', 'waiting', '2026-04-17 10:32:55.709362');
INSERT INTO ngabengkel.queue VALUES ('q2                                  ', 'wo2                                 ', 'process', '2026-04-17 10:32:55.709362');
INSERT INTO ngabengkel.queue VALUES ('q3                                  ', 'wo3                                 ', 'done', '2026-04-17 10:32:55.709362');
INSERT INTO ngabengkel.queue VALUES ('q4                                  ', 'wo4                                 ', 'waiting', '2026-04-17 10:32:55.709362');
INSERT INTO ngabengkel.queue VALUES ('q5                                  ', 'wo5                                 ', 'process', '2026-04-17 10:32:55.709362');


--
-- PostgreSQL database dump complete
--

\unrestrict fvfxanoxDwkSdyiEVcAepgRZjfcp1SQQ446TGcknStblId7KrfCCp1uvS24snMs

