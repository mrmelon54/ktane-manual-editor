<script lang="ts">
  import ManualDiff from "./ManualDiff.svelte";
  import ManualEditor from "./ManualEditor.svelte";
  import ManualPreview from "./ManualPreview.svelte";

  import { FileDiff } from "lucide-svelte";

  let showDiff: boolean = false;
  let manualName: string = "";

  let source: string = "";
  let originalSource: string = "";

  function loadManual() {
    let reg = /^(https\:\/\/ktane\.timwi\.de\/html\/)?([^\/]+)?(\.html)?$/i.exec(manualName);
    if (reg !== null) {
      manualName = reg[2];
    }
    if (manualName.indexOf("/") != -1) {
      alert("Invalid manual name");
      return;
    }
    fetch("/proxy/" + manualName + ".html")
      .then((x) => x.text())
      .then((x) => {
        source = x;
        originalSource = x;
      })
      .catch((x) => {
        console.error(x);
        alert("There was an error downloading the manual: " + manualName);
      });
  }

  function downloadManual() {
    let j = document.createElement("a");
    j.download = manualName + ".html";
    j.href = URL.createObjectURL(new Blob([source]));
    j.click();
  }
</script>

<header>
  <div class="left">
    <div class="title">KTaNE Manual Editor</div>
    <div class="filename">
      <label>Manual Name: <input bind:value={manualName} /><button on:click={() => loadManual()}>Load Manual</button></label>
      <button on:click={() => downloadManual()}>Download Manual</button>
    </div>
  </div>
  <div class="flex-gap" />
  <div class="right">
    <button on:click={() => (showDiff = !showDiff)} class:showDiff>
      <FileDiff />
    </button>
  </div>
</header>

<main>
  <div class="pane pane-editor">
    <ManualEditor bind:source />
  </div>
  <div class="pane pane-preview">
    <ManualPreview {source} />
  </div>
  <div class="pane pane-diff" class:show={showDiff}>
    <ManualDiff {originalSource} {source} />
  </div>
</main>

<style lang="scss">
  button {
    border: none;
    border-radius: 0;
  }

  .flex-gap {
    flex-grow: 1;
  }

  header {
    display: flex;
    flex-direction: row;

    > .left {
      display: flex;
      flex-direction: column;
    }

    > .right {
      display: block;
      margin: auto;

      > button {
        border: none;
        background: transparent;

        &.showDiff > :global(svg) {
          stroke: rgb(135, 101, 216);
        }
      }
    }
  }

  main {
    position: relative;
    justify-self: stretch;
    overflow: hidden;
    height: 100%;
    display: flex;
    flex-direction: row;
    flex-grow: 0;

    > .pane {
      width: 50%;
      height: 100%;
      background-color: #242424;

      &.pane-diff {
        position: absolute;
        top: 0;
        left: 100%;
        transition: all 500ms;

        &.show {
          left: 50%;
        }
      }
    }
  }
</style>
