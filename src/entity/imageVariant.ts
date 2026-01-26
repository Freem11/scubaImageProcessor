export type ImageVariant = {
  name:   string   // 'small', 'medium', 'large'
  path:   string   // where the image is stored locally
  format: string   // 'jpg', 'png', 'webp'
  width:  number   // width in pixels
  params: string[] // imageMagick parameters to use
};
