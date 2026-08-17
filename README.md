# Sadrafars — Building Engineering Tariff Calculator

*[نسخه فارسی / Persian version](README-fa.md)*

A domain-specific web application that calculates official Iranian construction-engineering tariffs (نظام مهندسی) — survey, supervision, and design fees — including region-based rates and delay penalties.

## The problem

Iran's construction-engineering tariff schedule is genuinely complex: rates change by year, by discipline (civil, architecture, mechanical/electrical installations), by supervision grade (A–D, each with different coefficient splits), and by region. Engineers were computing these by hand from published tables — slow and error-prone, especially for supervision-renewal cases that require distributing a total fee across multiple disciplines by grade-specific coefficients.

## The solution

A FastAPI + server-rendered (Jinja) web app that encodes the full official tariff schedule as executable rules instead of static tables: land survey (stepped by area), engineering design and supervision fees, per-discipline coefficient splitting for renewals, and delay-penalty calculation — plus an interactive map of Sadra city for searching individual plots and zones, and authenticated user accounts to save and revisit calculations.

## Key features

- Multiple tariff calculators: land survey, engineering design/supervision, supervision renewal (with per-discipline, per-grade coefficient splitting), and delay penalties
- Interactive Leaflet map of Sadra city with searchable plots/zones (قطعه و ناحیه), feeding location-specific rates
- User accounts (register/login) with a personal dashboard for past calculations
- Server-rendered pages (fast, SEO-friendly, no heavy client-side framework needed for a tool like this)

## Tech stack

- **Python**, FastAPI, Jinja2 server-rendered templates
- **Leaflet** for the interactive district map
- **Tailwind CSS** for the frontend build pipeline
- Auth-protected API routes alongside the page routes

## Status

Live, deployed application — built for a specific professional audience (licensed construction engineers) with real, published tariff tables as the source of truth.
