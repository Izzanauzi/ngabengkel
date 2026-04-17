--
-- PostgreSQL database dump
--

\restrict CW5fFKey6fjXioQMGwwbaactRzNiBnCOxhjCKGXYFHWjBGQTssGFnVLBNoOOk11

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
-- Data for Name: transactions; Type: TABLE DATA; Schema: ngabengkel; Owner: postgres
--

INSERT INTO ngabengkel.transactions VALUES ('t1                                  ', 'wo1                                 ', 600000.00, 'cash', '2026-04-17 10:31:04.617341', '2026-04-17 10:31:04.617341', 'paid');
INSERT INTO ngabengkel.transactions VALUES ('t2                                  ', 'wo2                                 ', 380000.00, 'transfer', '2026-04-17 10:31:04.617341', '2026-04-17 10:31:04.617341', 'unpaid');
INSERT INTO ngabengkel.transactions VALUES ('t3                                  ', 'wo3                                 ', 250000.00, 'cash', '2026-04-17 10:31:04.617341', '2026-04-17 10:31:04.617341', 'paid');
INSERT INTO ngabengkel.transactions VALUES ('t4                                  ', 'wo4                                 ', 490000.00, 'qris', '2026-04-17 10:31:04.617341', '2026-04-17 10:31:04.617341', 'unpaid');
INSERT INTO ngabengkel.transactions VALUES ('t5                                  ', 'wo5                                 ', 180000.00, 'cash', '2026-04-17 10:31:04.617341', '2026-04-17 10:31:04.617341', 'paid');


--
-- PostgreSQL database dump complete
--

\unrestrict CW5fFKey6fjXioQMGwwbaactRzNiBnCOxhjCKGXYFHWjBGQTssGFnVLBNoOOk11

