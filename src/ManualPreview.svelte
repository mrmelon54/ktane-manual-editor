<script lang="ts">
  const updateAttributeLinks = ["src", "xlink\\:href", "href"];

  export let source: string;
  export let darkTheme: boolean;

  let previewFrame: HTMLIFrameElement;

  let safeCode = undefined;
  $: safeCode = convertToSafeCode(source);

  $: {
    localStorage.setItem("ktane-dark-mode", "" + darkTheme);
    if (previewFrame) previewFrame.contentWindow?.location.reload();
  }

  function convertToSafeCode(code: string): string {
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
</script>

<iframe src="/blank.html" srcdoc={safeCode} sandbox="allow-scripts allow-same-origin" title="" class="preview-frame" bind:this={previewFrame}></iframe>

<style>
  .preview-frame {
    width: 100%;
    height: 100%;
    border: none;
  }
</style>
