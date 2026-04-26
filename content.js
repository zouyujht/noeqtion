console.log("Notion Math Converter content script loaded.");

const EQUATION_REGEX = /(\$\$[\s\S]*?\$\$|\$[^\$\n]*?\$)/;
const TIMING = {
  // Wait after focusing an editable block so Notion registers the focus (milliseconds)
  FOCUS: 50,
  // Short pause for quick UI updates between small operations (select/delete/insertText)
  QUICK: 20,
  // Wait after a conversion for Notion to update the DOM before rescanning/continuing
  POST_CONVERT: 300,
};

const api = typeof browser !== "undefined" ? browser : chrome;

// Event Listeners

api.runtime.onMessage.addListener((message) => {
  if (message.action === "convert") {
    convertMathEquations();
  }
});

document.addEventListener("keydown", (event) => {
  if (
    event.ctrlKey &&
    event.altKey &&
    (event.key === "M" || event.key === "m")
  ) {
    event.preventDefault();
    convertMathEquations();
  }
});

// Main Conversion Flow

async function convertMathEquations() {
  // Hide the text action menu to reduce visual distraction during conversion.
  injectCSS(
    ".notion-text-action-menu { opacity: 0 !important; transform: scale(0.001) !important; pointer-events: none !important; }"
  );

  while (true) {
    const equations = findEquations();

    if (equations.length === 0) {
      break;
    }

    await convertSingleEquation(equations[0]);
  }

  // Remove the injected style
  const styleTag = document.getElementById("notion-math-converter-hide-dialog");
  if (styleTag) {
    styleTag.remove();
  }
}

// Equation Conversion

async function convertSingleEquation({ node, equationText, startIndex }) {
  try {
    const editableParent = findEditableParent(node);
    if (!editableParent) {
      console.warn("Could not find editable parent");
      return;
    }

    editableParent.click();
    await delay(TIMING.FOCUS);

    selectText(node, startIndex, equationText.length);
    await delay(TIMING.QUICK);

    const selection = window.getSelection();
    if (!selection.rangeCount || selection.toString() !== equationText) {
      console.warn("Selection failed or doesn't match equation text");
      return;
    }

    const normalizedInput = normalizeEquationInput(node, equationText, startIndex);
    if (!normalizedInput) {
      console.warn("Could not normalize equation text:", equationText);
      return;
    }

    await convertEquationByTyping(normalizedInput);
  } catch (err) {
    console.error("Equation conversion failed:", err);
  }
}

async function convertEquationByTyping({ prefix, latexContent, suffix }) {
  const selection = window.getSelection();
  if (!selection.rangeCount || selection.isCollapsed) {
    console.warn("No text selected for equation conversion");
    return;
  }

  const parts = [prefix, "$$", latexContent, "$$", suffix].filter(Boolean);
  for (const part of parts) {
    document.execCommand("insertText", false, part);
    await delay(TIMING.QUICK);
  }

  await delay(TIMING.POST_CONVERT); // Wait for Notion to process the equation conversion
}

function normalizeEquationInput(node, equationText, startIndex) {
  const isDisplayEquation =
    equationText.startsWith("$$") && equationText.endsWith("$$");
  const latexContent = isDisplayEquation
    ? equationText.slice(2, -2).trim()
    : equationText.slice(1, -1).trim();

  if (!latexContent) {
    return null;
  }

  const endIndex = startIndex + equationText.length;
  const previousChar = startIndex > 0 ? node.nodeValue[startIndex - 1] : "";
  const nextChar =
    endIndex < node.nodeValue.length ? node.nodeValue[endIndex] : "";

  return {
    prefix: previousChar && !/\s/.test(previousChar) ? " " : "",
    latexContent,
    suffix: nextChar && !/\s/.test(nextChar) ? " " : "",
  };
}

// injects a style rule into the page's <head>.
function injectCSS(css) {
  const style = document.createElement("style");
  style.type = "text/css";
  style.id = "notion-math-converter-hide-dialog";
  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);
}

// Helper Functions

function findEquations() {
  const matches = [];
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  let node;
  while ((node = walker.nextNode())) {
    if (!node.nodeValue) {
      continue;
    }

    const match = node.nodeValue.match(EQUATION_REGEX);
    if (match && match[0]) {
      matches.push({
        node,
        equationText: match[0],
        startIndex: match.index ?? node.nodeValue.indexOf(match[0]),
      });
    }
  }

  return matches;
}

function findEditableParent(node) {
  let parent = node.parentElement;
  while (
    parent &&
    parent.getAttribute("data-content-editable-leaf") !== "true"
  ) {
    parent = parent.parentElement;
  }
  return parent;
}

function selectText(node, startIndex, length) {
  const range = document.createRange();
  range.setStart(node, startIndex);
  range.setEnd(node, startIndex + length);

  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
