import React, { useEffect, useState } from 'react';
import { view, invoke } from '@forge/bridge';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export default function App() {
  const [spec, setSpec] = useState(null);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    invoke('getSettings').then((s) => { if (s['swagger-api-docs'] === false) setDisabled(true); });
    view.getContext().then((ctx) => {
      const config = ctx.extension.config || {};
      if (config.code) {
        try {
          setSpec(JSON.parse(config.code));
        } catch {
          setSpec(config.code);
        }
      }
    });
  }, []);

  if (disabled) return <p style={{ color: '#6b778c' }}>This macro has been disabled by your site administrator.</p>;
  if (!spec) return <p style={{ color: '#6b778c' }}>No API spec configured. Edit this macro to add an OpenAPI/Swagger spec.</p>;

  return <SwaggerUI spec={spec} />;
}
