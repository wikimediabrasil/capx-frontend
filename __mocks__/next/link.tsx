import React from 'react';

function Link({ children, href = '', ...rest }: any) {
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}

export default Link;
