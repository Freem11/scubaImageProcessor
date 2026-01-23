import type { Options } from './src/entity/options.ts';
import { ScubaProcessor } from './src/processor/basic/scubaProcessor.ts';
import { initProjectConfig } from './src/util/initProjectConfig.ts';

const options: Options = {
  name:                 'scubaseasons',
  initialImageVariants: [
    {
      name:    'sm',
      format:  'webp',
      width:   240,
      params: ['-strip',  '-quality', '75'],
    },
    {
      name:    'md',
      format:  'webp',
      width:   480,
      params: ['-strip', '-quality', '75'],
    },
    {
      name:    'lg',
      format:  'webp',
      width:   960,
      params: ['-strip', '-quality', '75'],
    },
    {
      name:    'xl',
      format:  'webp',
      width:   1920,
      params: ['-strip', '-quality', '75'],
    },
  ],
};

const projectConfig = initProjectConfig(options);
const processor = new ScubaProcessor(projectConfig);

const processedImages = await processor.process();
