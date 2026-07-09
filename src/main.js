import { createApp } from "vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";

import App from "./App.vue";
import router from "./router";

const origConsoleError = console.error;
console.error = function (...args) {
  const msg = typeof args[0] === 'string' ? args[0] : args[0]?.message || '';
  if (msg.includes('ResizeObserver')) return;
  return origConsoleError.apply(this, args);
};

const origConsoleWarn = console.warn;
console.warn = function (...args) {
  const msg = typeof args[0] === 'string' ? args[0] : args[0]?.message || '';
  if (msg.includes('ResizeObserver')) return;
  return origConsoleWarn.apply(this, args);
};

const app = createApp(App);
app.config.errorHandler = (err) => {
  if (err?.message?.includes('ResizeObserver')) return;
};
app.config.warnHandler = (msg) => {
  if (msg?.includes('ResizeObserver')) return;
};
app.use(router);
app.use(ElementPlus);
app.mount("#app");

window.addEventListener('error', (e) => {
  if (e?.message?.includes('ResizeObserver')) {
    e.stopImmediatePropagation();
    e.preventDefault();
  }
});

window.addEventListener('unhandledrejection', (e) => {
  if (e?.reason?.message?.includes('ResizeObserver')) {
    e.stopImmediatePropagation();
    e.preventDefault();
  }
});
