# Snello Admin

![Snello Logo](docs/snello-logo.svg)

[![Angular](https://img.shields.io/badge/Angular-21.2.7-DD0031?logo=angular&logoColor=white)](https://angular.io/)
[![Node](https://img.shields.io/badge/Node-v24.11.1-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

Snello Admin is the Angular-based management interface for the [Snello CMS API](https://github.com/snello-cms/snello-api).  
It provides a full UI to configure and manage every aspect of the headless CMS without writing a single line of backend code.

## Features

- **Metadata management** — create and edit tables, configure columns, set display options and icons
- **Field Definitions** — define custom field types with validation rules and UI components
- **Dynamic Forms** — auto-generated create/edit forms driven by field definitions
- **Massive Modifications** — multi-step bulk editing flow to update many records inline with per-row or global save actions
- **Select Queries** — build and test named SQL-like query templates exposed as API endpoints
- **Conditions** — define filter rules applied at runtime to REST queries
- **Document & Image management** — upload, organise and preview files and images stored by the API
- **Links** — manage URL mapping rules for the routing layer
- **User & Role management** — administer users, assign roles and control permissions via the `permit` directive
- **Monaco editor integration** — edit JSON, SQL and code payloads directly in the browser
- **TinyMCE rich-text editor** — full WYSIWYG editing for long-text fields
- **Google Maps components** — point and path pickers for geo-enabled metadata
- **Chat widget** — built-in Snello chat widget panel

## Massive Modifications

The **Massive Modifications** area is designed for fast bulk updates on existing data records.

### Workflow

1. Open `/massive/metadata` and choose the metadata table to work on.
2. Continue to `/massive/attributes/:name` and select the fields you want to edit.
3. Open `/massive/edit/:name` to edit values directly in a paginated table.

### What You Can Do

- **Inline editing by field type** — selected fields are rendered with the same dynamic field system used across the app.
- **Save per row** — each row has a dedicated save action.
- **Save all modified rows** — persist all pending edits in one action with progress feedback.
- **Save and exit** — save pending changes and return to the admin home.
- **Unsaved change awareness** — the UI tracks modified rows and warns before leaving with pending edits.

### Notes

- The feature uses the same field-definition resolver logic as form generation routes.
- Selected attributes are preserved between steps via router state and session storage fallback.

## Field Definition Types

Each **Field Definition** defines how a column is rendered in forms and list views. The following types are available:

| Type | UI Component | Description |
|---|---|---|
| `string` | Text input | Single-line text field (`type="text"`) |
| `number` | Text input | Numeric integer field (`type="number"`) |
| `decimal` | Text input | Decimal / floating-point field |
| `password` | Text input | Password field with masked input |
| `email` | Text input | Email field with format validation |
| `text` | Textarea | Multi-line plain text area |
| `tinymce` | TinyMCE | Rich-text / HTML WYSIWYG editor |
| `monaco` | Monaco Editor | Code editor (JSON, SQL, etc.) with syntax highlighting |
| `boolean` | Checkbox | True/false toggle |
| `date` | Date Picker | Date selector (format `yyyy-MM-dd`); supports `now()` as default |
| `datetime` | Datetime Picker | Date + time selector; supports `now()` as default |
| `time` | Time Picker | Time-only selector |
| `select` | Dropdown | Fixed list of options defined in the `options` field |
| `tags` | Tag input | Free-text comma-separated tag list |
| `join` | Join Select | Single-value foreign key: resolves values from another metadata table |
| `multijoin` | Multi-Join Select | Multi-value foreign key from another metadata table |
| `realtionships` | Relationships | Embedded list of related records from a linked metadata table |
| `media` | Media Upload | File/document upload linked to the document storage |
| `image` | Image Upload | Image upload with preview; supports derived format generation |
| `gmaplocation` | Map Point Picker | Geo-point selector on Google Maps |
| `gmappath` | Map Path Picker | Geo-path (polyline) selector on Google Maps |

### Common Field Options

- **`label`** — display label shown in forms
- **`mandatory`** — marks the field as required (form validation)
- **`default_value`** — pre-filled value; for `date`/`datetime` use `now()`
- **`show_in_list`** — whether the column appears in list views
- **`searchable`** — enables the field as a search filter
- **`group_name`** / **`tab_name`** — organise fields into collapsible fieldsets or tabs within the form
- **`order_num`** — controls display order
- **`options`** — comma-separated option list (used by `select`)
- **`join_table_name`** / **`join_table_key`** / **`join_table_select_fields`** — configuration for `join` and `multijoin` types
- **`sql_type`** / **`sql_definition`** — (advanced) override the underlying SQL column type or definition
- **`pattern`** — validation regex pattern

## Quick Start

```bash
npm install
ng serve --proxy-config proxy.conf.json
```

The app will be available at `http://localhost:4200`.  
API calls are proxied to `https://kayak.love` by default (see [Proxy Configuration](#proxy-configuration) below).

## Build for Production

```bash
npm install
ng build --configuration production --base-href / --deploy-url /
```

The output is placed in `dist/`. It can be served by any static web server or bundled with the provided Docker image.

## Docker

```bash
docker build -f docker/Dockerfile -t snello-admin .
```

---

## Developer Notes

### Node Version

This project requires **Node v24.11.1**. Use [nvm](https://github.com/nvm-sh/nvm) to switch:

```bash
nvm use v24.11.1
```

If `ng` is not globally available, use the local CLI:

```bash
node_modules/@angular/cli/bin/ng serve --proxy-config proxy.conf.json
```

### Proxy Configuration

Two proxy configs are provided:

| File | Target | When to use |
|---|---|---|
| `proxy.conf.json` | `https://kayak.love` | Running against the live/staging API |
| `proxy.conf-local.json` | `http://localhost:8080` | Running the API locally |

To develop against a local Snello API instance:

```bash
ng serve --proxy-config proxy.conf-local.json
```

Both configs forward `/api` and `/files` paths to the configured backend.

