<script lang="ts">
    import { onMount } from "svelte";

    let loading = true;
    let forks: string | ArrayLike<any> = [];

    onMount(() => {
        window.addEventListener("message", async (event) => {
            const message = event.data;
            switch (message.type) {
                case "onForks":
                    forks = message.value;
                    const loadingElement = document.getElementById("loading");
                    if (loadingElement)
                        loadingElement.classList.remove("visible");
                    setTimeout(() => {
                        loading = false;
                    }, 300);
                    break;
            }
        });
    });
</script>

{#if loading}
    <div class="gameLoadingOverlay visible" id="loading">
        <span class="prefab_LoadingTextWithAnim" />
        <span class="prefab_GameHint">Forks! Forks! Forks!</span>
    </div>
{/if}
<div class="forks" id="forks">
    {#each forks as fork}
        <!-- svelte-ignore missing-declaration -->
        <div
            class="fork"
            on:click={() =>
                tsvscode.postMessage({
                    type: "openUrl",
                    value: fork.html_url,
                })}
        >
            <div class="owner">
                <img
                    src={fork.owner.avatar_url}
                    alt={fork.owner.login}
                    class="avatar"
                />
                <!-- svelte-ignore missing-declaration -->
                <div
                    on:click={() =>
                        tsvscode.postMessage({
                            type: "onOpenUrl",
                            value: fork.owner.html_url,
                        })}
                    class="name"
                >
                    {fork.owner.login}
                </div>
            </div>
            <div class="updated">
                Last updated: {new Date(
                    fork.updated_at
                ).getFullYear()}-{new Date(
                    fork.updated_at
                ).getMonth()}-{new Date(fork.updated_at).getDate()}
            </div>
        </div>
    {/each}
</div>
