export type Image = {
  /**
   * The id of the image in the `images` table
   * null if a new image
   */
  id:           number | null

  /**
   * The entity name (processor name) of what is currently being processed
   */
  entity:       string

  /**
   * The id of the entity currently being processed
   */
  entity_id:    number

  /**
   * Absolute path to the original image in the local file system (with file name)
   */
  originalPath: string

  /**
   * Just the file name without path
   */
  fileName:     string

  /**
   * The error that occurred while processing the image
   */
  error:        string | null
};
