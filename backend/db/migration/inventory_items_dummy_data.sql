--
-- PostgreSQL database dump
--

\restrict zaNKEdSnXBuT3u0EpvaV7xt0cnfSM89x36LKX2ZimSpBSGSnAjIme6LL2zGCgXz

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
-- Data for Name: inventory_items; Type: TABLE DATA; Schema: ngabengkel; Owner: postgres
--

INSERT INTO ngabengkel.inventory_items VALUES ('i2                                  ', 'sparepart', 'Kampas Rem', 'KP2', 'Honda', 'Mobil', 'pcs', 30, 30000.00);
INSERT INTO ngabengkel.inventory_items VALUES ('i3                                  ', 'oli', 'Oli Gardan', 'KP3', 'Shell', 'Mobil', 'botol', 40, 400000.00);
INSERT INTO ngabengkel.inventory_items VALUES ('i4                                  ', 'sparepart', 'Ban', 'KP4', 'IRC', 'Mobil', 'pcs', 20, 150000.00);
INSERT INTO ngabengkel.inventory_items VALUES ('i5                                  ', 'sparepart', 'Lampu', 'KP5', 'Osram', 'Mobil', 'pcs', 25, 70000.00);
INSERT INTO ngabengkel.inventory_items VALUES ('i1                                  ', 'sparepart', 'Oli Mesin', 'KP1', 'Shell', 'Mobil', 'botol', 50, 50000.00);


--
-- PostgreSQL database dump complete
--

\unrestrict zaNKEdSnXBuT3u0EpvaV7xt0cnfSM89x36LKX2ZimSpBSGSnAjIme6LL2zGCgXz

