<script lang="ts">
  import { run } from 'svelte/legacy';

  const updateAttributeLinks = ["src", "xlink\\:href", "href"];

  interface Props {
    source: string;
    darkTheme: boolean;
  }

  let { source, darkTheme }: Props = $props();

  let previewFrame: HTMLIFrameElement = $state();

  let safeCode = $state(undefined);


  function convertToSafeCode(code: string): string | undefined {
    if (code === "") return undefined;

    const parser = new DOMParser();
    const page = parser.parseFromString(code, "text/html");

    let baseEl = document.createElement("base");
    baseEl.href = "/proxy/HTML/";
    page.head.prepend(baseEl);
    updateAttributeLinks.forEach((x) => updateURLs(page, x));

    return page.documentElement.outerHTML;
  }

  function updateURLs(page: Document, attr: string) {
    let nodes = page.querySelectorAll("[" + attr + "]");
    nodes.forEach((x) => {
      let a = x.getAttribute(attr);
      if (a?.startsWith("https://ktane.timwi.de/")) x.setAttribute(attr, a.replace("https://ktane.timwi.de/", ""));
    });
  }
  run(() => {
    safeCode = convertToSafeCode(source);
  });
  run(() => {
    localStorage.setItem("ktane-dark-mode", "" + darkTheme);
    if (previewFrame) {
      if (darkTheme) previewFrame.contentDocument?.body.classList.add("dark");
      else previewFrame.contentDocument?.body.classList.remove("dark");
    }
  });
</script>

<iframe src="/blank.html" srcdoc={safeCode} sandbox="allow-scripts allow-same-origin" title="" class="preview-frame" bind:this={previewFrame}></iframe>

<style>
  .preview-frame {
    width: 100%;
    height: 100%;
    border: none;
  }
</style>
