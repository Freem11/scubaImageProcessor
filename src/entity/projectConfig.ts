import type { ImageVariant } from './imageVariant.ts';

/**
 * Detailed configuration based on provided options
 */
export type ProjectConfig =  {
  name:            string
  filesDirPath:    string
  originalDirPath: string
  variantsDirPath: string
  variants:        ImageVariant[]
};
