// Khai báo cho phép import các file tsx/jsx
declare module '*.tsx' {
  import React from 'react';
  const component: React.ComponentType<unknown>;
  export default component;
}

declare module '*.jsx' {
  import React from 'react';
  const component: React.ComponentType<unknown>;
  export default component;
} 