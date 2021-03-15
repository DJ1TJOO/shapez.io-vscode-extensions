<script lang="ts">
    window.addEventListener("message", async (event) => {
        const message = event.data;
        switch (message.type) {
            case "url":
                const iframe = document.getElementById("tester-iframe");
                if (!iframe) break;
                iframe.setAttribute("href", message.url);
                break;
        }
    });
</script>

<iframe
    id="tester-iframe"
    title="Shapez.io"
    src="http://localhost:3005"
    frameborder="0"
/>
