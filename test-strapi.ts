import { getHomepage } from './src/lib/strapi';
getHomepage()
  .then(res => console.log('Success:', res))
  .catch(err => console.error('Error:', err));
