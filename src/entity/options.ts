import type { ImageVariant } from './imageVariant.ts';

/**
 * User can define variant with any allowed variant properties
 * but name and params are required
 */
type UserVariant = Required<Pick<ImageVariant, 'name' | 'params'>> &
  Partial<Omit<ImageVariant, 'name' | 'params'>>;

/**
 * Initial options for image processing:
 * how many variants should be created
 * and their parameters
 */
export type Options =  {
  /**
  * Potentially we can have different image processors
  * for different projects
  */
  name:                 string
  initialImageVariants: UserVariant[]
};
