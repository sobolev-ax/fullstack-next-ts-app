import React from 'react';

// код выполняется только в режиме разработки
// и только на клиенте
if (process.env.NODE_ENV === 'development' && typeof document !== 'undefined') {
    const whyDidYouRender = require('@welldone-software/why-did-you-render')

    whyDidYouRender(React, { trackAllPureComponents: true })
}

export {}
