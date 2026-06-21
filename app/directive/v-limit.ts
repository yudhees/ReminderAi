import type { Directive } from "vue";

type InputEl = HTMLInputElement & {
  __limitHandler__?: (e: InputEvent) => void;
  __afterInputHandler__?: (e: Event) => void;
};

const vLimit: Directive<InputEl, number> = {
  mounted(el, binding) {
    const limit = Number(binding.value) || 0;

    const handler = (e: InputEvent) => {
      const value = el.value;

      // Allow delete/backspace
      if (e.inputType?.startsWith("delete")) return;

      // Block if limit reached
      if (value.length >= limit) {
        e.preventDefault();
      }
    };

    const afterInput = (e: Event) => {
      let value = el.value;

      if (value.length > limit) {
        el.value = value.slice(0, limit);
        el.dispatchEvent(new Event("input"));
      }
    };

    el.__limitHandler__ = handler;
    el.__afterInputHandler__ = afterInput;

    el.addEventListener("beforeinput", handler);
    el.addEventListener("input", afterInput);
  },

  unmounted(el) {
    if (el.__limitHandler__) {
      el.removeEventListener("beforeinput", el.__limitHandler__);
    }
    if (el.__afterInputHandler__) {
      el.removeEventListener("input", el.__afterInputHandler__);
    }
  }
};

export default vLimit;