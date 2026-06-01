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
- **Advanced lookup selectors** — single and multi-record selection dialogs with search for relational fields
- **Dynamic multiselect support** — PrimeNG `p-multiselect` for static options and join-based multiple selections, including legacy metadata compatibility
- **Massive Modifications** — multi-step bulk editing flow to update many records inline with per-row or global save actions
- **Select Queries** — build and test named SQL-like query templates exposed as API endpoints
- **Conditions** — define filter rules applied at runtime to REST queries
- **Actions** — configure PRE/POST action hooks by metadata and operation (`PERSIST`, `MERGE`, `DELETE`)
- **Document & Image management** — upload, organise and preview files and images stored by the API
- **Document preview and filtering** — MIME-type multiselect filter, image modal preview, and video preview with loop toggle
- **Links** — manage URL mapping rules for the routing layer
- **Authentication & Authorization** — Keycloak login/logout, route guards, role/group checks, and UI permission gating via the `permit` directive
- **Monaco editor integration** — edit JSON, SQL and code payloads directly in the browser
- **TinyMCE rich-text editor** — full WYSIWYG editing for long-text fields
- **Google Maps components** — point and path pickers for geo-enabled metadata
- **Chat widget** — built-in Snello chat widget panel

## Authentication & Authorization

Snello Admin uses **Keycloak** as identity provider and applies authorization at both route and UI levels.

### Authentication

- Unauthenticated users are redirected to Keycloak login.
- User profile, roles and groups are loaded from the Keycloak token.
- Logout is handled through Keycloak logout flow.

### Route Authorization

- **Role-protected routes** use route metadata (`data.roles`) and the global auth guard.
- **Group-protected routes** (content area) use `requiresGroup: true` and require at least one group in token claims.

### UI Authorization

- The `permit` directive conditionally renders UI blocks by ACL role list.
- Admin and content navigation entries are shown/hidden based on token roles.

### Content List/View Role Matrix

For content pages in form generation:

- **`contents_edit`** (or `admin`):
  - list page: can use **Add**, **Clone**, **Modify**, **View**
  - view page: can use **Edit**, **Clone**, **Gallery**
- **`contents_view`**:
  - list page: can use **View** only (no add/clone/modify)
  - view page: can use **Gallery** and **Back**

## Actions Management

The **Actions** area is used to configure server-side hooks linked to metadata lifecycle events.

### What You Can Configure

- **Name** and **Description**
- **Metadata target** (`metadata_name`)
- **Condition**: `PERSIST`, `MERGE`, `DELETE`
- **Phase**: `PRE`, `POST`
- **Body**: custom script/body payload executed by backend action engine

### List and Filtering

- Search by **name** and **metadata name**
- Filter by **condition** and **phase**
- Standard operations: **view** and **modify** existing actions, plus **add** new action

### Editor Help

- The edit page includes an **Info** dialog with a legend of available objects/services (`action`, `metadata`, `db`, `documents`, `mail`, etc.) and related callable functions.

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
| `date` | Date Picker | Date selector (format `yyyy-MM-dd`); supports `now()` (create-only) or `always_now()` (create + update) as default |
| `datetime` | Datetime Picker | Date + time selector; supports `now()` (create-only) or `always_now()` (create + update) as default |
| `time` | Time Picker | Time-only selector |
| `select` | Dropdown | Fixed list of options defined in the `options` field |
| `multiselect` | MultiSelect | Multi-value fixed option list rendered with PrimeNG multi-select |
| `tags` | Tag input | Free-text comma-separated tag list |
| `join` | Join Select | Single-value foreign key: resolves values from another metadata table |
| `lookup` | Lookup Dialog | Single-value relational selector with searchable modal picker |
| `multijoin` | Multi-Join Select | Multi-value foreign key from another metadata table |
| `multilookup` | Multi Lookup Dialog | Multi-value relational selector with searchable modal picker |
| `realtionships` | Relationships | Embedded list of related records from a linked metadata table |
| `media` | Media Upload | File/document upload linked to the document storage |
| `image` | Image Upload | Image upload with preview; supports derived format generation |
| `gmaplocation` | Map Point Picker | Geo-point selector on Google Maps |
| `gmappath` | Map Path Picker | Geo-path (polyline) selector on Google Maps |

### Common Field Options

- **`label`** — display label shown in forms
- **`mandatory`** — marks the field as required (form validation)
- **`default_value`** — pre-filled value; for `date`/`datetime`:
  - use `now()` to set current date/time only during creation
  - use `always_now()` to set current date/time both during creation and every update
- **`show_in_list`** — whether the column appears in list views
- **`searchable`** — enables the field as a search filter
- **`group_name`** / **`tab_name`** — organise fields into collapsible fieldsets or tabs within the form
- **`order_num`** — controls display order
- **`options`** — comma-separated option list (used by `select` and `multiselect`)
- **`join_table_name`** / **`join_table_key`** / **`join_table_select_fields`** — configuration for `join`, `lookup`, `multijoin`, and `multilookup`
- **`sql_type`** / **`sql_definition`** — (advanced) override the underlying SQL column type or definition
- **`pattern`** — validation regex pattern

## Additional Implemented Features

- **Clone existing records** — from view/list flows, a new create form can be opened with `clone_uuid`, prefilled from an existing record while resetting primary key fields.
- **Massive create in form generation** — the create route accepts `massive=true` and injects virtual fields (`date min`, `date max`, `cron expression`) to generate multiple records in one save.
- **Massive date preview dialog** — cron occurrences are previewable before saving in massive mode.
- **Multiselect legacy compatibility** — if legacy metadata stores a multiselect-like field as `type=select` and missing `input_type`, the UI falls back to multiselect behavior for known legacy naming patterns.
- **Metadata visibility by group** — non-admin/non-manager users see only metadata linked to their Keycloak groups in homepage and content sidebar.
- **Auth administration pages** — dedicated management pages for auth users and auth groups (`/auth-users`, `/auth-groups`).
- **Chat interactions history** — admin-only page to inspect stored chat interactions.

## Quick Start

```bash
npm install
ng serve --proxy-config proxy.conf.json
```

The app will be available at `http://localhost:4200`.  
API calls are proxied to `https://snello.io` by default (see [Proxy Configuration](#proxy-configuration) below).

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
| `proxy.conf.json` | `https://snello.io` | Running against the live/staging API |
| `proxy.conf-local.json` | `http://localhost:8080` | Running the API locally |

To develop against a local Snello API instance:

```bash
ng serve --proxy-config proxy.conf-local.json
```

Both configs forward `/api` and `/files` paths to the configured backend.

