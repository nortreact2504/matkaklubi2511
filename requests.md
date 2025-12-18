# Project info
- Express/JS app; endpoints in `index.js`; controllers in `controllers/`; data ops in `model/` (file or Mongo).

# Hike list flow (GET /api/matk)
- Route: `GET /api/matk` -> `apiAllHikesCntr`.
- Controller: calls `getHikesModel()` to load hikes, returns trimmed JSON array `{id, nimetus, kirjeldus, osalejateArv}`.
- Data source: `model/hikesMongoDb.js` loads from MongoDB `hikes` collection.

```mermaid
sequenceDiagram
    participant Client
    participant Express as Express router
    participant Controller as apiAllHikesCntr
    participant Model as getHikesModel
    participant DB as MongoDB hikes collection

    Client->>Express: GET /api/matk
    Express->>Controller: invoke apiAllHikesCntr
    Controller->>Model: await getHikesModel()
    Model->>DB: find() on hikes collection
    DB-->>Model: array of hikes
    Model-->>Controller: hikes[]
    Controller-->>Client: 200 JSON [{id,nimetus,kirjeldus,osalejateArv}]
```

