
import type { Options } from '../entity/options.ts';
import fs from 'fs';
import path from 'path';
import type { ProjectConfig } from '../entity/projectConfig.ts';

export const initProjectConfig = (options: Options): ProjectConfig | null => {
  const projectName = options?.name;
  if (!projectName) {
    console.error(`Project name is not defined`);
    return null;
  }

  if (!options?.initialImageVariants?.length) {
    console.error(`Image variants are not defined for project ${options.name}`);
    return null;
  }

  // make sure destination folder exists for the project exists
  const fileRoot = path.join('files', projectName);
  const originalsPath = path.join(fileRoot, 'original');
  if (!fs.existsSync(originalsPath)) {
    fs.mkdirSync(originalsPath, { recursive: true });
  }

  // make sure destination folder exists for each variant
  const variantsPath = path.join(fileRoot, 'variants');
  const variants = [];
  for (const variant of options.initialImageVariants) {
    const variantPath = path.join(variantsPath, variant.name);
    if (!fs.existsSync(variantPath)) {
      fs.mkdirSync(variantPath, { recursive: true });
    }
    variants.push({
      ...variant,
      name:    variant.name,
      format:  variant.format ?? 'webp',
      path:    variantPath,
    });
  }

  return {
    name:            projectName,
    filesDirPath:    fileRoot,
    originalDirPath: originalsPath,
    variantsDirPath: variantsPath,
    variants,
  };
};
