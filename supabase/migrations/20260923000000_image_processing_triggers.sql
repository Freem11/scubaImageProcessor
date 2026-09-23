-- =============================================================================
-- Image Processing Triggers
-- Fires the `process-image` edge function when a photo is added to an entity
-- table that doesn't yet have a processed image_id.
--
-- Each trigger passes { "table": "<tableName>", "record": { ...row } } to the
-- edge function so a single function handles all entity types.
--
-- Prerequisites: pg_net extension must be enabled (it is by default on Supabase)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Shared trigger function
-- Called by all per-table triggers. Reads the table name from TG_TABLE_NAME
-- so no per-table logic lives here. Uses Supabase's built-in postgres settings
-- for the project URL and service role key — no manual setup needed.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION invoke_process_image()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  edge_function_url text;
  webhook_secret    text;
  payload           jsonb;
BEGIN
  edge_function_url := 'https://YOUR-APP.railway.app/process-image';
  webhook_secret    := 'YOUR-WEBHOOK-SECRET'; -- match this in Railway WEBHOOK_SECRET env var

  payload := jsonb_build_object(
    'table',  TG_TABLE_NAME,
    'type',   TG_OP,
    'record', row_to_json(NEW)::jsonb
  );

  PERFORM net.http_post(
    edge_function_url,
    payload,
    '{}'::jsonb,
    jsonb_build_object(
      'Content-Type',     'application/json',
      'x-webhook-secret', webhook_secret
    )
  );

  RETURN NEW;
END;
$$;


-- ---------------------------------------------------------------------------
-- diveSiteReviewPhotos
-- Fires on INSERT or UPDATE when photoPath is set and image_id is not yet set
-- ---------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_process_image_dive_site_review_photos ON "diveSiteReviewPhotos";

CREATE TRIGGER trg_process_image_dive_site_review_photos
AFTER INSERT OR UPDATE
ON "diveSiteReviewPhotos"
FOR EACH ROW
WHEN (
  NEW.image_id IS NULL AND
  NEW."photoPath" IS NOT NULL AND
  NEW."photoPath" <> ''
)
EXECUTE FUNCTION invoke_process_image();


-- ---------------------------------------------------------------------------
-- diveSites
-- Fires on INSERT or UPDATE when diveSiteProfilePhoto is set and image_id is not yet set
-- ---------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_process_image_dive_sites ON "diveSites";

CREATE TRIGGER trg_process_image_dive_sites
AFTER INSERT OR UPDATE
ON "diveSites"
FOR EACH ROW
WHEN (
  NEW.image_id IS NULL AND
  NEW."diveSiteProfilePhoto" IS NOT NULL AND
  NEW."diveSiteProfilePhoto" <> ''
)
EXECUTE FUNCTION invoke_process_image();


-- ---------------------------------------------------------------------------
-- shops
-- Fires on INSERT or UPDATE when diveShopProfilePhoto is set and image_id is not yet set
-- ---------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_process_image_shops ON "shops";

CREATE TRIGGER trg_process_image_shops
AFTER INSERT OR UPDATE
ON "shops"
FOR EACH ROW
WHEN (
  NEW.image_id IS NULL AND
  NEW."diveShopProfilePhoto" IS NOT NULL AND
  NEW."diveShopProfilePhoto" <> ''
)
EXECUTE FUNCTION invoke_process_image();


-- ---------------------------------------------------------------------------
-- UserProfiles
-- Fires on INSERT or UPDATE when profilePhoto is set and image_id is not yet set
-- ---------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_process_image_user_profiles ON "UserProfiles";

CREATE TRIGGER trg_process_image_user_profiles
AFTER INSERT OR UPDATE
ON "UserProfiles"
FOR EACH ROW
WHEN (
  NEW.image_id IS NULL AND
  NEW."profilePhoto" IS NOT NULL AND
  NEW."profilePhoto" <> ''
)
EXECUTE FUNCTION invoke_process_image();


-- ---------------------------------------------------------------------------
-- photos (sealife)
-- Fires on INSERT or UPDATE when photoFile is set and image_id is not yet set
-- ---------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_process_image_photos ON "photos";

CREATE TRIGGER trg_process_image_photos
AFTER INSERT OR UPDATE
ON "photos"
FOR EACH ROW
WHEN (
  NEW.image_id IS NULL AND
  NEW."photoFile" IS NOT NULL AND
  NEW."photoFile" <> ''
)
EXECUTE FUNCTION invoke_process_image();
