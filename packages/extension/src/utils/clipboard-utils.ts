/* eslint-disable @typescript-eslint/no-explicit-any */
function setCaretPosition(element, caretPos) {
  if (element != null) {
    if (element.nodeType === 3) {
      element = element.parentNode;
    }
    if (element.createTextRange) {
      const range = element.createTextRange();
      range.move('character', caretPos);
      range.select();
    } else if (element.setSelectionRange) {
      element.focus();
      element.setSelectionRange(caretPos, caretPos);
    } else {
      const range = document.createRange();
      const selection = window.getSelection();

      range.setStart(element.childNodes[0], caretPos);
      range.collapse(true);

      selection?.removeAllRanges();
      selection?.addRange(range);
      // element.focus();
    }
  }
}

function isInput(element) {
  if (element.nodeType === 3) {
    element = element.parentNode;
  }
  return ['INPUT', 'TEXTAREA'].includes(element.tagName);
}

function isEditable(element) {
  if (element.nodeType === 3) {
    element = element.parentNode;
  }
  return isInput(element) || element.getAttribute('contenteditable') === 'true';
}

export class ClipboardUtils {
  static copy(text?: string) {
    if (text === undefined) {
      text = globalThis.getSelection()?.toString();
    }
    return new Promise((resolve) => {
      if (
        (globalThis as any).clipboardData &&
        (globalThis as any).clipboardData.setData
      ) {
        // IE specific code path to prevent textarea being shown while dialog is visible.
        (globalThis as any).clipboardData.setData('Text', text);
        return;
      }
      if (navigator.clipboard) {
        this.writeText(text!)
          .then(() => resolve(true))
          .catch(() => resolve(false));
        return;
      }
      if (
        document.queryCommandSupported &&
        document.queryCommandSupported('copy')
      ) {
        let textarea;
        if (text) {
          textarea = document.createElement('textarea');
          textarea.textContent = text;
          textarea.style.position = 'fixed'; // Prevent scrolling to bottom of page in MS Edge.
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.focus();
          textarea.select();
          textarea.setSelectionRange(0, 999999);
        }
        try {
          document.execCommand('copy'); // Security exception may be thrown by some browsers.
          resolve(true);
        } catch (ex) {
          console.warn('Copy to clipboard failed.', ex);
          resolve(false);
        } finally {
          if (textarea) {
            document.body.removeChild(textarea);
          }
        }
      }
    });
  }

  static paste(element?: Node | null) {
    if (element === undefined) {
      element = window.getSelection()?.focusNode;
      if (
        !isEditable(element) &&
        isEditable((element as any)?.firstElementChild)
      ) {
        element = (element as any)?.firstElementChild;
      }
    }
    return new Promise((resolve) => {
      if (
        !document.queryCommandSupported ||
        !document.queryCommandSupported('paste')
      ) {
        this.readText()
          .then((clipText) => {
            const selection = window.getSelection();
            let { anchorOffset = 0, focusOffset = 0 } = selection || {};
            if (anchorOffset > focusOffset) {
              const temp = focusOffset;
              focusOffset = anchorOffset;
              anchorOffset = temp;
            }
            if (isInput(element)) {
              const { selectionStart = 0, selectionEnd = 0 } =
                (element as HTMLInputElement) || {};
              anchorOffset = selectionStart || 0;
              focusOffset = selectionEnd || 0;
              const oldValue = (element as HTMLInputElement)?.value;
              const value = `${oldValue.substring(
                0,
                anchorOffset,
              )}${clipText}${oldValue.substring(focusOffset)}`;
              // element.value = value;

              const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                window.HTMLInputElement.prototype,
                'value',
              ).set;
              nativeInputValueSetter.call(element, value);
              const event = new Event('input', { bubbles: true });
              element.dispatchEvent(event);

              setCaretPosition(element, anchorOffset + clipText.length);
            } else {
              const oldValue = element.textContent;
              const value = `${oldValue.substring(
                0,
                anchorOffset,
              )}${clipText}${oldValue.substring(focusOffset)}`;
              element.textContent = value;
              setCaretPosition(element, anchorOffset + clipText.length);
            }
          })
          .then(() => resolve(true))
          .catch(() => resolve(false));
        return;
      }
      try {
        document.execCommand('paste'); // Security exception may be thrown by some browsers.
        resolve(true);
      } catch (ex) {
        console.warn('Paste from clipboard failed.', ex);
        resolve(false);
      }
    });
  }

  static readText() {
    return navigator.clipboard.readText();
  }

  static writeText(text: string) {
    return navigator.clipboard.writeText(text);
  }

  static async resolvePastedAsText(event) {
    const { items = [] } =
      event.clipboardData || event.originalEvent.clipboardData;
    const pastedData = [...items].find((item) => {
      if (item.kind === 'string' && item.type === 'text/plain') {
        return true;
      }
      return false;
    });
    const rawString = await new Promise((resolve) =>
      pastedData.getAsString(resolve),
    );
    return rawString;
  }
}
